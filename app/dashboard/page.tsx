"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./dashboard.module.css";

type Todo = {
  id: string;
  text: string;
  task?: string;
  completed: boolean;
};

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"todos" | "completed">("todos");
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      } else {
        console.error("Failed to fetch todos:", await res.text());
        setTodos([]);
      }
    } catch (error) {
      console.error("An error occurred while fetching todos:", error);
      setTodos([]);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, task: task || undefined }),
      });

      if (res.ok) {
        const newTodo = await res.json();
        setTodos((prev) => [...prev, newTodo]);
        setText("");
        setTask("");
      } else {
        console.error("Failed to add todo");
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setLoading(false);
    }
  }, [text, task]);

  const toggleComplete = useCallback(async (id: string, completed: boolean) => {
    try {
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
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });

      if (res.ok) {
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } else {
        console.error("Failed to delete todo");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }, []);

  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);
  
  // Group todos by task
  const groupTodosByTask = (todoList: Todo[]) => {
    const grouped = todoList.reduce((acc, todo) => {
      const taskName = todo.task || "General";
      if (!acc[taskName]) acc[taskName] = [];
      acc[taskName].push(todo);
      return acc;
    }, {} as Record<string, Todo[]>);
    return grouped;
  };
  
  const activeGrouped = groupTodosByTask(activeTodos);
  const completedGrouped = groupTodosByTask(completedTodos);
  
  // Generate consistent colors for task groups with better contrast
  const getTaskColor = (taskName: string) => {
    const colors = [
      { bg: "#f8fafc", border: "#e2e8f0", text: "#334155" }, // slate
      { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" }, // red
      { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" }, // green
      { bg: "#fffbeb", border: "#fed7aa", text: "#92400e" }, // amber
      { bg: "#f0f9ff", border: "#bae6fd", text: "#0c4a6e" }, // blue
      { bg: "#faf5ff", border: "#d8b4fe", text: "#6b21a8" }, // purple
      { bg: "#fefce8", border: "#fde047", text: "#713f12" }, // yellow
      { bg: "#f0fdfa", border: "#a7f3d0", text: "#065f46" }, // emerald
      { bg: "#fdf2f8", border: "#f9a8d4", text: "#9d174d" }, // pink
      { bg: "#f8fafc", border: "#cbd5e1", text: "#475569" }, // gray
    ];
    let hash = 0;
    for (let i = 0; i < taskName.length; i++) {
      hash = taskName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const toggleTaskCollapse = (taskName: string) => {
    setCollapsedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskName)) {
        newSet.delete(taskName);
      } else {
        newSet.add(taskName);
      }
      return newSet;
    });
  };

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
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Task group (optional)"
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

      <div className={styles.groupsContainer}>
        {Object.entries(activeTab === 'todos' ? activeGrouped : completedGrouped).map(([taskName, todoList]) => {
          const colors = getTaskColor(taskName);
          const isCollapsed = collapsedTasks.has(taskName);
          return (
            <div key={taskName} className={styles.taskGroup} style={{ 
              backgroundColor: colors.bg, 
              borderColor: colors.border,
              color: colors.text 
            }}>
              <div 
                className={styles.taskHeader} 
                style={{ color: colors.text }}
                onClick={() => toggleTaskCollapse(taskName)}
              >
                <span className={styles.collapseIcon}>
                  {isCollapsed ? '▶' : '▼'}
                </span>
                <span>{taskName}</span>
                <span className={styles.taskCount}>({todoList.length})</span>
              </div>
              {!isCollapsed && (
                <ul className={styles.list}>
                  {todoList.map((todo) => (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
