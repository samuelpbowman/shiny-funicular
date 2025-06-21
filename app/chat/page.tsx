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
  const abortControllerRef = useRef<AbortController | null>(null);

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

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages
        }),
        signal: abortController.signal,
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error("No reader available");
      }

      let streamedContent = "";
      let assistantMessageId: string | null = null;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                streamedContent += parsed.content;
                
                if (!assistantMessageId) {
                  // Create assistant message only when we have content
                  assistantMessageId = crypto.randomUUID();
                  const assistantMessage: Msg = {
                    id: assistantMessageId,
                    role: "assistant",
                    content: streamedContent
                  };
                  setMessages(prev => [...prev, assistantMessage]);
                } else {
                  // Update existing message
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: streamedContent }
                      : msg
                  ));
                }
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Request was aborted");
      } else {
        console.error("Failed to send message:", error);
        const errorMessage: Msg = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again."
        };
        setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, messages]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);

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
      </div>
      <div className={styles.inputBar}>
        <textarea 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          disabled={loading}
          rows={1}
          className={styles.textarea}
        />
        {loading ? (
          <button 
            type="button" 
            onClick={stopGeneration}
            className={styles.stopButton}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <button 
            type="button" 
            onClick={send}
            disabled={!input.trim()} 
            className={styles.sendButton}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3.105 3.105a1.5 1.5 0 011.952-.439l12 6a1.5 1.5 0 010 2.668l-12 6A1.5 1.5 0 113.105 16.895V3.105z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
