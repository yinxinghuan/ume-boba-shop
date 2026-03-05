export interface Character {
  id: string;
  name: string;
  image: string;
  points: number;
  /** Probability weight for random selection */
  weight: number;
}

export interface HoleState {
  isActive: boolean;
  character: Character | null;
  isWhacked: boolean;
}

export interface WhackAMoleProps {
  /** Game duration in seconds */
  totalTime?: number;
  /** Grid dimension (gridSize x gridSize) */
  gridSize?: number;
  /** Minimum popup duration in ms */
  minPopupDuration?: number;
  /** Maximum popup duration in ms */
  maxPopupDuration?: number;
  /** Max moles visible at once */
  maxActiveMoles?: number;
  /** Custom character definitions */
  characters?: Character[];
  /** Called when player scores */
  onScore?: (score: number, character: Character) => void;
  /** Called when game starts */
  onGameStart?: () => void;
  /** Called when game ends */
  onGameEnd?: (finalScore: number) => void;
}

export interface UseWhackAMoleOptions {
  totalTime: number;
  gridSize: number;
  minPopupDuration: number;
  maxPopupDuration: number;
  maxActiveMoles: number;
  characters: Character[];
  onScore?: (score: number, character: Character) => void;
  onGameStart?: () => void;
  onGameEnd?: (finalScore: number) => void;
}

export interface UseWhackAMoleReturn {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
  isGameOver: boolean;
  holes: HoleState[];
  combo: number;
  highScore: number;
  startGame: () => void;
  whackHole: (holeIndex: number) => void;
  resetGame: () => void;
}
