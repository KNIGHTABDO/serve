'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AuthModal } from '../components/AuthModal';
import { Settings, Plus, Trash2, Copy, Check, Search, Download, Volume2, X, Bookmark, ChevronRight, History, Quote, CornerDownRight, FileText, Layers, FolderOpen, Database, Menu, PauseCircle, Ear } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link';

// Web services (replaces Tauri)
import { isAuthenticated, fetchModels, signOut } from '@/lib/auth';
import { streamChat, generateTitle, type ChatMessage } from '@/lib/chat';
import * as db from '@/lib/db';
import { PERSONAS, DEFAULT_PERSONA_ID, getPersona } from '@/lib/personas';
import { resonance } from '@/lib/audio';
import { ingestDirectory, ingestFiles } from '@/lib/fs';

// Aesthetic utilities
import {
  formatPoeticTimestamp,
  formatPoeticTimeAgo,
  isEphemeralEnabled,
  setEphemeralEnabled,
  hasArtifact,
  analyzeSentiment,
  getWeightBorderClass,
  getWeightShadowClass,
  getDisciplineMode,
  setDisciplineMode,
  getDisciplinePlaceholder,
  getDisciplineInputClass,
  getDisciplineWarning,
  type DisciplineMode,
} from '@/lib/aesthetics';

// Aesthetic components
import {
  SilenceBetween,
  ThresholdStates,
  TheClearing,
  useClearingDiscovered,
  markClearingDiscovered,
  TheEcho,
  useEchoToggle,
  TheMargins,
  Farewell,
} from '@/app/components/aesthetics';
import type { Annotation } from '@/app/components/aesthetics';


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

// Format relative timestamps (poetic time)
function timeAgo(dateStr: string): string {
  return formatPoeticTimeAgo(dateStr);
}

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  threadFound?: boolean;
}

interface Artifact {
  id: string;
  title: string;
  content: string;
  type: 'insight' | 'parable' | 'reflection';
  timestamp: string;
}

