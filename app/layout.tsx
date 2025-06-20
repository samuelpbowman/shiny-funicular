import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import styles from './layout.module.css';
import Header from './components/Header';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ['400', '600']
});

export const metadata: Metadata = {
  title: "Bookish TODO App",
  description: "A crisp and bookish TODO application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body>
        <Header />
        <div className={styles.container}>
          <main className={styles.mainContent}>
            {children}
          </main>
          <footer className={styles.footer}>
            <p>Built with Cascade.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
