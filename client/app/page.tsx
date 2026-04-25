import Image from 'next/image';
import Link from 'next/link';
import { FileText, UserCheck, Calendar, Cpu, Sparkles, Briefcase } from 'lucide-react';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <header className={`${styles.header} ${styles.fadeIn}`}>
        <Link href="/" className={styles.logoLink}>
          <Image 
            src="/image/logo-black.png" 
            alt="ARIA Logo" 
            width={100} 
            height={28} 
            className={styles.logo}
            priority
          />
        </Link>
        <nav className={styles.nav}>
          <Link href="/login">
            <button className={styles.ctaButton}>Sign in</button>
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        {/* Animated Background Elements */}
        <div className={styles.bgContainer}>
          <div className={`${styles.bgElement} ${styles.bgResume} ${styles.float1}`}>
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <div className={`${styles.bgElement} ${styles.bgCandidate} ${styles.float2}`}>
            <UserCheck size={32} strokeWidth={1.5} />
          </div>
          <div className={`${styles.bgElement} ${styles.bgCalendar} ${styles.float3}`}>
            <Calendar size={32} strokeWidth={1.5} />
          </div>
          <div className={`${styles.bgElement} ${styles.bgAI} ${styles.pulse}`}>
            <Cpu size={48} strokeWidth={1} />
            <Sparkles className={styles.sparkleIcon} size={20} />
          </div>
          <div className={`${styles.bgElement} ${styles.bgJob} ${styles.float2}`}>
            <Briefcase size={32} strokeWidth={1.5} />
          </div>
        </div>

        <section className={styles.hero}>
          <div className={`${styles.heroContent} ${styles.stagger1}`}>
            <h1 className={styles.heroTitle}>
              Smarter Recruitment with ARIA
            </h1>
            <p className={styles.heroSubtitle}>
              Streamline your hiring process from sourcing to decision making. ARIA leverages intelligent screening and data analytics to help you build the best team, faster.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/login">
                <button className={styles.primaryButton}>Get started</button>
              </Link>
              <Link href="/dashboard">
                <button className={styles.secondaryButton}>Go to Dashboard</button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={`${styles.footer} ${styles.fadeIn}`}>
        <div className={styles.footerLinks}>
          <Link href="#" className={styles.footerLink}>Privacy</Link>
          <Link href="#" className={styles.footerLink}>Terms</Link>
        </div>
      </footer>
    </div>
  );
}
