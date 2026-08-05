import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>AI Travel Planner</div>
        <nav>
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/register" className={styles.btnPrimary}>Get Started</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.title}>Plan Your Dream Trip in Seconds</h1>
        <p className={styles.description}>
          Use our advanced AI to generate personalized itineraries, optimize your budget, and discover hidden gems.
        </p>
        <Link href="/dashboard" className={styles.ctaButton}>
          Start Planning Now
        </Link>
      </section>
    </main>
  );
}
