import { useCallback, useEffect, useRef, useState } from 'react';
import { AboutJourneyModal } from './components/AboutJourneyModal';
import { ClassicPortfolioView } from './components/ClassicPortfolioView';
import { GameHUD } from './components/GameHUD';
import { PhaserGameCanvas, PhaserGameHandle } from './components/PhaserGameCanvas';
import { StationInfoModal } from './components/StationInfoModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { STATIONS_DATA } from './data/stations';
import { JourneyPhase } from './game/TrainJourneyScene';
import { soundEngine } from './game/soundEngine';

type AppView = 'welcome' | 'game' | 'classic';

export default function App() {
  const [view, setView] = useState<AppView>('welcome');
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // Game progress & state
  const [progressT, setProgressT] = useState(0.018);
  const [phase, setPhase] = useState<JourneyPhase>('TRAVELING');
  const [currentStationIdx, setCurrentStationIdx] = useState(0);
  const [discoveredStationIds, setDiscoveredStationIds] = useState<string[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  // Active opened terminus modal
  const [selectedStationIdx, setSelectedStationIdx] = useState<number | null>(null);

  // Audio, fullscreen & transient notifications
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<string | null>(null);

  const gameRef = useRef<PhaserGameHandle | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const badgeTimerRef = useRef<number | null>(null);

  const showNotice = useCallback((msg: string) => {
    setNoticeMessage(msg);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => {
      setNoticeMessage(null);
    }, 3600);
  }, []);

  const showBadgeToast = useCallback((badgeTitle: string) => {
    setNewlyEarnedBadge(badgeTitle);
    if (badgeTimerRef.current) window.clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = window.setTimeout(() => {
      setNewlyEarnedBadge(null);
    }, 4200);
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.setEnabled(next);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const markStationDiscovered = useCallback(
    (stationIdx: number) => {
      const station = STATIONS_DATA[stationIdx];
      if (!station) return;
      soundEngine.playDiscoveryChime();
      setDiscoveredStationIds((prev) => {
        if (prev.includes(station.id)) return prev;
        setUnlockedBadges((prevBadges) => {
          if (prevBadges.includes(station.badgeTitle)) return prevBadges;
          soundEngine.playBadgeFanfare();
          showBadgeToast(station.badgeTitle);
          return [...prevBadges, station.badgeTitle];
        });
        return [...prev, station.id];
      });
    },
    [showBadgeToast]
  );

  const handleProgressUpdate = useCallback(
    (t: number, nextPhase: JourneyPhase, stationIdx: number) => {
      setProgressT(t);
      setPhase(nextPhase);
      setCurrentStationIdx(stationIdx);
    },
    []
  );

  const handleStationArrived = useCallback(
    (stationIdx: number) => {
      const st = STATIONS_DATA[stationIdx];
      if (st) {
        showNotice(`Arrivée à ${st.name}. Cliquez sur le terminus pour découvrir cette étape !`);
      }
    },
    [showNotice]
  );

  const handleStationSelect = useCallback(
    (stationIdx: number) => {
      setSelectedStationIdx(stationIdx);
      markStationDiscovered(stationIdx);
    },
    [markStationDiscovered]
  );

  const handleDepartureBlocked = useCallback(
    (stationIdx: number) => {
      const st = STATIONS_DATA[stationIdx];
      showNotice(
        `Cliquez d’abord sur ${st?.name ?? 'le terminus'} pour découvrir cette gare avant de repartir.`
      );
    },
    [showNotice]
  );

  const handleResumedTravel = useCallback(
    (fromStationIdx: number) => {
      const nextSt = STATIONS_DATA[fromStationIdx + 1];
      if (nextSt) {
        showNotice(`En route vers ${nextSt.name} ! Utilisez les flèches pour avancer.`);
      }
    },
    [showNotice]
  );

  const handleReturnHome = useCallback(() => {
    setSelectedStationIdx(null);
    setAboutModalOpen(false);
    setNoticeMessage(null);
    setNewlyEarnedBadge(null);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setView('welcome');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const activeStation =
    selectedStationIdx !== null ? STATIONS_DATA[selectedStationIdx] ?? null : null;

  if (view === 'welcome') {
    return (
      <>
        <WelcomeScreen
          onStartJourney={() => setView('game')}
          onOpenClassicPortfolio={() => setView('classic')}
          onOpenAboutJourney={() => setAboutModalOpen(true)}
        />
        <AboutJourneyModal
          open={aboutModalOpen}
          onClose={() => setAboutModalOpen(false)}
          onStartJourney={() => setView('game')}
        />
      </>
    );
  }

  if (view === 'classic') {
    return (
      <ClassicPortfolioView
        onResumeTrainJourney={() => setView('game')}
        onReturnHome={handleReturnHome}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0B1622]">
      <PhaserGameCanvas
        ref={gameRef}
        initialProgressT={progressT}
        initialStationIdx={currentStationIdx}
        discoveredStationIds={discoveredStationIds}
        modalOpen={Boolean(activeStation)}
        onProgressUpdate={handleProgressUpdate}
        onStationArrived={handleStationArrived}
        onStationSelect={handleStationSelect}
        onDepartureBlocked={handleDepartureBlocked}
        onResumedTravel={handleResumedTravel}
      />

      <GameHUD
        progressT={progressT}
        phase={phase}
        currentStationIdx={currentStationIdx}
        discoveredStationIds={discoveredStationIds}
        unlockedBadges={unlockedBadges}
        soundEnabled={soundEnabled}
        isFullscreen={isFullscreen}
        noticeMessage={noticeMessage}
        newlyEarnedBadge={newlyEarnedBadge}
        onToggleSound={handleToggleSound}
        onToggleFullscreen={handleToggleFullscreen}
        onReturnHome={handleReturnHome}
        onOpenClassicPortfolio={() => {
          setSelectedStationIdx(null);
          setView('classic');
        }}
        onResumeJourney={() => gameRef.current?.requestResumeJourney()}
        onAdvanceTrain={() => gameRef.current?.advanceToNextStation()}
        onSelectStationFromHud={(stIdx) => handleStationSelect(stIdx)}
        onTouchDrive={(dir) => gameRef.current?.setTouchDrive(dir)}
      />

      <StationInfoModal
        station={activeStation}
        onClose={() => setSelectedStationIdx(null)}
      />
    </div>
  );
}
