import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>TODO App</h1>
        <p>Welcome to your AI-powered TODO application.</p>
      </div>

      <div className={styles.grid}>
        <Link href="/dashboard" className={styles.card}>
          <h2>
            Dashboard <span>-&gt;</span>
          </h2>
          <p>Manage your TODOs directly through the dashboard.</p>
        </Link>

        <Link href="/chat" className={styles.card}>
          <h2>
            Chat <span>-&gt;</span>
          </h2>
          <p>Use the AI assistant to manage your TODOs via chat.</p>
        </Link>
      </div>
    </main>
  );
}
