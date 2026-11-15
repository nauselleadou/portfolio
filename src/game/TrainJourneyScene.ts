import Phaser from 'phaser';
import { STATIONS_DATA, StationDefinition, StationLandmark } from '../data/stations';
import {
  PALETTE,
  SkyStar,
  drawFuturisticTrain,
  drawLandmarkSprite,
  drawProtagonist,
  drawSceneryProp,
  drawSkyBackdrop,
  drawStationPlatformAndArchitecture,
  drawTunnelsOverlay,
  drawWorldCorridorAndRails,
} from './drawIsometricArt';
import { worldToIso } from './isoMath';
import {
  SceneryProp,
  buildSceneryProps,
  getStationWorldAnchor,
  sampleRailAt,
} from './railPath';
import { soundEngine } from './soundEngine';
import { getTimeOfDayState } from './timeOfDay';

export type JourneyPhase =
  | 'TRAVELING'
  | 'APPROACHING'
  | 'DISEMBARKING'
  | 'EXPLORING'
  | 'BOARDING';

export interface SceneCallbacks {
  onProgressUpdate: (progressT: number, phase: JourneyPhase, currentStationIdx: number) => void;
  onStationArrived: (stationIdx: number) => void;
  onStationSelect: (stationIdx: number) => void;
  onDepartureBlocked: (stationIdx: number) => void;
  onResumedTravel: (fromStationIdx: number) => void;
}

interface StationInteractiveEntity {
  station: StationDefinition;
  graphics: Phaser.GameObjects.Graphics;
  beaconGraphics: Phaser.GameObjects.Graphics;
  signText: Phaser.GameObjects.Text;
  actionHintText: Phaser.GameObjects.Text;
  hitZone: Phaser.GameObjects.Zone;
  platformIsoX: number;
  platformIsoY: number;
  beaconIsoX: number;
  beaconIsoY: number;
  isHovered: boolean;
}

interface DecorativeLandmark {
  stationIdx: number;
  landmark: StationLandmark;
  graphics: Phaser.GameObjects.Graphics;
}

export class TrainJourneyScene extends Phaser.Scene {
  private callbacks: SceneCallbacks;

  private trainT = 0.018;
  private trainSpeed = 0;
  private phase: JourneyPhase = 'TRAVELING';
  private activeStationIdx = 0;
  private highestUnlockedStationIdx = 0;
  private discoveredStations = new Set<string>();
  private modalOpen = false;

  // One-press auto-cruise directly to the next station
  private autoCruiseToNext = false;

  // Touch / on-screen directional flags
  private touchForward = false;
  private touchBackward = false;

  // Arrow-key state (ONLY arrow keys allowed)
  private arrowForward = false;
  private arrowBackward = false;

  // Graphics layers
  private skyGraphics!: Phaser.GameObjects.Graphics;
  private worldCorridorGraphics!: Phaser.GameObjects.Graphics;
  private tunnelsGraphics!: Phaser.GameObjects.Graphics;
  private trainGraphics!: Phaser.GameObjects.Graphics;
  private protagonistGraphics!: Phaser.GameObjects.Graphics;

  private skyStars: SkyStar[] = [];
  private lastCorridorNight = -1;
  private lastCorridorWarmth = -1;

  private sceneryProps: SceneryProp[] = [];
  private sceneryGraphics: { prop: SceneryProp; g: Phaser.GameObjects.Graphics; baseIsoY: number }[] = [];
  private stationEntities: StationInteractiveEntity[] = [];
  private decorativeLandmarks: DecorativeLandmark[] = [];

  // Train & protagonist animation state
  private doorOpenFactor = 0;
  private protagonistX = 0;
  private protagonistY = 0;
  private protagonistTargetX = 0;
  private protagonistTargetY = 0;
  private protagonistVisible = false;
  private protagonistWalkPhase = 0;
  private protagonistFacingRight = true;
  private animTime = 0;

  // Camera tracking target
  private camFollowX = 0;
  private camFollowY = 0;

  // Bound DOM key listeners so only arrow keys work & never leak
  private handleKeyDownBound = (e: KeyboardEvent) => this.onKeyDown(e);
  private handleKeyUpBound = (e: KeyboardEvent) => this.onKeyUp(e);

