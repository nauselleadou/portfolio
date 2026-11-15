import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Compass, MousePointerClick, TrainFront, X } from 'lucide-react';
import { PROFILE_DATA } from '../data/profile';
import { STATIONS_DATA } from '../data/stations';

interface AboutJourneyModalProps {
  open: boolean;
  onClose: () => void;
  onStartJourney: () => void;
}

export function AboutJourneyModal({ open, onClose, onStartJourney }: AboutJourneyModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1622]/70 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-journey-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl bg-[#F6F3EC] rounded-2xl border border-[#D8CCB8] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-[#0B1622]"
          >
            <div className="px-6 py-5 border-b border-[#D8CCB8] flex items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-[#184354]" aria-hidden="true" />
                <h2 id="about-journey-title" className="text-lg font-bold text-[#0B1622]">
                  À propos du voyage
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-[#4A5562] hover:text-[#0B1622] hover:bg-[#EAE3D5] transition-colors cursor-pointer"
                aria-label="Fermer la fenêtre"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto text-sm text-[#24292E] leading-relaxed">
              <p className="text-[#0B1622] font-medium font-editorial text-lg">
                « {PROFILE_DATA.welcomeJourneyText} »
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#D8CCB8] space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-[#0B1622]">
                    <TrainFront className="w-4 h-4 text-[#184354]" aria-hidden="true" />
                    <span>Commandes du train</span>
                  </div>
                  <p className="text-xs text-[#4A5562] leading-relaxed">
                    Sur ordinateur, utilisez uniquement les flèches directionnelles pour faire
                    avancer le train sur ses rails. Sur tactile, maintenez le bouton de conduite à
                    l’écran.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#D8CCB8] space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-[#0B1622]">
                    <MousePointerClick className="w-4 h-4 text-[#274D3A]" aria-hidden="true" />
                    <span>Exploration des gares</span>
                  </div>
                  <p className="text-xs text-[#4A5562] leading-relaxed">
                    À l’arrivée en gare, le train s’arrête automatiquement, les portes s’ouvrent et
                    le personnage descend sur le quai. Cliquez directement sur le terminus pour
                    débloquer l’étape suivante.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-[#0B1622]">
                  Les 6 gares dans l’ordre du parcours
                </h3>
                <ol className="space-y-2">
                  {STATIONS_DATA.map((st) => (
                    <li
                      key={st.id}
                      className="flex items-baseline justify-between gap-3 py-1.5 border-b border-[#D8CCB8]/70 last:border-b-0"
                    >
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-mono text-xs font-semibold text-[#184354] tabular-nums">
                          Gare {st.numberLabel}
                        </span>
                        <span className="font-semibold text-[#0B1622]">{st.name}</span>
                      </div>
                      <span className="text-xs text-[#4A5562] shrink-0">{st.subtitle}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#D8CCB8] bg-white flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#4A5562] hover:bg-[#EAE3D5] transition-colors cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartJourney();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#184354] hover:bg-[#102F3B] text-[#F5F1E8] text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>Embarquer maintenant</span>
                <ArrowRight className="w-4 h-4 text-[#9EC0D1]" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
