import { useState, useCallback, useRef, useEffect } from 'react';
import type { Character, HoleState, UseWhackAMoleOptions, UseWhackAMoleReturn } from '../types';
import {
  resumeAudio,
  playWhackSound,
  playGhostSound,
  playPopupSound,
  playStartSound,
  playGameOverSound,
  playComboSound,
} from '../utils/sounds';

const createEmptyHoles = (count: number): HoleState[] =>
  Array.from({ length: count }, () => ({
    isActive: false,
    character: null,
    isWhacked: false,
  }));

const pickRandomCharacter = (characters: Character[]): Character => {
  const totalWeight = characters.reduce((sum, c) => sum + c.weight, 0);
  let random = Math.random() * totalWeight;
  for (const character of characters) {
    random -= character.weight;
    if (random <= 0) return character;
  }
  return characters[0];
};

export const useWhackAMole = (options: UseWhackAMoleOptions): UseWhackAMoleReturn => {
  const {
    totalTime,
    gridSize,
    minPopupDuration,
    maxPopupDuration,
    maxActiveMoles,
    characters,
    onScore,
    onGameStart,
    onGameEnd,
  } = options;

  const totalHoles = gridSize * gridSize;

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [holes, setHoles] = useState<HoleState[]>(() => createEmptyHoles(totalHoles));
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('wam-highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  const isPlayingRef = useRef(false);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const moleTimersRef = useRef<Map<number, number>>(new Map());
  const spawnIntervalRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  const onGameEndRef = useRef(onGameEnd);
  const onScoreRef = useRef(onScore);
  const onGameStartRef = useRef(onGameStart);

  useEffect(() => {
    onGameEndRef.current = onGameEnd;
    onScoreRef.current = onScore;
    onGameStartRef.current = onGameStart;
  }, [onGameEnd, onScore, onGameStart]);

  const clearAllTimers = useCallback(() => {
    moleTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    moleTimersRef.current.clear();
    if (spawnIntervalRef.current) {
      window.clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
    if (gameTimerRef.current) {
      window.clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  }, []);

  const spawnMole = useCallback(() => {
    if (!isPlayingRef.current) return;

    setHoles((prev) => {
      const activeCount = prev.filter((h) => h.isActive).length;
      if (activeCount >= maxActiveMoles) return prev;

      const inactiveIndices = prev
        .map((h, i) => (!h.isActive ? i : -1))
        .filter((i) => i !== -1);
      if (inactiveIndices.length === 0) return prev;

      const idx = inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)];
      const character = pickRandomCharacter(characters);

      const newHoles = [...prev];
      newHoles[idx] = { isActive: true, character, isWhacked: false };

      playPopupSound();

      const duration =
        minPopupDuration + Math.random() * (maxPopupDuration - minPopupDuration);

      const timer = window.setTimeout(() => {
        setHoles((p) => {
          const u = [...p];
          if (u[idx].isActive && !u[idx].isWhacked) {
            u[idx] = { isActive: false, character: null, isWhacked: false };
            comboRef.current = 0;
            setCombo(0);
          }
          return u;
        });
        moleTimersRef.current.delete(idx);
      }, duration);

      moleTimersRef.current.set(idx, timer);
      return newHoles;
    });
  }, [characters, maxActiveMoles, minPopupDuration, maxPopupDuration]);

  const whackHole = useCallback((holeIndex: number) => {
    if (!isPlayingRef.current) return;

    setHoles((prev) => {
      if (!prev[holeIndex].isActive || prev[holeIndex].isWhacked) return prev;

      const character = prev[holeIndex].character;
      if (!character) return prev;

      const newHoles = [...prev];
      newHoles[holeIndex] = { ...newHoles[holeIndex], isWhacked: true };

      // Haptic feedback
      try {
        navigator.vibrate?.(30);
      } catch {
        // ignore
      }

      const points = character.points;
      if (points > 0) {
        comboRef.current += 1;
        setCombo(comboRef.current);
        const comboBonus = Math.floor(comboRef.current / 3);
        const totalPoints = points + comboBonus;
        scoreRef.current += totalPoints;
        playWhackSound();
        if (comboRef.current >= 3 && comboRef.current % 3 === 0) {
          playComboSound(comboRef.current);
        }
      } else {
        comboRef.current = 0;
        setCombo(0);
        scoreRef.current = Math.max(0, scoreRef.current + points);
        playGhostSound();
      }
      setScore(scoreRef.current);
      onScoreRef.current?.(scoreRef.current, character);

      // Clear mole timeout
      const timer = moleTimersRef.current.get(holeIndex);
      if (timer) {
        window.clearTimeout(timer);
        moleTimersRef.current.delete(holeIndex);
      }

      // Hide after whack animation
      window.setTimeout(() => {
        setHoles((p) => {
          const u = [...p];
          u[holeIndex] = { isActive: false, character: null, isWhacked: false };
          return u;
        });
      }, 400);

      return newHoles;
    });
  }, []);

  const endGame = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsGameOver(true);
    clearAllTimers();
    setHoles((prev) => prev.map(() => ({ isActive: false, character: null, isWhacked: false })));

    setHighScore((prevHigh) => {
      const newHigh = Math.max(prevHigh, scoreRef.current);
      try {
        localStorage.setItem('wam-highscore', String(newHigh));
      } catch {
        // ignore
      }
      return newHigh;
    });

    playGameOverSound();
    onGameEndRef.current?.(scoreRef.current);
  }, [clearAllTimers]);

  const startGame = useCallback(() => {
    clearAllTimers();
    setScore(0);
    setTimeLeft(totalTime);
    setIsPlaying(true);
    setIsGameOver(false);
    setCombo(0);
    setHoles(createEmptyHoles(totalHoles));

    scoreRef.current = 0;
    comboRef.current = 0;
    isPlayingRef.current = true;

    resumeAudio();
    playStartSound();
    onGameStartRef.current?.();

    // Game countdown timer
    gameTimerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawn moles periodically
    spawnIntervalRef.current = window.setInterval(() => {
      if (isPlayingRef.current) {
        spawnMole();
      }
    }, 700);

    // Initial spawn
    window.setTimeout(spawnMole, 400);
  }, [totalTime, totalHoles, clearAllTimers, spawnMole, endGame]);

  const resetGame = useCallback(() => {
    clearAllTimers();
    isPlayingRef.current = false;
    scoreRef.current = 0;
    comboRef.current = 0;
    setScore(0);
    setTimeLeft(totalTime);
    setIsPlaying(false);
    setIsGameOver(false);
    setCombo(0);
    setHoles(createEmptyHoles(totalHoles));
  }, [totalTime, totalHoles, clearAllTimers]);

  useEffect(() => {
    return clearAllTimers;
  }, [clearAllTimers]);

  return {
    score,
    timeLeft,
    isPlaying,
    isGameOver,
    holes,
    combo,
    highScore,
    startGame,
    whackHole,
    resetGame,
  };
};
