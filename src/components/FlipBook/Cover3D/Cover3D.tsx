import type { ReactNode } from 'react';
import styles from './Cover3D.module.css';

export interface Cover3DProps {
  eyebrow?: string;
  title?: string;
  subtitle?: ReactNode;
}

export default function Cover3D({
  eyebrow,
  title = 'MANFRED REYES VILLA',
  subtitle,
}: Cover3DProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <div className={styles.float}>
          <div className={styles.book}>
            <div className={styles.spine} />
            <div className={styles.topEdge} />
            <div className={styles.pagesEdge} />
            <div className={styles.backCover} />
            <div className={styles.cover}>
              <div className={styles.shine} />
              <div className={styles.content}>
                {eyebrow ? (
                  <span className={styles.badge}>{eyebrow}</span>
                ) : null}
                <h3 className={styles.title}>{title}</h3>
                {subtitle ? (
                  <p className={styles.subtitle}>{subtitle}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.shadow} />
      </div>
    </div>
  );
}