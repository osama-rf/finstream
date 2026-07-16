import Image from "next/image";
import Link from "next/link";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Image
          src="/landing/hero-logo.png"
          alt="ركائز"
          width={220}
          height={271}
          className={styles.logo}
          priority
        />
        <h2 className={styles.heading}>
          نبني الركيزة التي يقف عليها
          <br />
          تمويل الشركات الناشئة
        </h2>

        <div className={styles.teamRow}>
          <Link
            href="/control-center"
            className={styles.teamMember}
          >
            <span className={styles.iconCircle}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <polygon points="10,8 16,12 10,16" fill="var(--gold)" stroke="none" />
              </svg>
            </span>
            <span>العرض الحيّ</span>
          </Link>
          <a
            href="/presentation.html"
            target="_blank"
            rel="noopener"
            className={styles.teamMember}
          >
            <span className={styles.iconCircle}>
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="12" rx="1.5" />
                <line x1="8" y1="20" x2="16" y2="20" />
                <line x1="12" y1="16" x2="12" y2="20" />
              </svg>
            </span>
            <span>العرض التقديمي</span>
          </a>
        </div>

        <div className={styles.partnerRow}>
          <Image src="/landing/partner-icons.png" alt="" width={159} height={98} unoptimized />
          <Image src="/landing/partner-logo-1.png" alt="" width={168} height={64} unoptimized />
          <Image src="/landing/partner-logo-2.png" alt="" width={264} height={52} unoptimized />
        </div>
      </div>
    </div>
  );
}
