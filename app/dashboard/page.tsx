"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"todos" | "completed">("todos");

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      } else {
        console.error("Failed to fetch todos:", await res.text());
        setTodos([]); // Clear todos or show an error message
      }
    } catch (error) {
      console.error("An error occurred while fetching todos:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const newTodo = await res.json();
      setTodos((prev) => [...prev, newTodo]);
      setText("");
    } else {
      console.error("Failed to add todo");
      // Optionally, show an error to the user
    }
    setLoading(false);
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });

    if (res.ok) {
      const updatedTodo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));
    } else {
      console.error("Failed to update todo");
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });

    if (res.ok) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } else {
      console.error("Failed to delete todo");
    }
  };

  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <div className={styles.container}>
      <h1>TODO Dashboard</h1>
      <form onSubmit={addTodo} className={styles.form}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new todo..."
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.button}>
          Add
        </button>
      </form>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'todos' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          Active ({activeTodos.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'completed' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({completedTodos.length})
        </button>
      </div>

      <ul className={styles.list}>
        {(activeTab === 'todos' ? activeTodos : completedTodos).map((todo) => (
          <li key={todo.id} className={styles.listItem}>
            <span
              className={todo.completed ? styles.completed : ""}
              onClick={() => toggleComplete(todo.id, todo.completed)}
            >
              {todo.text}
            </span>
            <button onClick={() => remove(todo.id)} className={styles.removeButton}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
