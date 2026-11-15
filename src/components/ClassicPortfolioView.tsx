import { ArrowLeft, Home, TrainFront } from 'lucide-react';
import { PROFILE_DATA } from '../data/profile';
import { STATIONS_DATA } from '../data/stations';
import { StationContentRenderer } from './StationContentRenderer';

interface ClassicPortfolioViewProps {
  onResumeTrainJourney: () => void;
  onReturnHome: () => void;
}

export function ClassicPortfolioView({
  onResumeTrainJourney,
  onReturnHome,
}: ClassicPortfolioViewProps) {
  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#0B1622]">
      {/* Clean Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0B1622]/96 backdrop-blur-md border-b border-[#F5F1E8]/12 text-[#F5F1E8]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={onReturnHome}
            className="text-base font-display font-bold tracking-tight text-[#F5F1E8] whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
          >
            <TrainFront className="w-4 h-4 text-[#9EC0D1]" aria-hidden="true" />
            <span>MON VOYAGE NUMÉRIQUE</span>
          </button>

          <nav
            className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#D8CCB8]"
            aria-label="Navigation du portfolio"
          >
            {STATIONS_DATA.map((st) => (
              <a
                key={st.id}
                href={`#${st.id}`}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                {st.subtitle}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onReturnHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/8 hover:bg-white/15 border border-white/15 text-[#F5F1E8] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Home className="w-3.5 h-3.5 text-[#9EC0D1]" aria-hidden="true" />
              <span>Accueil</span>
            </button>
            <button
              type="button"
              onClick={onResumeTrainJourney}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5F1E8] hover:bg-white text-[#0B1622] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#184354]" aria-hidden="true" />
              <span>Voyage en train</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-6 py-10 space-y-12">
        <div className="space-y-3 pb-6 border-b border-[#D8CCB8]">
          <p className="text-xs font-mono font-semibold tracking-wider text-[#184354] uppercase">
            {PROFILE_DATA.slogan}
          </p>
          <h1
            className="font-editorial text-3xl sm:text-4xl font-semibold text-[#0B1622]"
            style={{ textWrap: 'balance' }}
          >
            Consultation directe du portfolio
          </h1>
          <p className="text-sm sm:text-base text-[#4A5562] max-w-2xl leading-relaxed">
            Retrouvez l’ensemble des six gares de mon parcours dans un format éditorial direct.
            Vous pouvez embarquer à tout moment dans le voyage ferroviaire 2.5D.
          </p>
        </div>

        {STATIONS_DATA.map((station) => (
          <section
            key={station.id}
            id={station.id}
            className="scroll-mt-24 bg-white rounded-2xl border border-[#D8CCB8] p-6 sm:p-8 shadow-xs space-y-5"
          >
            <div className="pb-4 border-b border-[#EAE3D5]">
              <div className="text-xs font-mono font-semibold text-[#184354] tabular-nums">
                Gare {station.numberLabel} · {station.subtitle}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1622] mt-0.5">
                {station.name}
              </h2>
            </div>

            <StationContentRenderer sectionKey={station.sectionKey} />
          </section>
        ))}

        <div className="pt-4 pb-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#D8CCB8]">
          <button
            type="button"
            onClick={onReturnHome}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-[#EAE3D5] border border-[#D8CCB8] text-xs font-semibold text-[#0B1622] transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#184354]" aria-hidden="true" />
            <span>Retour à l’accueil</span>
          </button>

          <button
            type="button"
            onClick={onResumeTrainJourney}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#184354] hover:bg-[#102F3B] text-[#F5F1E8] text-xs font-semibold transition-colors cursor-pointer"
          >
            <TrainFront className="w-4 h-4 text-[#9EC0D1]" aria-hidden="true" />
            <span>Embarquer pour le voyage interactif</span>
          </button>
        </div>
      </main>
    </div>
  );
}
