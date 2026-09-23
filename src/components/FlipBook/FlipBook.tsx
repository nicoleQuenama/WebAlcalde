import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  Children,
} from 'react';
import type { ComponentType } from 'react';
import styles from './FlipBook.module.css';
import ThreeBook from './ThreeBook/ThreeBook';
import type { FlipBookProps, MediaItem, TocItem, TocGroup, PageFlipLike, Phase, OpenSize, Rect } from '../../types/flipBook';
import { CLOSE_TIMEOUT_MS, OPEN_TIMEOUT_MS, TEXT_SIZES } from '../../constants/flipBook';
import { PLAY_ICON } from '@constants/book/book3D';
import {
  loadFlipBook,
  getCachedFlipBook,
  setCachedFlipBook,
  flattenPages,
  collectLabels,
  computeOpenSize as computeOpenSizeUtil,
  isVideoUrl,
  isYouTube,
  youTubeEmbed,
  animateBetween as animateBetweenUtil,
} from '../../lib/flipBook';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function FlipBook({
  children,
  className,
  bookRef,
  width,
  height,
  size = 'stretch',
  minWidth = 280,
  maxWidth = 480,
  minHeight = 420,
  maxHeight = 700,
  flippingTime = 800,
  drawShadow = true,
  maxShadowOpacity = 0.5,
  showPageCorners = true,
  mobileScrollSupport = true,
  swipeDistance = 30,
  usePortrait = true,
  eyebrow,
  title = 'Lee el libro',
  subtitle,
  ctaLabel = 'Abrir libro',
  coverImage,
  coverLabel3D = 'Cocha,\nla mejor ciudad\nde Bolivia',
  initialPage = 0,
  toc,
  onOpen,
  onClose,
}: FlipBookProps) {
  const [FlipBookComponent, setFlipBookComponent] =
    useState<ComponentType<Record<string, unknown>> | null>(getCachedFlipBook());
  const [pageIndex, setPageIndex] = useState(initialPage);
  const [phase, setPhase] = useState<Phase>('closed');
  const [openSize, setOpenSize] = useState<OpenSize | null>(null);
  const [mediaMode, setMediaMode] = useState<MediaItem | null>(null);
  const [textSize, setTextSize] = useState(0);
  const [scrubVal, setScrubVal] = useState(0);

  const closedSlotRef = useRef<HTMLDivElement>(null);
  const animWrapperRef = useRef<HTMLDivElement>(null);
  const animInnerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<{ pageFlip: () => PageFlipLike } | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyOverflowRef = useRef('');
  const htmlOverflowRef = useRef('');
  const phaseRef = useRef<Phase>('closed');
  const closingFlushedRef = useRef(false);
  const mediaRef = useRef<MediaItem | null>(null);
  const scrubbingRef = useRef(false);
  const scrubValRef = useRef(0);

  const pageCount = useMemo(
    () => Children.toArray(flattenPages(children)).length,
    [children]
  );

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    mediaRef.current = mediaMode;
  }, [mediaMode]);

  /* ---- load module ---- */
  useEffect(() => {
    let cancelled = false;
    if (!FlipBookComponent) {
      loadFlipBook().then((comp) => {
        if (!cancelled) {
          setCachedFlipBook(comp);
          setFlipBookComponent(comp);
        }
      });
    }
    return () => { cancelled = true; };
  }, [FlipBookComponent]);

  /* ---- compute open size (delegado a lib/flipBook) ---- */
  const computeOpenSize = useCallback((): OpenSize => computeOpenSizeUtil(width, height), [width, height]);

  /* ---- clear close safety timer ---- */
  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  /* ---- resolve close ---- */
  const finalizeClose = useCallback(() => {
    clearCloseTimer();
    setPhase('closed');
    setOpenSize(null);
    setMediaMode(null);
    onClose?.();
  }, [clearCloseTimer, onClose]);

  /* ---- OPEN ---- */
  const open = useCallback(() => {
    closingFlushedRef.current = false;
    const size = computeOpenSize();
    setOpenSize(size);
    setMediaMode(null);
    setPhase('opening');
    onOpen?.();
  }, [computeOpenSize, onOpen]);

  const openRef = useRef<() => void>(() => {});
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (bookRef) bookRef.current = flipRef.current;
  }, [bookRef]);

  /* ---- jump to index page (animated) ---- */
  const jumpToPage = useCallback((page: number) => {
    const inst = flipRef.current?.pageFlip();
    if (!inst || typeof inst.flip !== 'function') return;
    try {
      inst.flip(page);
      setPageIndex(page);
    } catch {
      /* spread inválido: ignorar */
    }
  }, []);

  /* ---- CLOSE ---- */
  const close = useCallback(() => {
    if (phase !== 'open' && phase !== 'opening') return;
    setPhase('closing');
    setMediaMode(null);

    /* safety fallback */
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      finalizeClose();
    }, CLOSE_TIMEOUT_MS);
  }, [phase, clearCloseTimer, finalizeClose]);

  /* ---- media triggers (data-expand) ---- */
  useEffect(() => {
    const stopPageTurn = (e: Event) => {
      const target = e.target as Element | null;
      if (target && typeof target.closest === 'function' && target.closest('[data-expand]')) {
        e.stopPropagation();
      }
    };

    const openMedia = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.('[data-expand]');
      if (!el) return;
      e.stopPropagation();

      const type: MediaItem['type'] = el.hasAttribute('data-video') ? 'video' : 'image';
      const url =
        el.getAttribute('data-url') ||
        (el instanceof HTMLImageElement ? el.currentSrc || el.src : '') ||
        null;
      const alt = el.getAttribute('data-alt') || el.getAttribute('alt') || '';

      if (type === 'video' && phaseRef.current === 'closed') {
        openRef.current();
      }
      setMediaMode({ type, url, alt });
    };

    document.addEventListener('mousedown', stopPageTurn, true);
    document.addEventListener('touchstart', stopPageTurn, true);
    document.addEventListener('click', openMedia, true);
    return () => {
      document.removeEventListener('mousedown', stopPageTurn, true);
      document.removeEventListener('touchstart', stopPageTurn, true);
      document.removeEventListener('click', openMedia, true);
    };
  }, []);

  /* ---- transitionend handler ---- */
  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== animWrapperRef.current) return;

      if (phase === 'opening') {
        /* Opening done → open */
        const wrapper = animWrapperRef.current;
        const inner = animInnerRef.current;
        if (wrapper) {
          wrapper.style.transition = 'none';
        }
        if (inner) {
          inner.style.transition = 'none';
          inner.style.transform = 'none';
        }
        setPhase('open');
        clearCloseTimer();
      } else if (phase === 'closing') {
        if (!closingFlushedRef.current) {
          closingFlushedRef.current = true;
          finalizeClose();
        }
      }
    },
    [phase, clearCloseTimer, finalizeClose]
  );

  /* ---- animate wrapper from rect A → rect B (delegado a lib/flipBook) ---- */
  const animateBetween = useCallback(
    (from: Rect, to: Rect, scaleFrom: number, scaleTo: number) => {
      const wrapper = animWrapperRef.current;
      const inner = animInnerRef.current;
      if (!wrapper || !inner) return;
      animateBetweenUtil(wrapper, inner, from, to, scaleFrom, scaleTo);
    },
    []
  );

  /* ---- OPENING: mount effect ---- */
  useIsomorphicLayoutEffect(() => {
    if (phase !== 'opening' || !openSize) return;

    const slotRect = closedSlotRef.current?.getBoundingClientRect();
    if (!slotRect) {
      setPhase('open');
      return;
    }

    const fromRect: Rect = {
      x: slotRect.x,
      y: slotRect.y,
      width: slotRect.width,
      height: slotRect.height,
    };

    const targetW = openSize.containerWidth;
    const targetH = openSize.height;
    const toRect: Rect = {
      x: (window.innerWidth - targetW) / 2,
      y: (window.innerHeight - targetH) / 2,
      width: targetW,
      height: targetH,
    };

    const scaleFrom = slotRect.height / openSize.height;
    animateBetween(fromRect, toRect, scaleFrom, 1);

    openTimerRef.current = setTimeout(() => {
      if (phaseRef.current !== 'opening') return;
      const wrapper = animWrapperRef.current;
      const inner = animInnerRef.current;
      if (wrapper) wrapper.style.transition = 'none';
      if (inner) {
        inner.style.transition = 'none';
        inner.style.transform = 'none';
      }
      setPhase('open');
      clearCloseTimer();
    }, OPEN_TIMEOUT_MS);

    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    };
  }, [phase, openSize, animateBetween, clearCloseTimer]);

  /* ---- CLOSING: animate back ---- */
  useIsomorphicLayoutEffect(() => {
    if (phase !== 'closing' || !openSize) return;

    const slotRect = closedSlotRef.current?.getBoundingClientRect();
    if (!slotRect) {
      finalizeClose();
      return;
    }

    const wrapper = animWrapperRef.current;
    const inner = animInnerRef.current;
    if (!wrapper || !inner) {
      finalizeClose();
      return;
    }

    /* al cerrar: animar desde el tamaño abierto al slot */
    const targetW = openSize.containerWidth;
    const targetH = openSize.height;
    const fromRect: Rect = {
      x: (window.innerWidth - targetW) / 2,
      y: (window.innerHeight - targetH) / 2,
      width: targetW,
      height: targetH,
    };

    const toRect: Rect = {
      x: slotRect.x,
      y: slotRect.y,
      width: slotRect.width,
      height: slotRect.height,
    };

    const scaleTo = slotRect.height / openSize.height;
    animateBetween(fromRect, toRect, 1, scaleTo);
  }, [phase, openSize, animateBetween, finalizeClose]);

  /* Índice (slider) y tamaño de letra (A−/A+) quedan visibles mientras el libro está abierto. */

  /* ---- scroll lock + ESC ---- */
  /* ---- scroll lock + header oculto mientras el libro esté abierto ---- */
  useEffect(() => {
    if (phase === 'closed') return;

    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    bodyOverflowRef.current = prevBody;
    htmlOverflowRef.current = prevHtml;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('flipbook-open');

    return () => {
      document.body.style.overflow = bodyOverflowRef.current;
      document.documentElement.style.overflow = htmlOverflowRef.current;
      document.body.classList.remove('flipbook-open');
    };
  }, [phase]);

  /* ---- teclado: Esc / flechas ---- */
  useEffect(() => {
    if (phase === 'closed') return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mediaRef.current) {
          setMediaMode(null);
        } else {
          close();
        }
        return;
      }

      if (mediaRef.current) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (scrubbingRef.current) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA')
      ) {
        return;
      }

      const inst = flipRef.current?.pageFlip();
      if (!inst) return;

      if (e.key === 'ArrowRight' && pageIndex >= pageCount - 1) return;
      if (e.key === 'ArrowLeft' && pageIndex <= 0) return;

      if (e.key === 'ArrowRight') inst.flipNext?.();
      else inst.flipPrev?.();
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [phase, close, pageIndex, pageCount]);

  /* ---- cleanup timer on unmount ---- */
  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  /* ---- derived ---- */
  const isOpen = phase !== 'closed';

  const pages = useMemo(() => Children.toArray(flattenPages(children)), [children]);

  /* ---- índice: normalizar a grupos ---- */
  const tocGroups = useMemo<TocGroup[] | null>(() => {
    if (toc && toc.length) {
      const flat = toc as TocItem[];
      const grouped = toc as TocGroup[];
      if (Array.isArray(flat) && flat.some((t) => 'page' in t)) {
        return [{ items: flat }];
      }
      if (grouped.length) return grouped;
    }
    const labels: string[] = [];
    Children.forEach(flattenPages(children), (child) => collectLabels(child, labels));
    if (!labels.length) return null;
    return [{ items: labels.map((label, page) => ({ label, page })) }];
  }, [children, toc]);

  const tocItems = useMemo<TocItem[] | null>(
    () => tocGroups?.flatMap((g) => g.items) ?? null,
    [tocGroups]
  );

  /* ---- scrubber: slider horizontal (páginas) ---- */
  const spreadsCount = useMemo(
    () => Math.max(1, Math.ceil(pages.length / 2)),
    [pages.length]
  );

  const pageOfSpread = useCallback(
    (v: number): number => Math.min(v * 2, Math.max(0, pages.length - 1)),
    [pages.length]
  );

  const labelOfPage = useCallback(
    (page: number): string | null => {
      if (!tocItems) return null;
      const spread = Math.floor(page / 2);
      return (
        tocItems.find((it) => Math.floor(it.page / 2) === spread)?.label ?? null
      );
    },
    [tocItems]
  );

  const currentSpread = Math.min(
    Math.max(0, Math.floor(pageIndex / 2)),
    spreadsCount - 1
  );

  const handleScrubInput = useCallback((v: number) => {
    scrubbingRef.current = true;
    scrubValRef.current = v;
    setScrubVal(v);
  }, []);

  const handleScrubCommit = useCallback(() => {
    scrubbingRef.current = false;
    const target = pageOfSpread(scrubValRef.current);
    jumpToPage(target);
  }, [pageOfSpread, jumpToPage]);

  /* ---- commit del scrub cuando suelta/teclado en cualquier lado ---- */
  useEffect(() => {
    if (phase !== 'open') return;
    const commit = () => {
      if (scrubbingRef.current) handleScrubCommit();
    };
    window.addEventListener('pointerup', commit);
    window.addEventListener('touchend', commit);
    window.addEventListener('keyup', commit);
    return () => {
      window.removeEventListener('pointerup', commit);
      window.removeEventListener('touchend', commit);
      window.removeEventListener('keyup', commit);
    };
  }, [phase, handleScrubCommit]);

  /* ---- reveal: animar contenido de la(s) página(s) visible(s) ---- */
  const visiblePagesOf = useCallback(
    (left: number): number[] => {
      if (pages.length % 2 === 1 && left === pages.length - 1) return [left];
      if (left + 1 < pages.length) return [left, left + 1];
      return [left];
    },
    [pages.length]
  );

  const revealVisiblePages = useCallback(
    (...visible: number[]) => {
      const inst = flipRef.current?.pageFlip();
      const block = inst?.getUI?.()?.getDistElement?.();
      if (!block) return;
      const items = Array.from(block.querySelectorAll<HTMLElement>('.stf__item'));
      const wanted = new Set(visible);
      items.forEach((el, i) => {
        if (i >= pages.length) return;
        if (wanted.has(i)) {
          el.removeAttribute('data-page-shown');
          void el.offsetWidth;
          el.setAttribute('data-page-shown', 'true');
          const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
          targets.forEach((t, k) =>
            t.style.setProperty('--delay', `${k * 70}ms`)
          );
        } else {
          el.removeAttribute('data-page-shown');
        }
      });
    },
    [pages.length]
  );

  const shared = {
    size,
    minWidth,
    minHeight,
    maxHeight,
    flippingTime,
    drawShadow,
    maxShadowOpacity,
    showPageCorners,
    mobileScrollSupport,
    swipeDistance,
    usePortrait,
    startZIndex: 0,
    autoSize: true,
    clickEventForward: true,
    useMouseEvents: true,
    disableFlipByClick: false,
    onFlip: (event: { data: number }) => {
      setPageIndex(event.data);
      revealVisiblePages(...visiblePagesOf(event.data));
    },
    onInit: () => {
      revealVisiblePages(...visiblePagesOf(pageIndex));
    },
  };



  return (
    <>
      {/* ---- RECUADRO (always mounted, hidden during overlay) ---- */}
      <section
        className={`${styles.stage} ${isOpen ? styles.stageHidden : ''} ${className ?? ''}`}
      >
        <div className={styles.hero}>
          {eyebrow ? (
            <span className={styles.heroEyebrow}>{eyebrow}</span>
          ) : null}
          <h2 className={styles.heroTitle}>{title}</h2>
          {subtitle ? <p className={styles.heroText}>{subtitle}</p> : null}
          <button type="button" className={styles.cta} onClick={open}>
            {ctaLabel}
          </button>
        </div>

        <div ref={closedSlotRef} className={styles.closedSlot}>
          <ThreeBook
            coverLabel={coverLabel3D}
            coverImage={coverImage}
            onOpen={open}
          />
        </div>
      </section>

      {/* ---- OVERLAY: backdrop + wrapper animado ---- */}
      {isOpen && (
        <>
          <div
            className={`${styles.overlayBg} ${
              phase === 'closing' ? styles.overlayBgClosing : ''
            }`}
          />

          <div
            ref={animWrapperRef}
            className={styles.animWrapper}
            onTransitionEnd={handleTransitionEnd}
          >
            <div
              ref={animInnerRef}
              className={styles.animInner}
              data-textsize={textSize}
            >
              {openSize &&
                (phase === 'opening' ? (
                  <div className={styles.bookGhost} aria-hidden="true" />
                ) : FlipBookComponent ? (
                  <FlipBookComponent
                    ref={flipRef}
                    className={styles.flipMount}
                    width={openSize.width}
                    height={openSize.height}
                    startPage={pageIndex}
                    maxWidth={Math.ceil(openSize.width)}
                    showCover={false}
                    {...shared}
                  >
                    {pages}
                  </FlipBookComponent>
                ) : (
                  <div className={styles.loading}>Cargando libro…</div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* ---- OPEN-ONLY UI ---- */}
      {phase === 'open' && (
        <>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={close}
            aria-label="Cerrar"
            title="Cerrar"
          >
            ✕
          </button>

          {mediaMode && (
            <div className={styles.mediaOverlay}>
              <div className={styles.mediaBox}>
                <button
                  type="button"
                  className={styles.mediaClose}
                  onClick={() => setMediaMode(null)}
                  aria-label="Volver al libro"
                >
                  ← Volver al libro
                </button>

                {mediaMode.type === 'image' ? (
                  mediaMode.url ? (
                    <div className={styles.mediaFrame}>
                      <img
                        className={styles.mediaImg}
                        src={mediaMode.url}
                        alt={mediaMode.alt}
                      />
                    </div>
                  ) : (
                    <div className={styles.mediaPlaceholder}>
                      <span className={styles.mediaIcon}>a</span>
                      <span>{mediaMode.alt || 'Imagen'}</span>
                    </div>
                  )
                ) : mediaMode.url && isYouTube(mediaMode.url) ? (
                  <div className={styles.mediaFrame}>
                    <iframe
                      className={styles.mediaYouTube}
                      src={youTubeEmbed(mediaMode.url) ?? mediaMode.url}
                      title={mediaMode.alt || 'Video de YouTube'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : mediaMode.url && isVideoUrl(mediaMode.url) ? (
                  <div className={styles.mediaFrame}>
                    <video
                      className={styles.mediaVideo}
                      src={mediaMode.url}
                      controls
                      autoPlay
                      loop
                      playsInline
                    />
                  </div>
                ) : (
                  <div className={styles.mediaPlaceholder}>
                    <span className={styles.mediaIcon}>{PLAY_ICON}</span>
                    <span>Video en pantalla completa</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!mediaMode && (
            <>
              {/* ---- Slider de páginas / índice: siempre visible con el libro abierto ---- */}
              <div
                className={`${styles.scrubWrap} ${styles.scrubWrapOpen}`}
                title="Navegar entre páginas"
              >
                <div className={styles.scrubInner}>
                  <input
                    type="range"
                    className={styles.scrubRange}
                    min={0}
                    max={spreadsCount - 1}
                    step={1}
                    value={
                      scrubbingRef.current ? scrubVal : currentSpread
                    }
                    aria-label="Página"
                    onInput={(e) =>
                      handleScrubInput(
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                  />
                  <span className={styles.scrubBadge}>
                    Página {pageOfSpread(
                      scrubbingRef.current ? scrubVal : currentSpread
                    ) + 1}
                    {labelOfPage(
                      pageOfSpread(
                        scrubbingRef.current ? scrubVal : currentSpread
                      )
                    )
                      ? ` · ${labelOfPage(
                          pageOfSpread(
                            scrubbingRef.current ? scrubVal : currentSpread
                          )
                        )}`
                      : ''}
                  </span>
                </div>
              </div>

              {/* ---- Tamaño de letra: control siempre visible arriba-izquierda ---- */}
              <div
                className={`${styles.fontWrap} ${styles.fontWrapOpen}`}
                title="Tamaño de letra"
              >
                <div className={styles.fontInner} role="group" aria-label="Tamaño de letra">
                  <span className={styles.fontIcon} aria-hidden="true">
                    A−
                  </span>
                  <input
                    type="range"
                    className={styles.fontRange}
                    min={0}
                    max={2}
                    step={1}
                    value={textSize}
                    onChange={(e) =>
                      setTextSize(
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                    aria-label="Tamaño de letra"
                  />
                  <span className={styles.fontIcon} aria-hidden="true">
                    A+
                  </span>
                  <span className={styles.fontValue}>
                    {TEXT_SIZES[textSize]}
                  </span>
                </div>
              </div>
            </>
          )}

          {!tocItems && (
            <p className={styles.overlayHint}>
              {mediaMode
                ? 'Haz clic en "Volver al libro" para continuar'
                : 'Presiona Esc para cerrar'}
            </p>
          )}
        </>
      )}
    </>
  );
}