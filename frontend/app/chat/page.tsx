'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './chat.module.css';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

const SUGGESTED_PROMPTS = [
  '🗺️ Plan a 7-day trip to Japan for $3000',
  '🏖️ Best hidden beaches in Southeast Asia',
  '🎒 Packing list for a 2-week Europe trip',
  '✈️ Cheapest time to fly to Santorini',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      content: "Hello! I'm **Atlas**, your AI Travel Assistant 🌍\n\nI can help you plan trips, find hidden gems, optimize your budget, and create personalized itineraries. Where would you like to explore next?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, role: 'ai', content: '', isStreaming: true }]);

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as any).error || 'Failed to connect to AI');
      }

      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') { setIsTyping(false); continue; }
          try {
            const parsed = JSON.parse(data) as { text?: string; error?: string };
            if (parsed.error) {
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId ? { ...msg, content: `⚠️ ${parsed.error}`, isStreaming: false } : msg
              ));
            } else if (parsed.text) {
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId ? { ...msg, content: msg.content + parsed.text } : msg
              ));
            }
          } catch (_) {}
        }
      }
    } catch (error: any) {
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, content: `⚠️ ${error.message}. Make sure the backend is running and your GEMINI_API_KEY is set in backend/.env`, isStreaming: false }
          : msg
      ));
    } finally {
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
      ));
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Simple markdown bold renderer
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        )}
        <br />
      </span>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatWrapper}>
        <header className={styles.header}>
          <div className={styles.aiAvatar}>
            <div className={styles.pulseRing}></div>
            <span className={styles.avatarIcon}>✦</span>
          </div>
          <div>
            <h2 className={styles.title}>Atlas — Travel AI</h2>
            <p className={styles.subtitle}>● Online · Gemini 1.5 Pro</p>
          </div>
        </header>

        <div className={styles.messageList}>
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.role === 'user' ? styles.userMsg : styles.aiMsg}`}
            >
              {msg.role === 'ai' && <div className={styles.aiIcon}>✦</div>}
              <div className={styles.bubble}>
                {msg.content ? renderContent(msg.content) : null}
                {msg.isStreaming && msg.content === '' && (
                  <span className={styles.typingDots}>
                    <span></span><span></span><span></span>
                  </span>
                )}
                {msg.isStreaming && msg.content !== '' && (
                  <span className={styles.cursor}>▋</span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className={styles.suggestions}>
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button key={i} className={styles.suggestBtn} onClick={() => sendMessage(p)}>
                {p}
              </button>
            ))}
          </div>
        )}

        <div className={styles.inputArea}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about travel..."
            className={styles.input}
            disabled={isTyping}
          />
          <button
            onClick={() => sendMessage(input)}
            className={`${styles.sendBtn} ${isTyping ? styles.sendBtnDisabled : ''}`}
            disabled={isTyping || !input.trim()}
          >
            {isTyping ? (
              <span className={styles.spinnerIcon}>↻</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
