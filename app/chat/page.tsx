
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AuthModal } from '../components/AuthModal';
import { Settings, Plus, Trash2, Copy, Check, Search, Download, Volume2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Tauri services
import { isAuthenticated, fetchModels, signOut } from '@/lib/tauri/auth';
import { streamChat, generateTitle, type ChatMessage } from '@/lib/tauri/chat';
import * as db from '@/lib/tauri/db';
import { PERSONAS, DEFAULT_PERSONA_ID } from '@/lib/personas';

// Rotating placeholders
const PLACEHOLDERS = [
  "Say something...",
  "What's on your mind?",
  "The real version, not the polished one.",
  "Start anywhere.",
  "What are you avoiding?",
  "...",
  "Talk to me.",
  "No wrong answers.",
  "What would you say if nobody was listening?",
];

// Code block component with copy button
function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2a2a2a] rounded-t-lg border-b border-white/5">
        <span className="text-xs text-white/40 uppercase">{language}</span>
        <button
          onClick={copy}
          className="text-white/40 hover:text-white/80 transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem' }}
      >
        {children.replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}

// Format relative timestamps
function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export default function ChatPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [availableModels, setAvailableModels] = useState<{ id: string, name: string }[]>([]);
  const [conversations, setConversations] = useState<db.Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<db.Conversation[] | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Persona state
  const [selectedPersona, setSelectedPersona] = useState(DEFAULT_PERSONA_ID);

  // Placeholder rotation
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder
  useEffect(() => {
    setPlaceholderIndex(Math.floor(Math.random() * PLACEHOLDERS.length));
  }, [currentConversationId]);

  useEffect(() => {
    checkAuth();
    loadConversations();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchModels().then(setAvailableModels).catch(console.error);
    }
  }, [authenticated]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+N — new chat
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        createNewChat();
      }
      // Ctrl+B — toggle sidebar
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      // Ctrl+, — settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setShowSettings(prev => !prev);
      }
      // Ctrl+Shift+E — export current conversation
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        exportCurrentChat();
      }
      // Ctrl+K — search
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setSidebarOpen(true);
        setSearchOpen(prev => !prev);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      // / — focus input (when not already typing)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape — close modals
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        else if (searchOpen) { setSearchOpen(false); setSearchQuery(''); setSearchResults(null); }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSettings, searchOpen, currentConversationId]);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timeout = setTimeout(async () => {
      const results = await db.searchConversations(searchQuery);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const checkAuth = async () => {
    try {
      const authed = await isAuthenticated();
      setAuthenticated(authed);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAuth(false);
    }
  };

  const loadConversations = async () => {
    try {
      const convs = await db.getConversations();
      setConversations(convs);
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
  };

  const createNewChat = async () => {
    try {
      const conv = await db.createConversation(selectedModel);
      setCurrentConversationId(conv.id);
      setMessages([]);
      setPlaceholderIndex(Math.floor(Math.random() * PLACEHOLDERS.length));
      loadConversations();
      inputRef.current?.focus();
    } catch (e) {
      console.error('Failed to create conversation:', e);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const msgs = await db.getMessages(id);
      setMessages(msgs.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        created_at: m.created_at,
      })));
      setCurrentConversationId(id);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults(null);
    } catch (e) {
      console.error('Failed to load conversation:', e);
    }
  };

  const deleteConversationHandler = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await db.deleteConversation(id);
      setConversations(conversations.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error('Failed to delete conversation:', e);
    }
  };

  const exportCurrentChat = async () => {
    if (!currentConversationId) return;
    try {
      const md = await db.exportConversation(currentConversationId);
      if (!md) return;
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `serve-conversation-${currentConversationId.slice(0, 8)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export:', e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        submitMessage();
      }
    }
  };

  const submitMessage = async () => {
    if (!authenticated || !input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setIsLoading(true);

    // Create conversation if needed
    let convId = currentConversationId;
    if (!convId) {
      try {
        const conv = await db.createConversation(selectedModel);
        convId = conv.id;
        setCurrentConversationId(convId);
        loadConversations();
      } catch (e) {
        console.error('Failed to create conversation:', e);
        setIsLoading(false);
        return;
      }
    }

    // Add user message to UI immediately
    const now = new Date().toISOString();
    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      created_at: now,
    };

    const assistantMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      created_at: now,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);

    // Build message history for API
    const chatMessages: ChatMessage[] = [
      ...messages.map(m => ({ id: m.id, role: m.role, content: m.content })),
      { id: userMsg.id, role: 'user' as const, content: userMessage },
    ];

    // Variable typing rhythm state
    let tokenQueue: string[] = [];
    let processingQueue = false;

    const processTokenQueue = () => {
      if (processingQueue || tokenQueue.length === 0) return;
      processingQueue = true;

      const token = tokenQueue.shift()!;
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          updated[updated.length - 1] = { ...last, content: last.content + token };
        }
        return updated;
      });

      // Variable delay: longer for newlines/periods (pause), shorter for regular tokens
      let delay = 15; // base speed
      if (token.includes('\n\n')) delay = 80; // paragraph break pause
      else if (token.includes('\n')) delay = 40; // line break
      else if (token.endsWith('.') || token.endsWith('—')) delay = 50; // sentence end
      else if (token.endsWith('?') || token.endsWith('!')) delay = 60; // question/exclamation

      setTimeout(() => {
        processingQueue = false;
        processTokenQueue();
      }, delay);
    };

    // Stream the response
    await streamChat(
      chatMessages,
      selectedModel,
      convId,
      selectedPersona,
      // onToken — queue tokens for variable-rhythm delivery
      (token) => {
        tokenQueue.push(token);
        processTokenQueue();
      },
      // onDone
      async (fullResponse) => {
        // Flush remaining tokens immediately
        if (tokenQueue.length > 0) {
          const remaining = tokenQueue.join('');
          tokenQueue = [];
          processingQueue = false;
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + remaining };
            }
            return updated;
          });
        }

        setIsLoading(false);

        // Generate smart title after 2nd message (first user + first assistant)
        if (convId && messages.length <= 1 && fullResponse) {
          const allMsgs: ChatMessage[] = [
            ...chatMessages,
            { id: assistantMsg.id, role: 'assistant', content: fullResponse },
          ];
          const smartTitle = await generateTitle(allMsgs, selectedModel);
          if (smartTitle) {
            await db.updateConversationTitle(convId, smartTitle);
          }
        }

        loadConversations();
      },
      // onError
      (errorMsg) => {
        setError(errorMsg);
        setIsLoading(false);
        tokenQueue = [];
        processingQueue = false;
        if (errorMsg.includes('Unauthorized')) {
          setAuthenticated(false);
        }
        // Remove the empty assistant message
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant' && !updated[updated.length - 1].content) {
            updated.pop();
          }
          return updated;
        });
      },
    );
  };

  const displayedConversations = searchResults !== null ? searchResults : conversations;

  if (loadingAuth) return <div className="bg-[#0a0a0a] h-screen w-screen flex items-center justify-center text-white/20 text-sm">initializing...</div>;

  return (
    <div className="flex h-full bg-[#0a0a0a] text-white selection:bg-white/10 overflow-hidden">
      {!authenticated && <AuthModal onAuthenticated={() => setAuthenticated(true)} />}

      {/* Collapsible Sidebar */}
      <div className={`transition-all duration-300 ease-in-out flex flex-col border-r border-white/5 ${sidebarOpen ? 'w-64' : 'w-12'}`}>
        {/* Logo / Toggle */}
        <div className="h-14 flex items-center px-3 border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-xl font-light text-white/80 hover:text-white transition-colors"
            title="Toggle sidebar (Ctrl+B)"
          >
            ◈
          </button>
          {sidebarOpen && (
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                className="p-1.5 hover:bg-white/5 rounded transition-colors"
                title="Search (Ctrl+K)"
              >
                <Search className="w-4 h-4 text-white/40" />
              </button>
              <button
                onClick={createNewChat}
                className="p-1.5 hover:bg-white/5 rounded transition-colors"
                title="New chat (Ctrl+N)"
              >
                <Plus className="w-4 h-4 text-white/40" />
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {sidebarOpen && searchOpen && (
          <div className="px-3 py-2 border-b border-white/5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/30 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-white/5 border border-white/10 rounded-md pl-8 pr-8 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversations List */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto py-2">
            {displayedConversations.length === 0 ? (
              <div className="px-4 py-8 text-xs text-white/20 text-center italic">
                {searchQuery ? 'no results' : 'empty'}
              </div>
            ) : (
              displayedConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`group flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors ${currentConversationId === conv.id
                    ? 'text-white'
                    : 'text-white/30 hover:text-white/60'
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="truncate block italic">{conv.title || '...'}</span>
                    <span className="text-[10px] text-white/15">{timeAgo(conv.updated_at)}</span>
                  </div>
                  <button
                    onClick={(e) => deleteConversationHandler(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-white/80 transition-all flex-shrink-0"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="h-12 flex items-center justify-center px-6 relative">
          <span className="text-xs text-white/20 tracking-[0.2em]">SERVE</span>

          <div className="absolute right-6 flex items-center gap-1">
            {currentConversationId && (
              <button
                onClick={exportCurrentChat}
                className="p-2 text-white/20 hover:text-white/60 transition-colors"
                title="Export conversation (Ctrl+Shift+E)"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-white/20 hover:text-white/60 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {messages.length === 0 && !error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center select-none">
                <img src="/logo.png" alt="SERVE" className="w-24 h-24 opacity-20 mx-auto mb-4" />
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-8">
              {messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : ''}>
                  {m.role === 'user' ? (
                    <div className="max-w-[85%]">
                      <div className="text-white/60 text-sm leading-relaxed">{m.content}</div>
                      {m.created_at && <div className="text-[10px] text-white/10 mt-1 text-right">{timeAgo(m.created_at)}</div>}
                    </div>
                  ) : (
                    <div>
                      <div className="text-[15px] leading-[1.7] text-white/90" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
                        <ReactMarkdown
                          components={{
                            h1({ children }) { return <h1 className="text-lg font-normal text-white mt-6 mb-3">{children}</h1>; },
                            h2({ children }) { return <h2 className="text-base font-normal text-white mt-5 mb-2">{children}</h2>; },
                            h3({ children }) { return <h3 className="text-sm font-normal text-white mt-4 mb-2">{children}</h3>; },
                            ul({ children }) { return <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>; },
                            ol({ children }) { return <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>; },
                            li({ children }) { return <li className="text-white/80">{children}</li>; },
                            p({ children }) { return <p className="mb-4">{children}</p>; },
                            strong({ children }) { return <strong className="text-white font-normal">{children}</strong>; },
                            blockquote({ children }) { return <blockquote className="border-l border-white/20 pl-4 italic text-white/60 my-4">{children}</blockquote>; },
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
                              ) : (
                                <code className="bg-white/5 px-1.5 py-0.5 rounded text-sm font-mono text-white/70" {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                      {m.created_at && m.content && <div className="text-[10px] text-white/10 mt-1">{timeAgo(m.created_at)}</div>}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].content && (
                <div className="py-6 text-white/20 text-sm italic">
                  ...
                </div>
              )}
              {error && (
                <div className="text-sm text-red-400/80 py-2">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 pb-10">
          <div className="max-w-2xl mx-auto">
            {/* Persona Selector — only visible on empty conversations */}
            {messages.length === 0 && (
              <div className="flex items-center gap-2 mb-3 justify-center">
                {PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className={`group relative px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${selectedPersona === p.id
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-white/30 hover:text-white/50 border border-transparent hover:border-white/10'
                      }`}
                    title={p.description}
                  >
                    {p.name}
                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded text-[10px] text-white/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {p.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="relative">
              <textarea
                ref={inputRef}
                className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none overflow-hidden"
                placeholder={PLACEHOLDERS[placeholderIndex]}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ minHeight: '48px', maxHeight: '200px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/10">
              <span>Ctrl+N new · Ctrl+K search · / focus</span>
              <span>{selectedModel}{messages.length === 0 ? ` · ${PERSONAS.find(p => p.id === selectedPersona)?.name || 'SERVE'}` : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-light">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Model</label>
                <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  {/* Search Models */}
                  <div className="px-3 py-1.5 border-b border-white/5">
                    <input
                      type="text"
                      placeholder="Search models..."
                      className="w-full bg-transparent text-xs text-white placeholder:text-white/20 focus:outline-none"
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        const items = document.querySelectorAll('.model-item');
                        items.forEach((item: any) => {
                          const text = item.textContent?.toLowerCase() || '';
                          item.style.display = text.includes(val) ? 'block' : 'none';
                        });
                      }}
                    />
                  </div>

                  {/* Scrollable List */}
                  <div className="max-h-40 overflow-y-auto custom-scrollbar">
                    {availableModels.length > 0 ? availableModels.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModel(m.id)}
                        className={`model-item w-full text-left px-3 py-1.5 text-xs transition-colors border-b border-white/5 last:border-0 ${selectedModel === m.id
                          ? 'bg-white/10 text-white'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {m.name || m.id}
                      </button>
                    )) : (
                      <div className="px-3 py-2 text-xs text-white/30 text-center">No models available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Audio — Coming Soon */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Ambient Audio</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/3 border border-white/5 rounded-md">
                  <Volume2 className="w-3.5 h-3.5 text-white/20" />
                  <span className="text-xs text-white/30">Coming soon</span>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Shortcuts</label>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between text-white/30"><span>New chat</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Ctrl+N</kbd></div>
                  <div className="flex justify-between text-white/30"><span>Toggle sidebar</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Ctrl+B</kbd></div>
                  <div className="flex justify-between text-white/30"><span>Search</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Ctrl+K</kbd></div>
                  <div className="flex justify-between text-white/30"><span>Settings</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Ctrl+,</kbd></div>
                  <div className="flex justify-between text-white/30"><span>Export chat</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Ctrl+Shift+E</kbd></div>
                  <div className="flex justify-between text-white/30"><span>Focus input</span><kbd className="text-white/20 bg-white/5 px-1 rounded">/</kbd></div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <button
                  onClick={async () => {
                    await signOut();
                    setAuthenticated(false);
                    setMessages([]);
                    setCurrentConversationId(null);
                  }}
                  className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