  constructor(
    callbacks: SceneCallbacks,
    initialProgressT = 0.018,
    initialStationIdx = 0
  ) {
    super({ key: 'TrainJourneyScene' });
    this.callbacks = callbacks;
    this.trainT = Math.max(0.018, Math.min(0.965, initialProgressT));
    this.activeStationIdx = Math.max(0, Math.min(STATIONS_DATA.length - 1, initialStationIdx));
    this.highestUnlockedStationIdx = this.activeStationIdx;
  }

  public create() {
    const initialTime = getTimeOfDayState(this.trainT);
    this.cameras.main.setBackgroundColor('#0B1622');

    // 0. Fixed-camera dynamic sky backdrop & deterministic stars
    this.skyStars = [];
    for (let i = 0; i < 64; i++) {
      this.skyStars.push({
        xFrac: ((i * 73 + 19) % 1000) / 1000,
        yFrac: ((i * 137 + 41) % 1000) / 1000,
        size: i % 5 === 0 ? 1.8 : 1.1,
        phase: (i * 0.9) % (Math.PI * 2),
      });
    }
    this.skyGraphics = this.add.graphics();
    this.skyGraphics.setScrollFactor(0);
    this.skyGraphics.setDepth(-20000);

    // 1. World track corridor (updated dynamically across day -> sunset -> night)
    this.worldCorridorGraphics = this.add.graphics();
    drawWorldCorridorAndRails(this.worldCorridorGraphics, initialTime);
    this.worldCorridorGraphics.setDepth(-10000);
    this.lastCorridorNight = initialTime.nightFactor;
    this.lastCorridorWarmth = initialTime.warmthFactor;

    // 2. Stations architecture & single clickable station terminus zone
    STATIONS_DATA.forEach((station) => {
      const anchor = getStationWorldAnchor(station.stopT);
      const stG = this.add.graphics();
      drawStationPlatformAndArchitecture(stG, station, false, false, initialTime);
      stG.setDepth(anchor.platformIso.y - 30);

      // Architectural station nameplate
      const signIso = worldToIso(
        anchor.platformCenterWx - 30,
        anchor.platformCenterWy + 75,
        anchor.railSample.wz + 22
      );
      const signText = this.add
        .text(signIso.x, signIso.y, `GARE ${station.numberLabel} · ${station.name.toUpperCase()}`, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#F5F1E8',
          backgroundColor: '#0B1622EE',
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setDepth(anchor.platformIso.y + 85);
      signText.setShadow(0, 2, 'rgba(11, 22, 34, 0.45)', 5);

      const backWx = anchor.platformCenterWx + anchor.railSample.platNormalWx * 140;
      const backWy = anchor.platformCenterWy + anchor.railSample.platNormalWy * 140;
      const backIso = worldToIso(backWx, backWy, anchor.railSample.wz + 135);

      const beaconGraphics = this.add.graphics();
      beaconGraphics.setDepth(anchor.platformIso.y + 110);

      const actionHintText = this.add
        .text(backIso.x, backIso.y - 26, 'Cliquer sur le terminus pour explorer', {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#F5F1E8',
          backgroundColor: '#184354EE',
          padding: { x: 11, y: 6 },
        })
        .setOrigin(0.5)
        .setDepth(anchor.platformIso.y + 115)
        .setVisible(false);

      const hitZone = this.add
        .zone(anchor.platformIso.x, anchor.platformIso.y - 55, 420, 280)
        .setInteractive({ useHandCursor: true })
        .setDepth(anchor.platformIso.y + 120);

      const entity: StationInteractiveEntity = {
        station,
        graphics: stG,
        beaconGraphics,
        signText,
        actionHintText,
        hitZone,
        platformIsoX: anchor.platformIso.x,
        platformIsoY: anchor.platformIso.y,
        beaconIsoX: backIso.x,
        beaconIsoY: backIso.y,
        isHovered: false,
      };

      hitZone.on('pointerover', () => {
        if (this.phase === 'EXPLORING' && this.activeStationIdx === station.index && !this.modalOpen) {
          entity.isHovered = true;
          signText.setStyle({ backgroundColor: '#184354', color: '#FFFFFF' });
          actionHintText.setStyle({ backgroundColor: '#F5F1E8', color: '#0B1622' });
        }
      });

      hitZone.on('pointerout', () => {
        entity.isHovered = false;
        signText.setStyle({ backgroundColor: '#0B1622EE', color: '#F5F1E8' });
        actionHintText.setStyle({ backgroundColor: '#184354EE', color: '#F5F1E8' });
      });

      hitZone.on('pointerdown', () => {
        if (this.phase === 'EXPLORING' && this.activeStationIdx === station.index && !this.modalOpen) {
          this.walkProtagonistTo(anchor.platformIso.x, anchor.platformIso.y - 18);
          this.callbacks.onStationSelect(station.index);
        }
      });

      this.stationEntities.push(entity);

      station.landmarks.forEach((lm) => {
        const lmWx = anchor.platformCenterWx + lm.localOffsetX;
        const lmWy = anchor.platformCenterWy + lm.localOffsetY;
        const lmIso = worldToIso(lmWx, lmWy, anchor.railSample.wz + 8);
        const g = this.add.graphics();
        g.setPosition(lmIso.x, lmIso.y);
        g.setDepth(lmIso.y + 12);
        this.decorativeLandmarks.push({
          stationIdx: station.index,
          landmark: lm,
          graphics: g,
        });
      });
    });

    // 3. Realistic landscape & urban scenery props
    this.sceneryProps = buildSceneryProps();
    this.sceneryProps.forEach((prop) => {
      const g = this.add.graphics();
      drawSceneryProp(g, prop, initialTime);
      const iso = worldToIso(prop.wx, prop.wy, prop.wz);
      const depthBias = prop.kind === 'distant_cloud' ? 500 : 0;
      g.setDepth(iso.y + depthBias);
      this.sceneryGraphics.push({ prop, g, baseIsoY: iso.y });
    });

    // 4. Train & Protagonist
    this.trainGraphics = this.add.graphics();
    this.protagonistGraphics = this.add.graphics();
    this.protagonistGraphics.setVisible(false);

    // 5. Stone & concrete tunnels overlay
    this.tunnelsGraphics = this.add.graphics();
    drawTunnelsOverlay(this.tunnelsGraphics, initialTime);
    this.tunnelsGraphics.setDepth(6000);

    // 6. Initial camera placement
    const initialRail = sampleRailAt(this.trainT);
    this.camFollowX = initialRail.isoX;
    this.camFollowY = initialRail.isoY - 30;
    this.cameras.main.centerOn(this.camFollowX, this.camFollowY);

    drawSkyBackdrop(
      this.skyGraphics,
      this.scale.width,
      this.scale.height,
      this.camFollowX,
      initialTime,
      this.skyStars,
      0
    );

    // 7. Attach ONLY Arrow Keys listeners & guarantee cleanup on shutdown/destroy
    window.addEventListener('keydown', this.handleKeyDownBound);
    window.addEventListener('keyup', this.handleKeyUpBound);

    const cleanupListeners = () => {
      window.removeEventListener('keydown', this.handleKeyDownBound);
      window.removeEventListener('keyup', this.handleKeyUpBound);
      if (this.input) {
        this.input.setDefaultCursor('default');
      }
    };

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanupListeners);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanupListeners);

