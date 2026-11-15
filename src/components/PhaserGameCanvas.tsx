import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Phaser from 'phaser';
import { JourneyPhase, TrainJourneyScene } from '../game/TrainJourneyScene';

export interface PhaserGameHandle {
  setTouchDrive: (dir: 'forward' | 'backward' | 'stop') => void;
  advanceToNextStation: () => void;
  requestResumeJourney: () => void;
}

interface PhaserGameCanvasProps {
  initialProgressT?: number;
  initialStationIdx?: number;
  discoveredStationIds: string[];
  modalOpen: boolean;
  onProgressUpdate: (progressT: number, phase: JourneyPhase, stationIdx: number) => void;
  onStationArrived: (stationIdx: number) => void;
  onStationSelect: (stationIdx: number) => void;
  onDepartureBlocked: (stationIdx: number) => void;
  onResumedTravel: (fromStationIdx: number) => void;
}

export const PhaserGameCanvas = forwardRef<PhaserGameHandle, PhaserGameCanvasProps>(
  function PhaserGameCanvas(props, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<TrainJourneyScene | null>(null);
    const callbacksRef = useRef(props);
    callbacksRef.current = props;

    useImperativeHandle(ref, () => ({
      setTouchDrive: (dir) => {
        sceneRef.current?.setTouchDrive(dir);
      },
      advanceToNextStation: () => {
        sceneRef.current?.triggerAdvanceToNextStation();
      },
      requestResumeJourney: () => {
        sceneRef.current?.requestResumeJourney();
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const scene = new TrainJourneyScene(
        {
          onProgressUpdate: (t, phase, idx) =>
            callbacksRef.current.onProgressUpdate(t, phase, idx),
          onStationArrived: (idx) => callbacksRef.current.onStationArrived(idx),
          onStationSelect: (idx) => callbacksRef.current.onStationSelect(idx),
          onDepartureBlocked: (idx) => callbacksRef.current.onDepartureBlocked(idx),
          onResumedTravel: (idx) => callbacksRef.current.onResumedTravel(idx),
        },
        props.initialProgressT ?? 0.018,
        props.initialStationIdx ?? 0
      );
      sceneRef.current = scene;

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: containerRef.current.clientWidth || window.innerWidth,
        height: containerRef.current.clientHeight || window.innerHeight,
        backgroundColor: '#0B1622',
        antialias: true,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [scene],
      });

      return () => {
        sceneRef.current = null;
        try {
          game.destroy(true);
        } catch {
          // Ignore WebGL/Canvas teardown exceptions when navigating away
        }
      };
    }, []);

    useEffect(() => {
      sceneRef.current?.syncDiscoveredStations(props.discoveredStationIds);
    }, [props.discoveredStationIds]);

    useEffect(() => {
      sceneRef.current?.setModalOpen(props.modalOpen);
    }, [props.modalOpen]);

    return (
      <div
        ref={containerRef}
        className="w-full h-full select-none overflow-hidden touch-none"
        aria-label="Monde isométrique 2.5D du voyage en train"
      />
    );
  }
);