export default function ChatPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reliquaryOpen, setReliquaryOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [availableModels, setAvailableModels] = useState<{ id: string, name: string }[]>([]);
  const [conversations, setConversations] = useState<db.Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  // Workspace state
  const [workspaces, setWorkspaces] = useState<db.Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [workspaceManagerOpen, setWorkspaceManagerOpen] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<db.Conversation[] | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Selection state
  const [selectionMenu, setSelectionMenu] = useState<{ x: number, y: number, text: string } | null>(null);
  const [activeQuote, setActiveQuote] = useState<string | null>(null);

  // Audio state
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Persona state
  const [selectedPersona, setSelectedPersona] = useState(DEFAULT_PERSONA_ID);
  const [fieldStudyContext, setFieldStudyContext] = useState<{ name: string, content: string } | null>(null);

  // Placeholder rotation
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Aesthetic state
  const [ephemeralMode, setEphemeralMode] = useState(false);
  const [disciplineMode, setDisciplineMode] = useState<DisciplineMode>('off');
  const [disciplineWarning, setDisciplineWarning] = useState<string | null>(null);
  const [clearingOpen, setClearingOpen] = useState(false);
  const [echoActive, toggleEcho] = useEchoToggle();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const clearingDiscovered = useClearingDiscovered();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize aesthetic preferences
  useEffect(() => {
    setEphemeralMode(isEphemeralEnabled());
    setDisciplineMode(getDisciplineMode());
  }, []);

  // Load annotations
  useEffect(() => {
    db.getAnnotations().then(setAnnotations).catch(console.error);
  }, []);

  const handleSelection = (e: MouseEvent) => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setSelectionMenu(null);
        return;
      }

      // Ensure the selection is within a message content area
      const target = e.target as HTMLElement;
      if (!target.closest('.message-content')) {
        setSelectionMenu(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const menuWidth = 160; // approximate menu width
      const menuHeight = 40; // approximate menu height
      let x = rect.left + rect.width / 2;
      let y = rect.top - 40;

      // Clamp to viewport boundaries
      const padding = 8;
      x = Math.max(menuWidth / 2 + padding, Math.min(x, window.innerWidth - menuWidth / 2 - padding));
      y = Math.max(menuHeight + padding, Math.min(y, window.innerHeight - padding));

      setSelectionMenu({
        x,
        y,
        text: selection.toString().trim()
      });
    }, 10);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const addSelectionToChat = () => {
    if (!selectionMenu) return;
    setActiveQuote(selectionMenu.text);
    setSelectionMenu(null);
    inputRef.current?.focus();
    
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  // Rotate placeholder
  useEffect(() => {
    const persona = getPersona(selectedPersona);
    setPlaceholderIndex(Math.floor(Math.random() * persona.placeholder.length));
  }, [currentConversationId, selectedPersona]);

  // Rotate placeholder text every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedPersona]);

  useEffect(() => {
    checkAuth();
    loadConversations();
    loadWorkspaces();

    // Listen for auth modal close to re-check auth state
    const handleAuthClose = () => {
      setLoadingAuth(false);
    };
    window.addEventListener('serve-auth-modal-close', handleAuthClose);
    return () => window.removeEventListener('serve-auth-modal-close', handleAuthClose);
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
      // Don't trigger shortcuts when typing in inputs
      const tag = document.activeElement?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') {
        // Still allow Escape
        if (e.key !== 'Escape') return;
      }

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
      // Ctrl+W — toggle workspaces
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        setWorkspaceManagerOpen(prev => !prev);
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
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && tag !== 'TEXTAREA' && tag !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape — close modals
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        else if (searchOpen) { setSearchOpen(false); setSearchQuery(''); setSearchResults(null); }
        else if (sidebarOpen && window.innerWidth < 768) setSidebarOpen(false);
        else if (clearingOpen) setClearingOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSettings, searchOpen, currentConversationId, sidebarOpen, clearingOpen]);

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

  const loadWorkspaces = async () => {
    try {
      const ws = await db.getWorkspaces();
      setWorkspaces(ws);
    } catch (e) {
      console.error('Failed to load workspaces:', e);
    }
  };

  const createNewChat = async () => {
    try {
      const conv = await db.createConversation(selectedModel, currentWorkspaceId);
      setCurrentConversationId(conv.id);
      setMessages([]);
      setPlaceholderIndex(Math.floor(Math.random() * getPersona(selectedPersona).placeholder.length));
      loadConversations();
      inputRef.current?.focus();
      // Close sidebar on mobile after creating new chat
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (e) {
      console.error('Failed to create conversation:', e);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const conv = await db.getConversation(id);
      const msgs = await db.getMessages(id);
      setMessages(msgs.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        created_at: m.created_at,
      })));
      setCurrentConversationId(id);
      setCurrentWorkspaceId(conv?.workspace_id || null);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults(null);
      // Close sidebar on mobile after selecting conversation
      if (window.innerWidth < 768) setSidebarOpen(false);
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

  const handleFieldStudyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFieldStudyContext({ name: file.name, content });
    };
    reader.readAsText(file);
  };

  const handleCreateWorkspace = async () => {
    const name = prompt('Workspace Name:');
    if (!name) return;
    const ws = await db.createWorkspace(name);
    setWorkspaces([ws, ...workspaces]);
    setCurrentWorkspaceId(ws.id);
  };

  const handleDirectoryIngest = async () => {
    if (!currentWorkspaceId) {
      alert('Select or create a workspace first.');
      return;
    }
    setIsIngesting(true);
    try {
      const files = await ingestDirectory();
      const { generateEmbedding } = await import('@/lib/embeddings');
      for (const file of files) {
        const embedding = await generateEmbedding(file.content.slice(0, 5000));
        await db.addFileToWorkspace(currentWorkspaceId, file.name, file.path, file.content, embedding || []);
      }
      alert(`Ingested and indexed ${files.length} files.`);
    } catch (e) {
      console.error(e);
      alert('Ingestion failed. See console.');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleFileIngest = async () => {
    if (!currentWorkspaceId) {
      alert('Select or create a workspace first.');
      return;
    }
    setIsIngesting(true);
    try {
      const files = await ingestFiles();
      const { generateEmbedding } = await import('@/lib/embeddings');
      for (const file of files) {
        const embedding = await generateEmbedding(file.content.slice(0, 5000));
        await db.addFileToWorkspace(currentWorkspaceId, file.name, file.path, file.content, embedding || []);
      }
      alert(`Ingested and indexed ${files.length} files.`);
    } catch (e) {
      console.error(e);
      alert('Ingestion failed. See console.');
    } finally {
      setIsIngesting(false);
    }
  };

  // Weight: analyze sentiment on input change
  const [weightResult, setWeightResult] = useState(() => analyzeSentiment(''));

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // The Weight
    const sentiment = analyzeSentiment(value);
    setWeightResult(sentiment);

    // The Discipline warnings
    if (disciplineMode !== 'off') {
      const warning = getDisciplineWarning(value, disciplineMode);
      setDisciplineWarning(warning);
    }
  };

  // Ephemeral toggle handler
  const toggleEphemeral = () => {
    const next = !ephemeralMode;
    setEphemeralMode(next);
    setEphemeralEnabled(next);
  };

  // Discipline toggle handler
  const toggleDiscipline = (mode: DisciplineMode) => {
    const next = disciplineMode === mode ? 'off' : mode;
    setDisciplineMode(next);
    setDisciplineModeState(next);
    setDisciplineWarning(null);
  };

  const setDisciplineModeState = (mode: DisciplineMode) => {
    setDisciplineMode(mode);
    setDisciplineMode(mode);
  };

  // Annotation handler for The Margins
  const handleAddAnnotation = async (ann: { message_id: string; word: string; note: string }) => {
    try {
      const saved = await db.addAnnotation(ann.message_id, ann.word, ann.note);
      setAnnotations(prev => [...prev, saved]);
    } catch (e) {
      console.error('Failed to save annotation:', e);
    }
  };

  // Clearing handlers
  const openClearing = () => {
    setClearingOpen(true);
    markClearingDiscovered();
  };

  const submitMessage = async () => {
    if (!authenticated || !input.trim() || isLoading) return;

    const userMessage = input.trim();
    const finalContent = activeQuote 
      ? `> ${activeQuote}\n\n${userMessage}`
      : userMessage;

    setInput('');
    setActiveQuote(null);
    setError(null);
    setIsLoading(true);
    window.dispatchEvent(new CustomEvent('serve-thinking-start'));

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
      content: finalContent,
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
      { id: userMsg.id, role: 'user' as const, content: finalContent },
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

      let delay = 15;
      if (token.includes('\n\n')) delay = 80;
      else if (token.includes('\n')) delay = 40;
      else if (token.endsWith('.') || token.endsWith('\u2014')) delay = 50;
      else if (token.endsWith('?') || token.endsWith('!')) delay = 60;

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
      (token) => {
        tokenQueue.push(token);
        processTokenQueue();
      },
      async (fullResponse) => {
        const artifactMatch = fullResponse.match(/:::artifact\[(.*?)\]\s*([\s\S]*?)\s*:::/);
        if (artifactMatch) {
          const newArtifact: Artifact = {
            id: crypto.randomUUID(),
            title: artifactMatch[1],
            content: artifactMatch[2].trim(),
            type: 'insight',
            timestamp: new Date().toISOString(),
          };
          setArtifacts(prev => [newArtifact, ...prev]);
        }

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
        window.dispatchEvent(new CustomEvent('serve-thinking-stop'));

        if (convId && messages.length <= 1 && fullResponse) {
          const allMsgs: ChatMessage[] = [
            ...chatMessages,
            { id: assistantMsg.id, role: 'assistant', content: fullResponse },
          ];
          const smartTitle = await generateTitle(allMsgs, selectedModel);
          if (smartTitle) {
            const { generateEmbedding } = await import('@/lib/embeddings');
            const embedding = await generateEmbedding(smartTitle + " " + userMessage);
            await db.updateConversationTitle(convId, smartTitle, embedding || []);
          }
        }

        loadConversations();
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsLoading(false);
        window.dispatchEvent(new CustomEvent('serve-thinking-stop'));
        tokenQueue = [];
        processingQueue = false;
        if (errorMsg.includes('Unauthorized')) {
          setAuthenticated(false);
        }
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant' && !updated[updated.length - 1].content) {
            updated.pop();
          }
          return updated;
        });
      },
      fieldStudyContext?.content,
      currentWorkspaceId
    );
  };

  const displayedConversations = searchResults !== null ? searchResults : conversations;

  if (loadingAuth) return <div className="bg-[#0a0a0a] h-screen w-screen flex items-center justify-center text-white/20 text-sm">initializing...</div>;

  return (
    <div className="flex h-full bg-[#0a0a0a] text-white selection:bg-white/10 overflow-hidden">
      {!authenticated && <AuthModal onAuthenticated={() => setAuthenticated(true)} />}

      {/* The Clearing overlay */}
      <TheClearing isOpen={clearingOpen} onClose={() => setClearingOpen(false)} />

      {/* The Echo overlay */}
      <TheEcho messages={messages} isActive={echoActive} onClose={toggleEcho} />

      {/* Farewell */}
      <Farewell containerRef={chatContainerRef} />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Collapsible Sidebar */}
      <div className={`transition-all duration-300 ease-in-out flex flex-col border-r border-white/5 bg-[#0a0a0a] z-40
        ${sidebarOpen 
          ? 'fixed inset-y-0 left-0 w-72 md:relative md:w-64' 
          : 'hidden md:flex md:w-12'
        }`}
      >
        {/* Logo / Toggle */}
        <div className="h-14 flex items-center px-3 border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-xl font-light text-white/80 hover:text-white transition-colors"
            title="Toggle sidebar (Ctrl+B)"
          >
            &#9670;
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
                aria-label="Search conversations"
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
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 hover:text-white/80 transition-all flex-shrink-0"
                    title="Delete"
                    aria-label={`Delete conversation ${conv.title || 'Untitled'}`}
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
      <div className="flex-1 flex flex-col relative min-w-0" ref={chatContainerRef}>
        {/* Selection Menu (Ask SERVE) */}
        <AnimatePresence>
          {selectionMenu && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ left: selectionMenu.x, top: selectionMenu.y }}
              className="fixed -translate-x-1/2 z-[60] flex items-center gap-2 bg-[#111] border border-white/10 rounded-full px-3 py-1.5 shadow-2xl backdrop-blur-md"
            >
              <button
                onClick={addSelectionToChat}
                className="flex items-center gap-2 text-[10px] text-white/60 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5 border-r border-white/10 pr-2 mr-0.5">
                  <CornerDownRight className="w-3 h-3" />
                  <span className="uppercase tracking-widest font-light">Focus</span>
                </div>
                <span className="italic opacity-40">Add to chat</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reliquary (The Archive) - Side Panel */}
        <AnimatePresence>
          {reliquaryOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setReliquaryOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
              />
              <motion.div
                initial={{ x: '100%', filter: 'blur(10px)' }}
                animate={{ x: 0, filter: 'blur(0px)' }}
                exit={{ x: '100%', filter: 'blur(10px)' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 md:top-8 bottom-0 w-full sm:w-80 bg-[#0a0a0a] border-l border-white/5 z-50 flex flex-col shadow-2xl"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-white/40" />
                    <span className="text-xs uppercase tracking-[0.2em] text-white/60">The Reliquary</span>
                  </div>
                  <button onClick={() => setReliquaryOpen(false)} className="text-white/20 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {artifacts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <Bookmark className="w-5 h-5 text-white/10" />
                      <p className="text-[10px] text-white/20 italic">No insights crystallized yet.</p>
                    </div>
                  ) : (
                    artifacts.map(artifact => (
                      <motion.div 
                        key={artifact.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group space-y-3 p-4 bg-white/[0.02] border border-white/[0.05] rounded-lg hover:border-white/10 transition-all duration-500"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-medium text-white/60 tracking-wider uppercase">{artifact.title}</h3>
                          <span className="text-[8px] text-white/10">{formatPoeticTimestamp(artifact.timestamp)}</span>
                        </div>
                        <div className="text-[11px] leading-relaxed text-white/40 group-hover:text-white/80 transition-colors italic">
                          &quot;{artifact.content}&quot;
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Workspace Manager (The Ground) - Side Panel */}
        <AnimatePresence>
          {workspaceManagerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setWorkspaceManagerOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
              />
              <motion.div
                initial={{ x: '100%', filter: 'blur(10px)' }}
                animate={{ x: 0, filter: 'blur(0px)' }}
                exit={{ x: '100%', filter: 'blur(10px)' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 md:top-8 bottom-0 w-full sm:w-80 bg-[#0a0a0a] border-l border-white/5 z-50 flex flex-col shadow-2xl"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-white/40" />
                    <span className="text-xs uppercase tracking-[0.2em] text-white/60">The Ground</span>
                  </div>
                  <button onClick={() => setWorkspaceManagerOpen(false)} className="text-white/20 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Workspace Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-white/20">Active Workspace</span>
                      <button onClick={handleCreateWorkspace} className="text-[10px] text-white/40 hover:text-white transition-colors">+ New</button>
                    </div>
                    <select 
                      value={currentWorkspaceId || ''} 
                      onChange={(e) => {
                        const wsId = e.target.value || null;
                        setCurrentWorkspaceId(wsId);
                        if (currentConversationId) {
                          db.linkConversationToWorkspace(currentConversationId, wsId);
                        }
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded px-2 py-2 text-xs text-white/60 focus:outline-none focus:border-white/20 appearance-none"
                    >
                      <option value="">None (Fluid Context)</option>
                      {workspaces.map(ws => (
                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Grounding Actions */}
                  {currentWorkspaceId && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-white/20 block">Ingest Patterns</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={handleFileIngest}
                          disabled={isIngesting}
                          className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] transition-all group"
                        >
                          <FileText className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                          <span className="text-[10px] text-white/40 group-hover:text-white/60">Files</span>
                        </button>
                        <button 
                          onClick={handleDirectoryIngest}
                          disabled={isIngesting}
                          className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] transition-all group"
                        >
                          <FolderOpen className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                          <span className="text-[10px] text-white/40 group-hover:text-white/60">Directory</span>
                        </button>
                      </div>
                      {isIngesting && <div className="text-center text-[10px] text-white/20 italic animate-pulse">Reading the ground...</div>}
                    </div>
                  )}

                  {!currentWorkspaceId && (
                    <div className="h-40 flex flex-col items-center justify-center text-center space-y-4">
                      <Layers className="w-5 h-5 text-white/10" />
                      <p className="text-[10px] text-white/20 italic max-w-[160px]">Create a workspace to persist patterns and local knowledge.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="h-12 flex items-center justify-between sm:justify-center px-4 sm:px-6 relative">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white/40 hover:text-white/60 transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-xs text-white/20 tracking-[0.2em]">SERVE</span>

          <div className="flex items-center gap-1 sm:absolute sm:right-6">
            {/* The Clearing button */}
            <button
              onClick={openClearing}
              className={`p-2.5 md:p-2 transition-colors relative ${clearingDiscovered ? 'text-white/20 hover:text-white/60' : 'text-white/40 hover:text-white/80'}`}
              title="The Clearing"
              aria-label="Open The Clearing"
            >
              <PauseCircle className="w-4 h-4" />
              {!clearingDiscovered && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
              )}
            </button>

            {/* The Echo button */}
            <button
              onClick={toggleEcho}
              className={`p-2.5 md:p-2 transition-colors ${echoActive ? 'text-white/60' : 'text-white/20 hover:text-white/60'}`}
              title="The Echo (Shift+E)"
              aria-label="Toggle The Echo"
            >
              <Ear className="w-4 h-4" />
            </button>

            <button
              onClick={() => setWorkspaceManagerOpen(true)}
              className="p-2.5 md:p-2 text-white/20 hover:text-white/60 transition-colors relative"
              title="Workspaces (Ctrl+W)"
              aria-label="Open Workspaces"
            >
              <Database className={`w-4 h-4 ${currentWorkspaceId ? 'text-white/40' : ''}`} />
              {currentWorkspaceId && (
                <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-white/40 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setReliquaryOpen(true)}
              className="p-2.5 md:p-2 text-white/20 hover:text-white/60 transition-colors relative"
              title="The Reliquary"
              aria-label="Open The Reliquary"
            >
              <Bookmark className="w-4 h-4" />
              {artifacts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-white/40 rounded-full animate-pulse" />
              )}
            </button>
            {currentConversationId && (
              <button
                onClick={exportCurrentChat}
                className="p-2.5 md:p-2 text-white/20 hover:text-white/60 transition-colors hidden sm:block"
                title="Export conversation (Ctrl+Shift+E)"
                aria-label="Export conversation"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 md:p-2 text-white/20 hover:text-white/60 transition-colors"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8" ref={messagesContainerRef}>
          {messages.length === 0 && !error ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-center select-none space-y-6">
                <motion.img
                  src="/logo.png"
                  alt="SERVE"
                  className="w-16 h-16 sm:w-20 sm:h-20 opacity-[0.08] mx-auto"
                  animate={{ opacity: [0.06, 0.12, 0.06] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={placeholderIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.6 }}
                    className="text-sm text-white/20 font-light tracking-wide italic max-w-md"
                  >
                    {getPersona(selectedPersona).placeholder[placeholderIndex % getPersona(selectedPersona).placeholder.length]}
                  </motion.p>
                </AnimatePresence>
                <button
                  onClick={() => inputRef.current?.focus()}
                  className="text-[11px] text-white/15 hover:text-white/30 transition-colors tracking-[0.3em] lowercase mt-4"
                >
                  begin
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
              {messages.map((m, i) => (
                <div key={m.id}>
                  {/* The Silence Between */}
                  {i > 0 && (
                    <SilenceBetween
                      prevCreatedAt={messages[i - 1].created_at}
                      nextCreatedAt={m.created_at}
                    />
                  )}
                  <div className={m.role === 'user' ? 'flex justify-end' : ''}>
                    {m.role === 'user' ? (
                      <div
                        className={`max-w-[90%] sm:max-w-[85%] message-content ${ephemeralMode ? 'ephemeral-message' : ''}`}
                        data-ephemeral={ephemeralMode ? 'true' : undefined}
                        data-artifact={hasArtifact(m.content) ? 'true' : undefined}
                      >
                        <div className="text-white/50 text-sm leading-relaxed text-right">{m.content}</div>
                        {m.created_at && <div className="text-[10px] text-white/8 mt-1.5 text-right">{formatPoeticTimestamp(m.created_at)}</div>}
                      </div>
                    ) : (
                      <div className="group relative message-content">
                        {/* The Loom Indicator */}
                        {(m.content && (conversations.length > 1 || currentWorkspaceId)) && (
                          <div className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none hidden sm:block" title={currentWorkspaceId ? "Grounded in workspace patterns" : "Woven from past threads"}>
                            {currentWorkspaceId ? <Layers className="w-3.5 h-3.5 text-white/10" /> : <History className="w-3.5 h-3.5 text-white/5" />}
                          </div>
                        )}
                        <TheMargins
                          messageId={m.id}
                          annotations={annotations}
                          onAddAnnotation={handleAddAnnotation}
                        >
                          <div
                            className={`text-[14px] sm:text-[15px] leading-[1.7] text-white/90 ${ephemeralMode ? 'ephemeral-message' : ''}`}
                            data-ephemeral={ephemeralMode ? 'true' : undefined}
                            data-artifact={hasArtifact(m.content) ? 'true' : undefined}
                            style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
                          >
                            <ReactMarkdown
                            components={{
                              p({ children }) { 
                                const content = Array.isArray(children) 
                                  ? children.map(c => typeof c === 'string' ? c : '').join('')
                                  : typeof children === 'string' ? children : '';

                                if (content.includes(':::artifact')) {
                                  const titleMatch = content.match(/\[(.*?)\]/);
                                  const title = titleMatch ? titleMatch[1] : 'Crystallized Insight';
                                  
                                  return (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="my-6 p-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between group cursor-pointer hover:border-white/20 transition-all duration-500"
                                      onClick={() => setReliquaryOpen(true)}
                                    >
                                      <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                          <Quote className="w-3 h-3 sm:w-4 sm:h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                                        </div>
                                        <div>
                                          <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-1">Artifact</div>
                                          <div className="text-xs text-white/60 group-hover:text-white transition-colors italic">{title}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-white/20 group-hover:text-white/40 transition-colors">
                                        <span className="hidden sm:inline">View Insight</span>
                                        <ChevronRight className="w-3 h-3" />
                                      </div>
                                    </motion.div>
                                  );
                                }
                                return <p className="mb-4">{children}</p>; 
                              },
                              h1({ children }) { return <h1 className="text-lg font-normal text-white mt-6 mb-3">{children}</h1>; },
                              h2({ children }) { return <h2 className="text-base font-normal text-white mt-5 mb-2">{children}</h2>; },
                              h3({ children }) { return <h3 className="text-sm font-normal text-white mt-4 mb-2">{children}</h3>; },
                              ul({ children }) { return <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>; },
                              ol({ children }) { return <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>; },
                              li({ children }) { return <li className="text-white/80">{children}</li>; },
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
                        </TheMargins>
                        {m.created_at && m.content && (
                          <div className="text-[10px] text-white/10 mt-1">{formatPoeticTimestamp(m.created_at)}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Threshold States loading indicator */}
              <ThresholdStates
                isLoading={isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].content}
              />

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
        <div className="p-4 sm:p-6 pb-6 sm:pb-10">
          <div className="max-w-2xl mx-auto">
            {/* Discipline warning */}
            <AnimatePresence>
              {disciplineWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 text-[10px] text-white/25 italic text-right"
                >
                  {disciplineWarning}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input with inline persona label */}
            <div className="relative">
              <textarea
                ref={inputRef}
                className={`w-full bg-transparent border rounded-lg pl-4 pr-12 py-3 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all resize-none overflow-hidden weight-glow ${getDisciplineInputClass(disciplineMode)} ${getWeightBorderClass(weightResult)} ${getWeightShadowClass(weightResult)}`}
                placeholder={getDisciplinePlaceholder(
                  getPersona(selectedPersona).placeholder[placeholderIndex % getPersona(selectedPersona).placeholder.length],
                  disciplineMode
                )}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ minHeight: '48px', maxHeight: '200px' }}
                aria-label="Message input"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                }}
              />
              <div className="absolute right-3 top-3 flex items-center gap-2">
                {/* Discipline counter for 140-char mode */}
                {disciplineMode === '140-chars' && (
                  <span className={`text-[10px] ${input.length > 140 ? 'text-white/40' : 'text-white/15'}`}>
                    {input.length}/140
                  </span>
                )}
                <label className="cursor-pointer p-1 text-white/10 hover:text-white/40 transition-colors" title="Field Study (The Lens)">
                  <FileText className={`w-4 h-4 ${fieldStudyContext ? 'text-white/60' : ''}`} />
                  <input type="file" className="hidden" accept=".txt,.md,.json,.csv" onChange={handleFieldStudyUpload} />
                </label>
              </div>
            </div>
            {/* Persona selector */}
            <div className="flex items-center justify-end mt-2 gap-3">
              <div className="relative">
                <label htmlFor="persona-select" className="sr-only">Select persona</label>
                <select
                  id="persona-select"
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                  className="appearance-none bg-transparent text-[11px] text-white/25 hover:text-white/50 transition-colors tracking-wide lowercase cursor-pointer border border-white/5 rounded px-2 py-1 pr-6 focus:outline-none focus:border-white/20"
                  aria-label="Select persona"
                >
                  {PERSONAS.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#111] text-white/80">
                      {p.name.toLowerCase()} — {p.description}
                    </option>
                  ))}
                </select>
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/15 pointer-events-none text-[8px]">&#9662;</span>
              </div>
            </div>
            {/* Active Quote Context Bar */}
            <AnimatePresence>
              {activeQuote && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg group">
                    <Quote className="w-3 h-3 text-white/20" />
                    <span className="flex-1 text-[11px] text-white/40 truncate italic">
                      {activeQuote}
                    </span>
                    <button 
                      onClick={() => setActiveQuote(null)}
                      className="p-1 text-white/10 hover:text-white/40 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {fieldStudyContext && (
              <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-white/5 border border-white/10 rounded-md w-fit">
                <span className="text-[10px] text-white/40 italic">Study: {fieldStudyContext.name}</span>
                <button onClick={() => setFieldStudyContext(null)} className="text-white/20 hover:text-white">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            <div className="flex justify-between mt-2 text-[10px] text-white/10">
              <span className="hidden sm:inline">Ctrl+N new &#183; Ctrl+K search &#183; / focus</span>
              <span className="sm:hidden">Tap &#9670; for menu</span>
              <span>{selectedModel}{messages.length === 0 ? ` &#183; ${PERSONAS.find(p => p.id === selectedPersona)?.name || 'SERVE'}` : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSettings(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
        >
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 id="settings-modal-title" className="text-base font-light">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/40 hover:text-white transition-colors p-1"
                aria-label="Close settings"
              >
                &#10005;
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
                      aria-label="Search models"
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
                    {availableModels.length > 0 ? availableModels.map((m, idx) => (
                      <button
                        key={`${m.id}-${idx}`}
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

              {/* Audio — Resonance */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Ambient Resonance</label>
                <button 
                  onClick={async () => {
                    const nextState = !isAudioEnabled;
                    setIsAudioEnabled(nextState);
                    if (nextState) {
                      await resonance.init();
                    } else {
                      resonance.stop();
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 border rounded-md transition-all duration-300 ${isAudioEnabled 
                    ? 'bg-white/5 border-white/20 text-white' 
                    : 'bg-transparent border-white/5 text-white/20 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className={`w-3.5 h-3.5 ${isAudioEnabled ? 'text-white/60' : 'text-white/10'}`} />
                    <span className="text-xs">{isAudioEnabled ? 'Active' : 'Silent'}</span>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${isAudioEnabled ? 'bg-white/40 animate-pulse' : 'bg-white/5'}`} />
                </button>
              </div>

              {/* Ephemeral Mode Toggle */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Atmosphere</label>
                <button
                  onClick={toggleEphemeral}
                  className={`w-full flex items-center justify-between px-3 py-2 border rounded-md transition-all duration-300 ${ephemeralMode 
                    ? 'bg-white/5 border-white/20 text-white' 
                    : 'bg-transparent border-white/5 text-white/20 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Ephemeral</span>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${ephemeralMode ? 'bg-white/40 animate-pulse' : 'bg-white/5'}`} />
                </button>
                <p className="text-[10px] text-white/15 mt-1">Messages fade over time. Hover to restore.</p>
              </div>

              {/* The Discipline Toggle */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">The Discipline</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleDiscipline('one-sentence')}
                    className={`flex-1 px-3 py-2 border rounded-md text-xs transition-all duration-300 ${disciplineMode === 'one-sentence'
                      ? 'bg-white/5 border-white/20 text-white'
                      : 'bg-transparent border-white/5 text-white/20 hover:border-white/10'
                      }`}
                  >
                    One Sentence
                  </button>
                  <button
                    onClick={() => toggleDiscipline('140-chars')}
                    className={`flex-1 px-3 py-2 border rounded-md text-xs transition-all duration-300 ${disciplineMode === '140-chars'
                      ? 'bg-white/5 border-white/20 text-white'
                      : 'bg-transparent border-white/5 text-white/20 hover:border-white/10'
                      }`}
                  >
                    140 Characters
                  </button>
                </div>
                <p className="text-[10px] text-white/15 mt-1">Soft constraints for focused expression.</p>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="hidden sm:block">
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Shortcuts</label>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between text-white/30"><span>New chat</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Ctrl+N</kbd></div>
                  <div className="flex justify-between text-white/30"><span>Toggle sidebar</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Ctrl+B</kbd></div>
                  <div className="flex justify-between text-white/30"><span>Search</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Ctrl+K</kbd></div>
                  <div className="flex justify-between text-white/30"><span>Settings</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Ctrl+,</kbd></div>
                  <div className="flex justify-between text-white/30"><span>Export chat</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Ctrl+Shift+E</kbd></div>
                  <div className="flex justify-between text-white/30"><span>Focus input</span><kbd className="text-white/20 bg-white/5 px-1 rounded">/</kbd></div>
                  <div className="flex justify-between text-white/30"><span>The Echo</span><kbd className="text-white/20 bg-white/5 px-1 rounded">Shift+E</kbd></div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
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
                <div className="flex gap-3 text-[10px] text-white/20">
                  <Link href="/privacy" className="hover:text-white/40 transition-colors">Privacy</Link>
                  <Link href="/terms" className="hover:text-white/40 transition-colors">Terms</Link>
                  <Link href="/changelog" className="hover:text-white/40 transition-colors">Changelog</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
