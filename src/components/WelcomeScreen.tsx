import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Compass, TrainFront } from 'lucide-react';
import { PROFILE_DATA } from '../data/profile';
import { STATIONS_DATA } from '../data/stations';

interface WelcomeScreenProps {
  onStartJourney: () => void;
  onOpenClassicPortfolio: () => void;
  onOpenAboutJourney: () => void;
}

export function WelcomeScreen({
  onStartJourney,
  onOpenClassicPortfolio,
  onOpenAboutJourney,
}: WelcomeScreenProps) {
  const [litStationIdx, setLitStationIdx] = useState<number | null>(null);

  const stationPositions = [8, 25, 42, 59, 76, 92];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0B1622] via-[#102133] to-[#0B1622] text-[#F5F1E8] flex flex-col justify-between overflow-x-hidden relative">
      {/* Subtle architectural grid & ambient horizon glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #9EC0D1 1px, transparent 1px), linear-gradient(to bottom, #9EC0D1 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-[48%] h-48 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#235D73]/25 to-transparent blur-2xl" />

      {/* Top Navigation Header */}
      <header className="relative z-10 w-full max-w-[1360px] mx-auto px-6 md:px-12 pt-7 pb-3 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5F1E8]/10">
        <div className="flex items-center gap-3 text-sm font-display font-semibold tracking-wider text-[#F5F1E8] uppercase">
          <TrainFront className="w-4 h-4 text-[#9EC0D1]" aria-hidden="true" />
          <span>MON VOYAGE NUMÉRIQUE</span>
        </div>
        <div className="text-xs text-[#D8CCB8]/85 tracking-wide">
          Adou Marie Nauselle Kimberly Aude · Data Science &amp; Intelligence Artificielle
        </div>
      </header>

      {/* Editorial Hero Title & Actions */}
      <main className="relative z-10 flex-1 flex flex-col justify-center py-8 md:py-10">
        <div className="w-full max-w-[1360px] mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
          >
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-mono tracking-[0.22em] text-[#9EC0D1] uppercase">
                {PROFILE_DATA.slogan}
              </p>
              <h1
                className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F5F1E8] leading-[1.04]"
                style={{ textWrap: 'balance' }}
              >
                {PROFILE_DATA.projectTitle}
              </h1>
              <p className="text-sm sm:text-base text-[#D8CCB8] leading-relaxed max-w-2xl font-light">
                « {PROFILE_DATA.welcomeHomeText} »
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row flex-wrap lg:justify-end gap-3">
              <button
                type="button"
                onClick={onStartJourney}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#F5F1E8] hover:bg-white text-[#0B1622] font-semibold text-xs sm:text-sm tracking-wide transition-colors shadow-lg shadow-[#0B1622]/40 cursor-pointer whitespace-nowrap"
              >
                <TrainFront className="w-4 h-4 text-[#184354] shrink-0" aria-hidden="true" />
                <span>EMBARQUER POUR LE VOYAGE</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onOpenClassicPortfolio}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-[#184354]/70 hover:bg-[#184354] text-[#F5F1E8] border border-[#F5F1E8]/20 font-medium text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 text-[#9EC0D1] shrink-0" aria-hidden="true" />
                <span>ACCÈS RAPIDE AU PORTFOLIO</span>
              </button>

              <button
                type="button"
                onClick={onOpenAboutJourney}
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-transparent hover:bg-[#F5F1E8]/8 text-[#D8CCB8] hover:text-[#F5F1E8] border border-transparent hover:border-[#F5F1E8]/15 font-medium text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-4 h-4 text-[#8AA694] shrink-0" aria-hidden="true" />
                <span>À PROPOS DU VOYAGE</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Full-Width Luminous Railway Line, 6 Stations & Realistic Train Silhouette */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          aria-label="Ligne ferroviaire des six gares"
          className="relative w-full mt-10 md:mt-14 select-none"
        >
          {/* Desktop / Tablet Panoramic Luminous Railway */}
          <div className="hidden md:block relative w-full h-[270px]">
            <div className="relative w-full max-w-[1440px] mx-auto h-full">
              {/* Realistic Sleek High-Speed Express Train Silhouette */}
              <div className="absolute left-[11%] top-[68px] w-[390px] pointer-events-none z-10">
                <svg
                  viewBox="0 0 420 76"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)]"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="trainBody" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1B2A38" />
                      <stop offset="65%" stopColor="#263B4D" />
                      <stop offset="100%" stopColor="#355168" />
                    </linearGradient>
                    <linearGradient id="headlightCone" x1="370" y1="45" x2="420" y2="45" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#F5F1E8" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#9EC0D1" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="stripeSilver" x1="10" y1="44" x2="372" y2="44" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6E8C7A" stopOpacity="0.6" />
                      <stop offset="60%" stopColor="#9EC0D1" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#F5F1E8" stopOpacity="1" />
                    </linearGradient>
                  </defs>

                  <polygon points="368,42 420,26 420,62 368,48" fill="url(#headlightCone)" />

                  <path
                    d="M8 22 C8 17 12 14 18 14 L126 14 C129 14 131 16 131 19 L131 53 L8 53 Z"
                    fill="url(#trainBody)"
                    stroke="#9EC0D1"
                    strokeOpacity="0.38"
                    strokeWidth="0.8"
                  />
                  <rect x="131" y="17" width="6" height="35" fill="#0B1622" />

                  <rect
                    x="137"
                    y="14"
                    width="118"
                    height="39"
                    rx="2"
                    fill="url(#trainBody)"
                    stroke="#9EC0D1"
                    strokeOpacity="0.38"
                    strokeWidth="0.8"
                  />
                  <rect x="255" y="17" width="6" height="35" fill="#0B1622" />

                  <path
                    d="M261 14 L328 14 C346 14 366 28 378 44 C381 48 378 53 372 53 L261 53 Z"
                    fill="url(#trainBody)"
                    stroke="#9EC0D1"
                    strokeOpacity="0.52"
                    strokeWidth="0.9"
                  />

                  {[20, 42, 64, 86, 108, 148, 170, 192, 214, 236, 272, 294, 316].map((wx) => (
                    <rect
                      key={wx}
                      x={wx}
                      y="24"
                      width="15"
                      height="9"
                      rx="1.5"
                      fill="#F5F1E8"
                      fillOpacity="0.88"
                    />
                  ))}

                  <path d="M336 22 L352 24 L366 37 L336 36 Z" fill="#9EC0D1" fillOpacity="0.78" />
                  <line x1="10" y1="43" x2="374" y2="43" stroke="url(#stripeSilver)" strokeWidth="2" />

                  {[30, 106, 158, 234, 282, 344].map((bx) => (
                    <g key={bx}>
                      <rect x={bx - 12} y="53" width="24" height="5" rx="1.5" fill="#0B1622" />
                      <circle cx={bx - 7} cy="59" r="3.5" fill="#24292E" stroke="#8AA694" strokeWidth="1" />
                      <circle cx={bx + 7} cy="59" r="3.5" fill="#24292E" stroke="#8AA694" strokeWidth="1" />
                    </g>
                  ))}

                  <circle cx="372" cy="45" r="3" fill="#FFFFFF" />
                </svg>
              </div>

              {/* Luminous Continuous Railway Line Spanning Full Screen */}
              <div className="absolute inset-x-0 top-[132px] h-6 flex items-center">
                <div className="absolute inset-x-0 h-[8px] bg-gradient-to-r from-[#235D73]/30 via-[#9EC0D1]/55 to-[#235D73]/30 blur-[4px]" />
                <div
                  className="absolute inset-x-0 h-[10px] opacity-30"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to right, #D8CCB8 0px, #D8CCB8 2px, transparent 2px, transparent 18px)',
                  }}
                />
                <div className="relative w-full h-[2.5px] bg-gradient-to-r from-[#235D73] via-[#F5F1E8] to-[#9EC0D1] shadow-[0_0_14px_rgba(158,192,209,0.75)]" />
              </div>

              {/* Six Stations Represented by Points that Light Up Without Redirecting */}
              {STATIONS_DATA.map((station, idx) => {
                const leftPct = stationPositions[idx];
                const isTop = idx % 2 === 1;
                const isLit = litStationIdx === idx;

                return (
                  <div
                    key={station.id}
                    style={{ left: `${leftPct}%` }}
                    className="absolute top-[132px] -translate-x-1/2 z-20"
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setLitStationIdx(idx)}
                      onMouseLeave={() => setLitStationIdx(null)}
                      onClick={() => setLitStationIdx((prev) => (prev === idx ? null : idx))}
                      className="group relative flex flex-col items-center cursor-pointer focus:outline-none"
                      aria-label={`Gare ${station.numberLabel} : ${station.name}`}
                      aria-pressed={isLit}
                    >
                      {/* Luminous Station Point */}
                      <span
                        className={`w-4 h-4 -mt-[7px] rounded-full border-2 transition-all duration-200 ${
                          isLit
                            ? 'scale-125 bg-[#FFFFFF] border-[#9EC0D1] shadow-[0_0_20px_rgba(245,241,232,1)]'
                            : 'bg-[#0B1622] border-[#9EC0D1] shadow-[0_0_10px_rgba(158,192,209,0.65)] group-hover:bg-[#F5F1E8]'
                        }`}
                      />

                      {/* Vertical Leader Line & Station Label */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center w-48 text-center transition-all ${
                          isTop ? 'bottom-5 flex-col-reverse' : 'top-5'
                        }`}
                      >
                        <div
                          className={`w-[1px] h-7 transition-colors ${
                            isLit
                              ? 'bg-[#F5F1E8]'
                              : 'bg-gradient-to-b from-[#9EC0D1]/80 to-[#9EC0D1]/15'
                          }`}
                        />
                        <div className={isTop ? 'mb-1.5' : 'mt-1.5'}>
                          <div
                            className={`text-[11px] font-mono tracking-widest tabular-nums transition-colors ${
                              isLit ? 'text-white' : 'text-[#9EC0D1]'
                            }`}
                          >
                            GARE {station.numberLabel}
                          </div>
                          <div
                            className={`text-xs lg:text-sm font-display font-semibold leading-snug transition-colors ${
                              isLit ? 'text-white' : 'text-[#F5F1E8]'
                            }`}
                          >
                            {station.name}
                          </div>
                          <div
                            className={`text-[11px] mt-0.5 transition-colors ${
                              isLit ? 'text-[#F5F1E8]' : 'text-[#8AA694]'
                            }`}
                          >
                            {station.subtitle}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Compact Vertical Luminous Railway */}
          <div className="md:hidden px-6 py-4 space-y-4">
            <div className="relative pl-6 border-l-2 border-[#9EC0D1]/70 space-y-4">
              {STATIONS_DATA.map((station, idx) => {
                const isLit = litStationIdx === idx;
                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => setLitStationIdx((prev) => (prev === idx ? null : idx))}
                    className="relative block text-left w-full cursor-pointer"
                  >
                    <span
                      className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isLit
                          ? 'scale-115 bg-white border-[#9EC0D1] shadow-[0_0_14px_rgba(245,241,232,0.95)]'
                          : 'bg-[#0B1622] border-[#9EC0D1] shadow-[0_0_10px_rgba(158,192,209,0.65)]'
                      }`}
                    />
                    <div className="text-[11px] font-mono text-[#9EC0D1] tabular-nums">
                      GARE {station.numberLabel} · {station.subtitle}
                    </div>
                    <div className="text-sm font-display font-semibold text-[#F5F1E8]">
                      {station.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer Editorial Quote */}
      <footer className="relative z-10 w-full max-w-[1360px] mx-auto px-6 md:px-12 pb-6 pt-3 border-t border-[#F5F1E8]/10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#D8CCB8]/80">
        <span>« {PROFILE_DATA.welcomeJourneyText} »</span>
        <span className="font-mono text-[#9EC0D1]">6 GARES · PARCOURS LINÉAIRE 2.5D</span>
      </footer>
    </div>
  );
}
