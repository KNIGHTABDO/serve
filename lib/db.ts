
import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';

const DB_DIR = path.join(os.homedir(), '.openclaw', 'data');
const DB_PATH = path.join(DB_DIR, 'serve.db');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Singleton pattern for database connection
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');
    
    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT,
        model TEXT DEFAULT 'gpt-4o',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
    `);
  }
  
  return db;
}

export interface Conversation {
  id: string;
  title: string | null;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
}

// Lazy-loaded queries
export const dbQueries = {
  // Conversations
  get createConversation() { return getDb().prepare(`INSERT INTO conversations (id, title, model) VALUES (?, ?, ?)`); },
  get getConversations() { return getDb().prepare(`SELECT id, title, model, created_at as createdAt, updated_at as updatedAt FROM conversations ORDER BY updated_at DESC`); },
  get getConversation() { return getDb().prepare(`SELECT id, title, model, created_at as createdAt, updated_at as updatedAt FROM conversations WHERE id = ?`); },
  get updateConversationTitle() { return getDb().prepare(`UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`); },
  get updateConversationTimestamp() { return getDb().prepare(`UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`); },
  get deleteConversation() { return getDb().prepare(`DELETE FROM conversations WHERE id = ?`); },
  
  // Messages
  get createMessage() { return getDb().prepare(`INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)`); },
  get getMessages() { return getDb().prepare(`SELECT id, conversation_id as conversationId, role, content, created_at as createdAt FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`); },
  get deleteMessages() { return getDb().prepare(`DELETE FROM messages WHERE conversation_id = ?`); },
};

export default { getDb, dbQueries };
