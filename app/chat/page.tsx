"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./chat.module.css";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const send = useCallback(async () => {
    if (!input.trim()) return;
    
    const userMessage: Msg = { 
      id: crypto.randomUUID(), 
      role: "user", 
      content: input 
    };
    const newMessages: Msg[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const assistantMessage: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply.content
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, messages]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.container}>
      <h1>Chat with TODO Assistant</h1>
      <div ref={threadRef} className={styles.thread}>
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? styles.user : styles.assistant}>
            {m.role === "assistant" ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
            ) : (
              m.content
            )}
          </div>
        ))}
        {loading && <div className={styles.assistant}>…</div>}
      </div>
      <div className={styles.inputBar}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button 
          type="button" 
          onClick={send}
          disabled={!input.trim() || loading} 
          className={styles.sendButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.105 3.105a1.5 1.5 0 011.952-.439l12 6a1.5 1.5 0 010 2.668l-12 6A1.5 1.5 0 113.105 16.895V3.105z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
