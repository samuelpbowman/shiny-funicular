"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./chat.module.css";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const newMessages: Msg[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply.content }] as Msg[]);
    setLoading(false);
  }

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.container}>
      <h1>Chat with TODO Assistant</h1>
      <div ref={threadRef} className={styles.thread}>
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? styles.user : styles.assistant}>
            {m.content}
          </div>
        ))}
        {loading && <div className={styles.assistant}>…</div>}
      </div>
      <div className={styles.inputBar}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&send()} />
        <button type="submit" disabled={!input.trim()} className={styles.sendButton}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.105 3.105a1.5 1.5 0 011.952-.439l12 6a1.5 1.5 0 010 2.668l-12 6A1.5 1.5 0 013.105 16.895V3.105z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
