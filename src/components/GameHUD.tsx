import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Home,
  Lock,
  Maximize2,
  Minimize2,
  TrainFront,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { STATIONS_DATA, StationDefinition } from '../data/stations';
import { JourneyPhase } from '../game/TrainJourneyScene';

interface GameHUDProps {
  progressT: number;
  phase: JourneyPhase;
  currentStationIdx: number;
  discoveredStationIds: string[];
  unlockedBadges: string[];
  soundEnabled: boolean;
  isFullscreen: boolean;
  noticeMessage: string | null;
  newlyEarnedBadge: string | null;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onReturnHome: () => void;
  onOpenClassicPortfolio: () => void;
  onResumeJourney: () => void;
  onAdvanceTrain: () => void;
  onSelectStationFromHud: (stationIdx: number) => void;
  onTouchDrive: (dir: 'forward' | 'backward' | 'stop') => void;
}

export function GameHUD({
  progressT,
  phase,
  currentStationIdx,
  discoveredStationIds,
  unlockedBadges,
  soundEnabled,
  isFullscreen,
  noticeMessage,
  newlyEarnedBadge,
  onToggleSound,
  onToggleFullscreen,
  onReturnHome,
  onOpenClassicPortfolio,
  onResumeJourney,
  onAdvanceTrain,
  onTouchDrive,
}: GameHUDProps) {
  const [badgesOpen, setBadgesOpen] = useState(false);

  const currentStation: StationDefinition = STATIONS_DATA[currentStationIdx] ?? STATIONS_DATA[0];
  const nextStation: StationDefinition | undefined = STATIONS_DATA[currentStationIdx + 1];
  const isFinalStation = currentStationIdx >= STATIONS_DATA.length - 1;

  const isCurrentStationComplete = discoveredStationIds.includes(currentStation.id);

  const normalizedProgress = Math.round(
    Math.min(100, Math.max(0, (progressT / STATIONS_DATA[STATIONS_DATA.length - 1].stopT) * 100))
  );

  const isDocked = phase === 'EXPLORING' || phase === 'DISEMBARKING' || phase === 'BOARDING';

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-3 sm:p-4">
      {/* TOP BAR HUD */}
      <header className="flex flex-col gap-2.5">
        <div className="pointer-events-auto w-full bg-[#F6F3EC]/94 backdrop-blur-md border border-[#D8CCB8] rounded-xl px-3.5 py-2.5 shadow-lg shadow-[#0B1622]/15 flex flex-wrap items-center justify-between gap-3">
          {/* Station Info & Progress */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#0B1622] text-[#F5F1E8] flex items-center justify-center shrink-0 border border-[#235D73]">
              <TrainFront className="w-4.5 h-4.5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#4A5562] tabular-nums">
                <span className="font-mono font-semibold text-[#184354]">
                  Gare {currentStationIdx + 1}/6
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">
                  {isDocked
                    ? 'À quai — Terminus accessible'
                    : nextStation
                      ? `En route vers ${currentStation.name}`
                      : 'Arrivée au terminus'}
                </span>
              </div>
              <div className="text-sm sm:text-base font-bold text-[#0B1622] truncate">
                {currentStation.name}
              </div>
            </div>
          </div>

          {/* Mini-map of the 6 stations + linear progress bar */}
          <div className="hidden lg:flex flex-col gap-1.5 min-w-[340px] max-w-[440px] flex-1 px-2">
            <div className="flex items-center justify-between text-[11px] text-[#4A5562]">
              <span>Progression du voyage</span>
              <span className="font-mono tabular-nums font-semibold text-[#0B1622]">
                {normalizedProgress}%
              </span>
            </div>
            <div className="relative h-1.5 bg-[#EAE3D5] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#184354] via-[#235D73] to-[#274D3A] transition-all duration-150"
                style={{ width: `${normalizedProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-1" aria-label="Mini-carte des 6 gares">
              {STATIONS_DATA.map((st) => {
                const stComplete = discoveredStationIds.includes(st.id);
                const isCurrent = st.index === currentStationIdx;
                const isLocked = st.index > currentStationIdx;
                return (
                  <div
                    key={st.id}
                    title={`Gare ${st.numberLabel} : ${st.name}`}
                    className="flex items-center gap-1"
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center tabular-nums border ${
                        stComplete
                          ? 'bg-[#274D3A] border-[#1B3B2B] text-[#F5F1E8]'
                          : isCurrent
                            ? 'bg-[#184354] border-[#0B1622] text-[#F5F1E8]'
                            : isLocked
                              ? 'bg-[#F6F3EC] border-[#D8CCB8] text-[#7A848E]'
                              : 'bg-[#EAE3D5] border-[#B8AA93] text-[#24292E]'
                      }`}
                    >
                      {stComplete ? <Check className="w-3 h-3" /> : st.index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Utility Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setBadgesOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-[#EAE3D5] border border-[#D8CCB8] text-xs font-semibold text-[#0B1622] transition-colors cursor-pointer whitespace-nowrap"
              title="Voir les badges de progression"
            >
              <Award className="w-3.5 h-3.5 text-[#184354]" aria-hidden="true" />
              <span className="tabular-nums">Badges {unlockedBadges.length}/6</span>
            </button>

            <button
              type="button"
              onClick={onOpenClassicPortfolio}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-[#EAE3D5] border border-[#D8CCB8] text-xs font-semibold text-[#0B1622] transition-colors cursor-pointer whitespace-nowrap"
              title="Accès rapide au portfolio classique"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#184354]" aria-hidden="true" />
              <span className="hidden sm:inline">Portfolio classique</span>
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-white hover:bg-[#EAE3D5] border border-[#D8CCB8] text-[#0B1622] transition-colors cursor-pointer"
              aria-label={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
              title={soundEnabled ? 'Son activé' : 'Son désactivé'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#184354]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#636E7A]" />
              )}
            </button>

            <button
              type="button"
              onClick={onToggleFullscreen}
              className="hidden sm:inline-flex p-2 rounded-lg bg-white hover:bg-[#EAE3D5] border border-[#D8CCB8] text-[#0B1622] transition-colors cursor-pointer"
              aria-label={isFullscreen ? 'Quitter le plein écran' : 'Mode plein écran'}
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-[#184354]" />
              ) : (
                <Maximize2 className="w-4 h-4 text-[#184354]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setBadgesOpen(false);
                onReturnHome();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B1622] hover:bg-[#184354] border border-[#0B1622] text-xs font-semibold text-[#F5F1E8] transition-colors cursor-pointer whitespace-nowrap"
              title="Retour à l'accueil"
            >
              <Home className="w-3.5 h-3.5 text-[#9EC0D1]" aria-hidden="true" />
              <span>Accueil</span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet compact progress bar */}
        <div className="lg:hidden pointer-events-auto bg-[#F6F3EC]/92 backdrop-blur-md border border-[#D8CCB8] rounded-lg px-3 py-1.5 flex items-center justify-between gap-3">
          <div className="flex-1 h-1.5 bg-[#EAE3D5] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#184354] to-[#274D3A] transition-all duration-150"
              style={{ width: `${normalizedProgress}%` }}
            />
          </div>
          <span className="font-mono text-[11px] font-semibold text-[#0B1622] tabular-nums">
            {normalizedProgress}%
          </span>
        </div>
      </header>

      {/* FLOATING NOTIFICATIONS */}
      <div className="pointer-events-none flex flex-col items-center gap-2 my-auto">
        <AnimatePresence>
          {newlyEarnedBadge && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-[#0B1622] text-[#F5F1E8] px-5 py-3 rounded-xl border border-[#235D73] shadow-xl flex items-center gap-3"
            >
              <Award className="w-5 h-5 text-[#9EC0D1] shrink-0" aria-hidden="true" />
              <div className="text-xs sm:text-sm">
                <span className="text-[#9EC0D1] font-semibold">Nouveau badge débloqué : </span>
                <span className="font-bold">{newlyEarnedBadge}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {noticeMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-[#F6F3EC]/96 text-[#0B1622] px-4 py-2.5 rounded-xl border border-[#D8CCB8] shadow-lg text-xs sm:text-sm font-medium text-center max-w-md"
            >
              {noticeMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges Gallery Popover */}
        <AnimatePresence>
          {badgesOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-auto w-full max-w-xl bg-[#F6F3EC]/98 backdrop-blur-md rounded-xl border border-[#D8CCB8] shadow-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0B1622]">
                  Badges de progression ({unlockedBadges.length}/6)
                </h3>
                <button
                  type="button"
                  onClick={() => setBadgesOpen(false)}
                  className="text-xs font-semibold text-[#184354] hover:underline cursor-pointer"
                >
                  Fermer
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STATIONS_DATA.map((st) => {
                  const earned = unlockedBadges.includes(st.badgeTitle);
                  return (
                    <div
                      key={st.id}
                      className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                        earned
                          ? 'bg-white border-[#184354]/45'
                          : 'bg-[#EAE3D5]/55 border-[#D8CCB8] opacity-75'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-md shrink-0 ${
                          earned
                            ? 'bg-[#184354]/12 text-[#184354]'
                            : 'bg-[#D8CCB8]/60 text-[#55626E]'
                        }`}
                      >
                        {earned ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B1622]">{st.badgeTitle}</div>
                        <div className="text-[11px] text-[#4A5562] leading-snug mt-0.5">
                          {earned ? st.badgeDescription : `Découvrir la gare ${st.numberLabel}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM HUD: Drive Controls on bottom right */}
      <footer className="flex items-end justify-end">
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {phase === 'EXPLORING' && !isFinalStation && (
            <button
              type="button"
              onClick={onResumeJourney}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-colors cursor-pointer whitespace-nowrap ${
                isCurrentStationComplete
                  ? 'bg-[#0B1622] hover:bg-[#184354] text-[#F5F1E8]'
                  : 'bg-[#F6F3EC]/95 text-[#4A5562] border border-[#D8CCB8] hover:bg-white'
              }`}
            >
              <span>Reprendre le voyage</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          )}

          {phase === 'EXPLORING' && isFinalStation && isCurrentStationComplete && (
            <div className="bg-[#0B1622] border border-[#235D73] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#F5F1E8] shadow-lg">
              Voyage achevé · Félicitations !
            </div>
          )}

          {/* Touch & Mouse Drive Controls */}
          <div className="bg-[#F6F3EC]/94 backdrop-blur-md border border-[#D8CCB8] rounded-xl p-2 shadow-lg shadow-[#0B1622]/15 flex items-center gap-2">
            <button
              type="button"
              onPointerDown={() => onTouchDrive('backward')}
              onPointerUp={() => onTouchDrive('stop')}
              onPointerLeave={() => onTouchDrive('stop')}
              onPointerCancel={() => onTouchDrive('stop')}
              className="p-2.5 rounded-lg bg-white hover:bg-[#EAE3D5] active:bg-[#D8CCB8] text-[#0B1622] border border-[#D8CCB8] transition-colors cursor-pointer select-none"
              aria-label="Reculer doucement sur les rails"
              title="Reculer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onAdvanceTrain}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#184354] hover:bg-[#102F3B] active:bg-[#0B1622] text-[#F5F1E8] text-xs font-semibold transition-colors cursor-pointer select-none whitespace-nowrap"
            >
              <span>Avancer le train</span>
              <ArrowRight className="w-4 h-4 text-[#9EC0D1]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
