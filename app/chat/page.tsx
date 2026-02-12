
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AuthModal } from '../components/AuthModal';
import { Settings, Plus, Trash2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Tauri services
import { isAuthenticated, fetchModels, signOut } from '@/lib/tauri/auth';
import { streamChat, type ChatMessage } from '@/lib/tauri/chat';
import * as db from '@/lib/tauri/db';

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

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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

  // Chat state (replaces useChat)
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      loadConversations();
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
      })));
      setCurrentConversationId(id);
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
    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
    };

    const assistantMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);

    // Build message history for API
    const chatMessages: ChatMessage[] = [
      ...messages.map(m => ({ id: m.id, role: m.role, content: m.content })),
      { id: userMsg.id, role: 'user' as const, content: userMessage },
    ];

    // Stream the response
    await streamChat(
      chatMessages,
      selectedModel,
      convId,
      // onToken
      (token) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + token };
          }
          return updated;
        });
      },
      // onDone
      (_fullResponse) => {
        setIsLoading(false);
        loadConversations(); // Refresh sidebar for updated title
      },
      // onError
      (errorMsg) => {
        setError(errorMsg);
        setIsLoading(false);
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
            title="SERVE"
          >
            ◈
          </button>
          {sidebarOpen && (
            <button
              onClick={createNewChat}
              className="ml-auto p-1.5 hover:bg-white/5 rounded transition-colors"
            >
              <Plus className="w-4 h-4 text-white/40" />
            </button>
          )}
        </div>

        {/* Conversations List */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto py-2">
            {conversations.length === 0 ? (
              <div className="px-4 py-8 text-xs text-white/20 text-center italic">
                empty
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`group flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors ${currentConversationId === conv.id
                    ? 'text-white'
                    : 'text-white/30 hover:text-white/60'
                    }`}
                >
                  <span className="truncate flex-1 italic">{conv.title || '...'}</span>
                  <button
                    onClick={(e) => deleteConversationHandler(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-white/80 transition-all"
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

          <button
            onClick={() => setShowSettings(true)}
            className="absolute right-6 p-2 text-white/20 hover:text-white/60 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {messages.length === 0 && !error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-white/20">
                <p className="text-sm">What brings you here?</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-8">
              {messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : ''}>
                  {m.role === 'user' ? (
                    <div className="max-w-[85%] text-white/60 text-sm leading-relaxed">{m.content}</div>
                  ) : (
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
            <div className="relative">
              <textarea
                ref={inputRef}
                className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none overflow-hidden"
                placeholder="Say something..."
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
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-light">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Model</label>
                <div className="space-y-1">
                  {availableModels.length > 0 ? availableModels.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-colors ${selectedModel === m.id
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {m.name || m.id}
                    </button>
                  )) : (
                    <div className="px-3 py-2 text-sm text-white/30">No models available</div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={async () => {
                    await signOut();
                    setAuthenticated(false);
                    setMessages([]);
                    setCurrentConversationId(null);
                  }}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
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
