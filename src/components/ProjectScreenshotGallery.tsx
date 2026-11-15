import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X, ZoomIn } from 'lucide-react';
import { ProjectScreenshot } from '../data/projects';

interface ProjectScreenshotGalleryProps {
  projectTitle: string;
  screenshots: ProjectScreenshot[];
}

export function ProjectScreenshotGallery({
  projectTitle,
  screenshots,
}: ProjectScreenshotGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  const hasScreenshots = screenshots.length > 0;
  const activeShot = activeIndex !== null ? screenshots[activeIndex] ?? null : null;

  const handlePrev = useCallback(() => {
    if (activeIndex === null || screenshots.length === 0) return;
    setDirection(-1);
    setActiveIndex((activeIndex - 1 + screenshots.length) % screenshots.length);
  }, [activeIndex, screenshots.length]);

  const handleNext = useCallback(() => {
    if (activeIndex === null || screenshots.length === 0) return;
    setDirection(1);
    setActiveIndex((activeIndex + 1) % screenshots.length);
  }, [activeIndex, screenshots.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, handlePrev, handleNext]);

  return (
    <div className="pt-3 border-t border-[#EAE3D5] space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-[#0B1622]">Aperçu de l’application</div>
        {hasScreenshots && (
          <span className="text-[11px] font-mono text-[#184354] tabular-nums">
            {screenshots.length} {screenshots.length > 1 ? 'captures' : 'capture'}
          </span>
        )}
      </div>

      {!hasScreenshots ? (
        <div className="px-3.5 py-2.5 rounded-lg bg-[#F6F3EC]/70 border border-[#D8CCB8] flex items-center gap-2 text-xs text-[#4A5562]">
          <ImageIcon className="w-3.5 h-3.5 text-[#184354] shrink-0" aria-hidden="true" />
          <span>Aperçu bientôt disponible</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-1.5 md:pb-0"
        >
          {screenshots.map((shot, idx) => (
            <motion.button
              key={shot.url}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.08, 0.3), ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                setDirection(1);
                setActiveIndex(idx);
              }}
              className="group shrink-0 w-[75%] sm:w-[46%] md:w-auto snap-start text-left rounded-xl overflow-hidden border border-[#D8CCB8] bg-[#F6F3EC] shadow-xs hover:shadow-md hover:border-[#184354] transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#184354]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-white">
                <img
                  src={shot.url}
                  alt={`${projectTitle} — ${shot.title}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute bottom-2 right-2 p-1.5 rounded-md bg-[#0B1622]/85 text-[#F5F1E8] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
              <div className="px-2.5 py-2 bg-white border-t border-[#EAE3D5]">
                <div className="text-[11px] font-medium text-[#0B1622] truncate">{shot.title}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Interactive Lightbox Viewer */}
      <AnimatePresence>
        {activeShot && activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setActiveIndex(null)}
            className="fixed inset-0 z-50 bg-[#0B1622]/85 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${projectTitle} — ${activeShot.title}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-[#F6F3EC] rounded-2xl border border-[#D8CCB8] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Viewer Top Bar */}
              <div className="px-4 sm:px-5 py-3 bg-white border-b border-[#D8CCB8] flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-[#184354] tabular-nums">
                    {projectTitle} · {activeIndex + 1} / {screenshots.length}
                  </div>
                  <h6 className="text-sm font-bold text-[#0B1622] truncate">{activeShot.title}</h6>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F6F3EC] hover:bg-[#EAE3D5] text-xs font-semibold text-[#0B1622] border border-[#D8CCB8] transition-colors cursor-pointer shrink-0"
                  aria-label="Fermer la visionneuse"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Fermer</span>
                </button>
              </div>

              {/* Large Image Canvas with directional crossfade */}
              <div className="relative bg-[#0B1622]/5 p-3 sm:p-5 flex items-center justify-center min-h-[260px] max-h-[72vh] overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.img
                    key={activeShot.url}
                    src={activeShot.url}
                    alt={`${projectTitle} — ${activeShot.title}`}
                    referrerPolicy="no-referrer"
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 20, scale: 0.985 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: direction * -20, scale: 0.985 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-full max-h-[64vh] object-contain rounded-lg shadow-sm bg-white"
                  />
                </AnimatePresence>
              </div>

              {/* Viewer Controls Footer */}
              <div className="px-4 sm:px-5 py-3 bg-white border-t border-[#D8CCB8] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={screenshots.length <= 1}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F6F3EC] hover:bg-[#EAE3D5] disabled:opacity-45 text-xs font-semibold text-[#0B1622] border border-[#D8CCB8] transition-colors cursor-pointer disabled:cursor-default"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Précédent</span>
                </button>

                <span className="text-xs font-mono font-semibold text-[#184354] tabular-nums">
                  {activeIndex + 1} / {screenshots.length}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={screenshots.length <= 1}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#184354] hover:bg-[#102F3B] disabled:opacity-45 text-xs font-semibold text-[#F5F1E8] transition-colors cursor-pointer disabled:cursor-default"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
