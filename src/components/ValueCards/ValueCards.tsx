import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { CardConfig, ValueCardsProps } from './types';
import styles from './ValueCards.module.css';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_CARDS: CardConfig[] = [
  {
    id: 'bio',
    eyebrow: '01 · Biografía',
    title: 'Biografía',
    body: 'Trayectoria de servicio y compromiso con Cochabamba: gestión pública, trabajo constante y cercanía con la gente.',
  },
  {
    id: 'mision',
    eyebrow: '02 · Misión',
    title: 'Misión',
    body: 'Trabajar todos los días por una ciudad ordenada, moderna e inclusiva, poniendo los recursos al servicio de las familias.',
  },
  {
    id: 'vision',
    eyebrow: '03 · Visión',
    title: 'Visión',
    body: 'Construir un Cochabamba próspero y sostenible, donde el desarrollo llegue a cada barrio y cada persona tenga oportunidades.',
  },
];

export default function ValueCards({ cards = DEFAULT_CARDS, className }: ValueCardsProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const cardEls = Array.from(stage.querySelectorAll<HTMLElement>('[data-card]'));
    if (cardEls.length === 0) return;

    const byId = new Map(cardEls.map((el) => [el.dataset.card, el]));
    const bio = byId.get('bio');
    const mision = byId.get('mision');
    const vision = byId.get('vision');
    if (!bio || !mision || !vision) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: '(min-width: 861px)',
        tablet: '(min-width: 561px) and (max-width: 860px)',
        mobile: '(max-width: 560px)',
      },
      (ctx) => {
        const conds = ctx.conditions;
        const desktop = !!conds?.desktop;
        const tablet = !!conds?.tablet;
        const mobile = !!conds?.mobile;
        const dir = mobile ? 'vertical' : 'horizontal';
        const GAP = mobile ? 14 : 20;

        // Centro de anclaje: las cards se posicionan desde su centro.
        gsap.set([bio, mision, vision], { xPercent: -50, yPercent: -50 });
        const rect = bio.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        const side = dir === 'vertical' ? h : w;
        const overlap = Math.round(side * 0.62);

        // Despliegue relativo al ancho real del escenario: las cards laterales
        // nunca se salen (se ajusta a cualquier pantalla y a resize).
        const computeSpread = () => {
          if (dir !== 'horizontal') return Math.round(h * 0.55);
          const W = stage.offsetWidth;
          const raw = w + GAP;
          return Math.round(Math.max(0, Math.min(raw, (W - w) / 2 - GAP / 2)));
        };
        let spread = computeSpread();
        ScrollTrigger.addEventListener('refreshInit', () => {
          spread = computeSpread();
        });

        const setFinal = () => {
          if (dir === 'vertical') {
            gsap.set(mision, { x: 0, y: -spread, rotation: 0, scale: 1, opacity: 1 });
            gsap.set(vision, { x: 0, y: spread, rotation: 0, scale: 1, opacity: 1 });
          } else {
            gsap.set(mision, { x: -spread, y: 0, rotation: 0, scale: 1, opacity: 1 });
            gsap.set(vision, { x: spread, y: 0, rotation: 0, scale: 1, opacity: 1 });
          }
          gsap.set(bio, { x: 0, y: 0, scale: 1, opacity: 1 });
        };

        if (reduce) {
          setFinal();
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top 75%',
            end: 'max',
            scrub: 1,
          },
        });

        tl.fromTo(
          mision,
          { x: dir === 'vertical' ? 0 : -overlap, y: dir === 'vertical' ? 0 : 0, rotation: -2.5, scale: 0.88, opacity: 0.9 },
          { x: dir === 'vertical' ? 0 : () => -spread, y: dir === 'vertical' ? () => -spread : 0, rotation: 0, scale: 1, opacity: 1 },
          0
        )
          .fromTo(
            vision,
            { x: dir === 'vertical' ? 0 : overlap, y: 0, rotation: 2.5, scale: 0.88, opacity: 0.9 },
            { x: dir === 'vertical' ? 0 : () => spread, y: dir === 'vertical' ? () => spread : 0, rotation: 0, scale: 1, opacity: 1 },
            0
          )
          .fromTo(bio, { scale: 0.98 }, { scale: 1 }, 0);
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={stageRef} className={`${styles.stage} ${className ?? ''}`} data-stage>
      {cards.map((card) => (
        <article key={card.id} className={styles.card} data-card={card.id}>
          <p className={styles.eyebrow}>{card.eyebrow}</p>
          <h3 className={styles.title}>{card.title}</h3>
          <p className={styles.body}>{card.body}</p>
        </article>
      ))}
    </div>
  );
}