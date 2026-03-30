import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTour, TOUR_STEPS } from '../contexts/TourContext';

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT_APPROX = 220;

function TooltipArrow({ direction }: { direction?: string }) {
  if (!direction) return null;
  const cls = 'w-6 h-6 text-white';
  if (direction === 'up') return <ArrowUp className={cls} />;
  if (direction === 'down') return <ArrowDown className={cls} />;
  if (direction === 'left') return <ArrowLeft className={cls} />;
  if (direction === 'right') return <ArrowRight className={cls} />;
  return null;
}

export function TourOverlay() {
  const { isTourActive, currentStep, currentStepIndex, totalSteps, nextStep, prevStep, skipTour } = useTour();
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [arrowPos, setArrowPos] = useState({ top: 0, left: 0 });
  const [arrowDir, setArrowDir] = useState<string | undefined>(undefined);
  const [isScrolling, setIsScrolling] = useState(false);
  const rafRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const updateHighlight = useCallback(() => {
    if (!currentStep?.selector) {
      setHighlightRect(null);
      return;
    }
    const el = document.querySelector(currentStep.selector) as HTMLElement;
    if (!el) {
      setHighlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 10;
    const hRect: HighlightRect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    setHighlightRect(hRect);

    // Position tooltip
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pos = currentStep.position ?? 'bottom';
    let top = 0;
    let left = 0;
    const arrowSize = 40;

    switch (pos) {
      case 'bottom':
        top = rect.bottom + padding + arrowSize;
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        setArrowPos({ top: rect.bottom + padding, left: rect.left + rect.width / 2 - arrowSize / 2 });
        setArrowDir('down');
        break;
      case 'top':
        top = rect.top - padding - arrowSize - TOOLTIP_HEIGHT_APPROX;
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        setArrowPos({ top: rect.top - padding - arrowSize, left: rect.left + rect.width / 2 - arrowSize / 2 });
        setArrowDir('up');
        break;
      case 'left':
        top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT_APPROX / 2;
        left = rect.left - padding - TOOLTIP_WIDTH - arrowSize;
        setArrowPos({ top: rect.top + rect.height / 2 - arrowSize / 2, left: rect.left - padding - arrowSize });
        setArrowDir('right');
        break;
      case 'right':
        top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT_APPROX / 2;
        left = rect.right + padding + arrowSize;
        setArrowPos({ top: rect.top + rect.height / 2 - arrowSize / 2, left: rect.right + padding });
        setArrowDir('left');
        break;
      default:
        top = vh / 2 - TOOLTIP_HEIGHT_APPROX / 2;
        left = vw / 2 - TOOLTIP_WIDTH / 2;
        setArrowDir(undefined);
        break;
    }

    // Clamp to viewport
    left = Math.max(16, Math.min(left, vw - TOOLTIP_WIDTH - 16));
    top = Math.max(16, Math.min(top, vh - TOOLTIP_HEIGHT_APPROX - 16));
    setTooltipPos({ top, left });
  }, [currentStep]);

  // Scroll into view + update highlight
  useEffect(() => {
    if (!isTourActive || !currentStep) return;

    const target = currentStep.scrollTo ?? currentStep.selector;

    if (target) {
      const el = document.querySelector(target) as HTMLElement;
      if (el) {
        setIsScrolling(true);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
          updateHighlight();
        }, 700);
        return;
      }
    }

    setIsScrolling(false);
    setHighlightRect(null);
    setArrowDir(undefined);
    // Center tooltip for steps without selectors
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setTooltipPos({ top: vh / 2 - TOOLTIP_HEIGHT_APPROX / 2, left: vw / 2 - TOOLTIP_WIDTH / 2 });
  }, [currentStep, isTourActive, updateHighlight]);

  // Follow on resize / scroll
  useEffect(() => {
    if (!isTourActive) return;
    const onScroll = () => { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(updateHighlight); };
    const onResize = () => updateHighlight();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTourActive, updateHighlight]);

  const isCenter = !currentStep?.selector || currentStep.position === 'center';
  const stepLabel = `Step ${currentStepIndex + 1} of ${totalSteps}`;

  // Format description newlines
  const formatDesc = (desc: string) =>
    desc.split('\n').map((line, i) => (
      <span key={i}>{line}{i < desc.split('\n').length - 1 && <br />}</span>
    ));

  // Arrow bounce values
  const arrowBounceY = arrowDir === 'up' || arrowDir === 'down' ? [0, -6, 0] : [0, 0, 0];
  const arrowBounceX = arrowDir === 'left' || arrowDir === 'right' ? [0, -6, 0] : [0, 0, 0];

  return (
    <AnimatePresence>
      {isTourActive && (
        <>
          {/* ── Dark backdrop with spotlight cutout ── */}
          <motion.div
            key="tour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9000] pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          >
            {/* Spotlight: cut out highlighted element */}
            {highlightRect && !isScrolling && (
              <div
                className="absolute rounded-2xl"
                style={{
                  top: highlightRect.top,
                  left: highlightRect.left,
                  width: highlightRect.width,
                  height: highlightRect.height,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
                  background: 'transparent',
                  borderRadius: 16,
                  border: '2px solid rgba(139,92,246,0.8)',
                  zIndex: 1,
                }}
              />
            )}
          </motion.div>

          {/* Click capture layer (lets user click through to highlighted element) */}
          <div
            className="fixed inset-0 z-[9001]"
            style={{ pointerEvents: 'all' }}
            onClick={(e) => {
              // Don't capture clicks over the highlighted element
              if (highlightRect) {
                const { clientX: x, clientY: y } = e;
                if (
                  x >= highlightRect.left && x <= highlightRect.left + highlightRect.width &&
                  y >= highlightRect.top && y <= highlightRect.top + highlightRect.height
                ) {
                  return; // Allow interaction with highlighted element
                }
              }
              // Do nothing — prevents clicking outside
            }}
          />

          {/* ── Bouncing Arrow ── */}
          {highlightRect && !isScrolling && arrowDir && (
            <motion.div
              key={`arrow-${currentStepIndex}`}
              initial={{ opacity: 0, y: 0, x: 0 }}
              animate={{ opacity: 1, y: arrowBounceY, x: arrowBounceX }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              className="fixed z-[9003] pointer-events-none"
              style={{ top: arrowPos.top, left: arrowPos.left }}
            >
              <div className="bg-violet-600 rounded-full p-1.5 shadow-lg shadow-violet-500/50">
                <TooltipArrow direction={arrowDir} />
              </div>
            </motion.div>
          )}

          {/* ── Tooltip Card ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`tooltip-${currentStepIndex}`}
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -10 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 22 }}
              className="fixed z-[9005] pointer-events-all"
              style={
                isCenter
                  ? {
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: TOOLTIP_WIDTH,
                    }
                  : {
                      top: tooltipPos.top,
                      left: tooltipPos.left,
                      width: TOOLTIP_WIDTH,
                    }
              }
            >
              {/* Glass card */}
              <div
                className="rounded-2xl p-5 shadow-2xl"
                style={{
                  background: 'var(--card, rgba(255,255,255,0.97))',
                  border: '1.5px solid rgba(139,92,246,0.35)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 40px rgba(139,92,246,0.25), 0 2px 16px rgba(0,0,0,0.18)',
                }}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(263,70%,60%)] opacity-80">
                    {stepLabel}
                  </span>
                  <button
                    onClick={skipTour}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-gray-400 hover:text-gray-600"
                    title="Skip tour"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 rounded-full bg-gray-200 dark:bg-white/10 mb-4 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* Content */}
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2 leading-snug">
                  {currentStep?.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed mb-4">
                  {formatDesc(currentStep?.description ?? '')}
                </p>

                {/* Buttons */}
                <div className="flex gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    {currentStepIndex > 0 && (
                      <button
                        onClick={prevStep}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={skipTour}
                      className="px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                    >
                      Skip tour
                    </button>
                    {!currentStep?.waitForAction && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={nextStep}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                          boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
                        }}
                      >
                        {currentStepIndex === totalSteps - 1 ? (
                          "Finish 🎉"
                        ) : (
                          <>
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
