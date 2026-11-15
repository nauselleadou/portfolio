import { AnimatePresence, motion } from 'motion/react';
import { MapPin, X } from 'lucide-react';
import { StationDefinition } from '../data/stations';
import { StationContentRenderer } from './StationContentRenderer';

interface StationInfoModalProps {
  station: StationDefinition | null;
  onClose: () => void;
}

export function StationInfoModal({ station, onClose }: StationInfoModalProps) {
  return (
    <AnimatePresence>
      {station && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end p-3 sm:p-6 pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="station-modal-title"
        >
          {/* Architectural dim backdrop that keeps the 2.5D station visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1622]/45 backdrop-blur-[2px] pointer-events-auto"
          />

          <motion.div
            initial={{ opacity: 0, x: 28, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl max-h-[86vh] bg-[#F6F3EC] rounded-2xl border border-[#D8CCB8] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Header with single Revenir à la gare button */}
            <div className="px-6 py-4 border-b border-[#D8CCB8] bg-white flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium text-[#184354]">
                  <MapPin className="w-3.5 h-3.5 text-[#184354] shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    Gare {station.numberLabel} · {station.subtitle}
                  </span>
                </div>
                <h3
                  id="station-modal-title"
                  className="text-lg sm:text-xl font-bold text-[#0B1622] mt-0.5"
                >
                  {station.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#F5F1E8] bg-[#184354] hover:bg-[#102F3B] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Revenir à la gare</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              <StationContentRenderer sectionKey={station.sectionKey} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