    this.callbacks.onProgressUpdate(this.trainT, this.phase, this.activeStationIdx);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (this.modalOpen) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!e.repeat) {
        this.triggerAdvanceToNextStation();
      }
      this.arrowForward = true;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.autoCruiseToNext = false;
      this.arrowBackward = true;
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      this.arrowForward = false;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      this.arrowBackward = false;
    }
  }

  public setTouchDrive(direction: 'forward' | 'backward' | 'stop') {
    this.touchForward = direction === 'forward';
    this.touchBackward = direction === 'backward';
    if (direction === 'backward') {
      this.autoCruiseToNext = false;
    }
  }

  public triggerAdvanceToNextStation() {
    if (this.modalOpen) return;
    if (this.phase === 'TRAVELING') {
      this.autoCruiseToNext = true;
    } else if (this.phase === 'EXPLORING') {
      this.requestResumeJourney();
    }
  }

  public setModalOpen(open: boolean) {
    this.modalOpen = open;
    if (open) {
      this.arrowForward = false;
      this.arrowBackward = false;
      this.touchForward = false;
      this.touchBackward = false;
    }
  }

  public syncDiscoveredStations(stationIds: string[]) {
    this.discoveredStations = new Set(stationIds);
  }

  public isCurrentStationDiscovered(): boolean {
    const station = STATIONS_DATA[this.activeStationIdx];
    if (!station) return false;
    return this.discoveredStations.has(station.id);
  }

  public requestResumeJourney() {
    if (this.phase !== 'EXPLORING') return;
    if (this.activeStationIdx >= STATIONS_DATA.length - 1) return;
    if (!this.isCurrentStationDiscovered()) {
      this.callbacks.onDepartureBlocked(this.activeStationIdx);
      return;
    }
    this.autoCruiseToNext = true;
    this.startBoarding();
  }

  private startBoarding() {
    const rail = sampleRailAt(this.trainT);
    const middleSample = sampleRailAt(Math.max(0.001, this.trainT - 0.0132));
    this.protagonistTargetX = middleSample.isoX + rail.platNormalWx * 14;
    this.protagonistTargetY = middleSample.isoY - 6;
    this.phase = 'BOARDING';
    soundEngine.playDoorSlide();
    this.callbacks.onProgressUpdate(this.trainT, this.phase, this.activeStationIdx);
  }

  private walkProtagonistTo(tx: number, ty: number) {
    this.protagonistTargetX = tx;
    this.protagonistTargetY = ty;
    this.protagonistFacingRight = tx >= this.protagonistX;
  }

  public update(_time: number, deltaMs: number) {
    const dt = Math.min(0.05, deltaMs / 1000);
    this.animTime += dt;

    const wantForward =
      !this.modalOpen && (this.autoCruiseToNext || this.arrowForward || this.touchForward);
    const wantBackward = !this.modalOpen && (this.arrowBackward || this.touchBackward);

    const nextStation = STATIONS_DATA[this.activeStationIdx];
    const maxCruiseSpeed = 0.068;

    // 1. Update Journey Phase Machine
    if (this.phase === 'TRAVELING') {
      if (wantForward) {
        this.trainSpeed = Phaser.Math.Linear(this.trainSpeed, maxCruiseSpeed, dt * 4.5);
      } else if (wantBackward) {
        const minAllowedT =
          this.highestUnlockedStationIdx > 0
            ? STATIONS_DATA[this.highestUnlockedStationIdx - 1].stopT + 0.01
            : 0.018;
        if (this.trainT > minAllowedT) {
          this.trainSpeed = Phaser.Math.Linear(this.trainSpeed, -maxCruiseSpeed * 0.5, dt * 4.0);
        } else {
          this.trainSpeed = 0;
        }
      } else {
        this.trainSpeed = Phaser.Math.Linear(this.trainSpeed, 0, dt * 4.5);
        if (Math.abs(this.trainSpeed) < 0.0004) this.trainSpeed = 0;
      }

      this.trainT = Phaser.Math.Clamp(this.trainT + this.trainSpeed * dt, 0.018, 0.965);
      soundEngine.playTrackPulse(Math.min(1, Math.abs(this.trainSpeed) / maxCruiseSpeed));

      if (nextStation && this.trainT >= nextStation.stopT - 0.018 && this.trainSpeed >= 0) {
        this.phase = 'APPROACHING';
      }
    } else if (this.phase === 'APPROACHING') {
      const targetT = nextStation.stopT;
      const remaining = targetT - this.trainT;
      if (remaining <= 0.0006) {
        this.trainT = targetT;
        this.trainSpeed = 0;
        this.autoCruiseToNext = false;
        this.phase = 'DISEMBARKING';
        this.highestUnlockedStationIdx = Math.max(
          this.highestUnlockedStationIdx,
          this.activeStationIdx
        );
        soundEngine.playArrivalBell();
        soundEngine.playDoorSlide();

        const doorSample = sampleRailAt(Math.max(0.001, this.trainT - 0.0132));
        const anchor = getStationWorldAnchor(nextStation.stopT);
        this.protagonistX = doorSample.isoX;
        this.protagonistY = doorSample.isoY - 4;
        this.protagonistTargetX = anchor.platformIso.x - 10;
        this.protagonistTargetY = anchor.platformIso.y + 18;
        this.protagonistVisible = true;
        this.protagonistFacingRight = this.protagonistTargetX >= this.protagonistX;

        this.callbacks.onStationArrived(this.activeStationIdx);
      } else {
        const approachSpeed = Math.max(0.01, remaining * 2.6);
        this.trainSpeed = approachSpeed;
        this.trainT += approachSpeed * dt;
      }
    } else if (this.phase === 'DISEMBARKING') {
      this.doorOpenFactor = Math.min(1, this.doorOpenFactor + dt * 3.2);
      if (this.doorOpenFactor > 0.6) {
        const dist = Math.hypot(
          this.protagonistTargetX - this.protagonistX,
          this.protagonistTargetY - this.protagonistY
        );
        if (dist > 3) {
          const step = Math.min(dist, 115 * dt);
          this.protagonistX += ((this.protagonistTargetX - this.protagonistX) / dist) * step;
          this.protagonistY += ((this.protagonistTargetY - this.protagonistY) / dist) * step;
          this.protagonistWalkPhase += dt * 1.5;
        } else {
          this.phase = 'EXPLORING';
        }
      }
    } else if (this.phase === 'EXPLORING') {
      this.doorOpenFactor = 1;
      const dist = Math.hypot(
        this.protagonistTargetX - this.protagonistX,
        this.protagonistTargetY - this.protagonistY
      );
      if (dist > 3) {
        const step = Math.min(dist, 130 * dt);
        this.protagonistX += ((this.protagonistTargetX - this.protagonistX) / dist) * step;
        this.protagonistY += ((this.protagonistTargetY - this.protagonistY) / dist) * step;
        this.protagonistWalkPhase += dt * 1.5;
      } else {
        this.protagonistWalkPhase += dt * 0.6;
      }
    } else if (this.phase === 'BOARDING') {
      const dist = Math.hypot(
        this.protagonistTargetX - this.protagonistX,
        this.protagonistTargetY - this.protagonistY
      );
      if (dist > 3) {
        const step = Math.min(dist, 135 * dt);
        this.protagonistX += ((this.protagonistTargetX - this.protagonistX) / dist) * step;
        this.protagonistY += ((this.protagonistTargetY - this.protagonistY) / dist) * step;
        this.protagonistWalkPhase += dt * 1.5;
      } else {
        this.protagonistVisible = false;
        this.doorOpenFactor = Math.max(0, this.doorOpenFactor - dt * 3.4);
        if (this.doorOpenFactor <= 0.02) {
          this.doorOpenFactor = 0;
          const prevIdx = this.activeStationIdx;
          if (this.activeStationIdx < STATIONS_DATA.length - 1) {
            this.activeStationIdx += 1;
          }
          this.phase = 'TRAVELING';
          this.autoCruiseToNext = true;
          this.trainSpeed = 0.024;
          soundEngine.playDepartureChime();
          this.callbacks.onResumedTravel(prevIdx);
        }
      }
    }

    // 2. Continuous temporal evolution (Morning -> Midday -> Afternoon -> Sunset -> Evening -> Night)
    const timeState = getTimeOfDayState(this.trainT);

    if (
      Math.abs(timeState.nightFactor - this.lastCorridorNight) > 0.035 ||
      Math.abs(timeState.warmthFactor - this.lastCorridorWarmth) > 0.045
    ) {
      this.lastCorridorNight = timeState.nightFactor;
      this.lastCorridorWarmth = timeState.warmthFactor;
      drawWorldCorridorAndRails(this.worldCorridorGraphics, timeState);
      drawTunnelsOverlay(this.tunnelsGraphics, timeState);
      this.sceneryGraphics.forEach((item) => {
        if (Math.abs(item.prop.t - this.trainT) < 0.28) {
          drawSceneryProp(item.g, item.prop, timeState);
        }
      });
    }

    // 3. Render dynamic Train
    const trainSample = sampleRailAt(this.trainT);
    const speedNorm = Math.min(1, Math.abs(this.trainSpeed) / maxCruiseSpeed);
    drawFuturisticTrain(this.trainGraphics, this.trainT, this.doorOpenFactor, speedNorm, timeState);
    this.trainGraphics.setDepth(trainSample.isoY + 4);

    // 4. Render Protagonist
    if (this.protagonistVisible) {
      this.protagonistGraphics.setVisible(true);
      const isWalking =
        Math.hypot(
          this.protagonistTargetX - this.protagonistX,
          this.protagonistTargetY - this.protagonistY
        ) > 4;
      drawProtagonist(
        this.protagonistGraphics,
        this.protagonistWalkPhase,
        isWalking,
        this.protagonistFacingRight,
        timeState
      );
      this.protagonistGraphics.setPosition(this.protagonistX, this.protagonistY);
      this.protagonistGraphics.setDepth(this.protagonistY + 25);
    } else {
      this.protagonistGraphics.setVisible(false);
    }

    // 5. Update interactive station entities & architectural landmarks
    this.stationEntities.forEach((entity) => {
      const isCurrentStation =
        this.phase === 'EXPLORING' && entity.station.index === this.activeStationIdx;
      const isDiscovered = this.discoveredStations.has(entity.station.id);

      if (entity.hitZone.input) {
        entity.hitZone.input.enabled = isCurrentStation && !this.modalOpen;
      }
      drawStationPlatformAndArchitecture(
        entity.graphics,
        entity.station,
        entity.isHovered && isCurrentStation,
        isDiscovered,
        timeState
      );

      entity.actionHintText.setVisible(isCurrentStation && !this.modalOpen);
      entity.actionHintText.setText(
        isDiscovered
          ? 'Terminus exploré · Cliquer pour relire'
          : 'Cliquer sur le terminus pour explorer'
      );

      entity.beaconGraphics.clear();
      if (isCurrentStation) {
        const floatY = entity.beaconIsoY + Math.sin(this.animTime * 2.5) * 3;
        if (isDiscovered) {
          entity.beaconGraphics.fillStyle(0x2f855a, 0.96);
          entity.beaconGraphics.fillCircle(entity.beaconIsoX, floatY, 10);
          entity.beaconGraphics.lineStyle(2.2, PALETTE.ivory, 1);
          entity.beaconGraphics.beginPath();
          entity.beaconGraphics.moveTo(entity.beaconIsoX - 4.5, floatY);
          entity.beaconGraphics.lineTo(entity.beaconIsoX - 1, floatY + 3.5);
          entity.beaconGraphics.lineTo(entity.beaconIsoX + 4.5, floatY - 3.5);
          entity.beaconGraphics.strokePath();
        } else {
          entity.beaconGraphics.fillStyle(PALETTE.champagneLight, 0.98);
          entity.beaconGraphics.fillCircle(entity.beaconIsoX, floatY, 7);
          entity.beaconGraphics.lineStyle(2, PALETTE.champagne, 0.9);
          entity.beaconGraphics.strokeCircle(entity.beaconIsoX, floatY, 13);
        }
      }
    });

    this.decorativeLandmarks.forEach((item) => {
      const hovered =
        this.phase === 'EXPLORING' &&
        item.stationIdx === this.activeStationIdx &&
        Boolean(this.stationEntities[item.stationIdx]?.isHovered);
      drawLandmarkSprite(item.graphics, item.landmark, false, hovered, this.animTime, timeState);
    });

    this.sceneryGraphics.forEach((item, idx) => {
      if (item.prop.kind === 'distant_cloud') {
        const iso = worldToIso(item.prop.wx, item.prop.wy, item.prop.wz);
        item.g.setPosition(
          iso.x + Math.sin(this.animTime * 0.35 + idx) * 12,
          iso.y + Math.cos(this.animTime * 0.25 + idx) * 3
        );
      }
    });

    // 6. Smooth Camera Tracking & Sky Backdrop Update
    let desiredCamX = trainSample.isoX;
    let desiredCamY = trainSample.isoY - 35;

    if (
      (this.phase === 'EXPLORING' || this.phase === 'DISEMBARKING' || this.phase === 'BOARDING') &&
      STATIONS_DATA[this.activeStationIdx]
    ) {
      const anchor = getStationWorldAnchor(STATIONS_DATA[this.activeStationIdx].stopT);
      desiredCamX = (trainSample.isoX + anchor.platformIso.x) * 0.5;
      desiredCamY = anchor.platformIso.y - 40;
    }

    this.camFollowX = Phaser.Math.Linear(this.camFollowX, desiredCamX, dt * 4.5);
    this.camFollowY = Phaser.Math.Linear(this.camFollowY, desiredCamY, dt * 4.5);
    this.cameras.main.centerOn(this.camFollowX, this.camFollowY);

    drawSkyBackdrop(
      this.skyGraphics,
      this.scale.width,
      this.scale.height,
      this.camFollowX,
      timeState,
      this.skyStars,
      this.animTime
    );

    // 7. Notify React HUD
    this.callbacks.onProgressUpdate(this.trainT, this.phase, this.activeStationIdx);
  }
}
