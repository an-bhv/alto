import { useState, useRef, useCallback, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { AudioEngine } from "../audio/AudioEngine";
import { midiToFrequency } from "../utils/musicTheory";
import { INTERVAL_NAMES } from "../data/chords";

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = "interval" | "note" | "chord";

interface Score {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

// ── Interval data by difficulty ───────────────────────────────────────────────

const INTERVALS_BY_LEVEL: number[][] = [
  [5, 7, 12],         // Level 1: P4, P5, Octave
  [5, 7, 12, 4, 9],   // Level 2: + Maj3, Maj6
  [5, 7, 12, 4, 9, 3, 8], // Level 3: + Min3, Min6
  [5, 7, 12, 4, 9, 3, 8, 2, 10], // Level 4: + Maj2, Min7
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Level 5: all
];

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

// ── Audio helpers ─────────────────────────────────────────────────────────────

function playNote(midi: number, duration = 1.0, delay = 0) {
  const ctx = AudioEngine.getInstance().getContext();
  const freq = midiToFrequency(midi);
  const now = ctx.currentTime + delay;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gain.gain.setTargetAtTime(0.15, now + 0.01, 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Main component ────────────────────────────────────────────────────────────

export function EarTrainingPage() {
  const [mode, setMode] = useState<Mode>("interval");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useLocalStorage<Score>("ear-training-score", {
    total: 0, correct: 0, streak: 0, bestStreak: 0,
  });

  // Question state
  const [questionMidis, setQuestionMidis] = useState<number[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [choices, setChoices] = useState<string[]>([]);
  const [answered, setAnswered] = useState<"correct" | "wrong" | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [waitingForNext, setWaitingForNext] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateQuestion = useCallback(() => {
    setAnswered(null);
    setUserAnswer("");
    setWaitingForNext(false);

    if (mode === "interval") {
      const available = INTERVALS_BY_LEVEL[Math.min(level - 1, 4)];
      const semitones = randomFrom(available);
      const rootMidi = 48 + Math.floor(Math.random() * 24); // C3-C5
      const topMidi = rootMidi + semitones;
      setQuestionMidis([rootMidi, topMidi]);
      setCorrectAnswer(INTERVAL_NAMES[semitones] ?? "");

      // Build 4 choices including the correct one
      const pool = [...new Set(available.map((i) => INTERVAL_NAMES[i]).filter(Boolean))];
      const distractors = pool.filter((n) => n !== INTERVAL_NAMES[semitones]);
      const picked = distractors.sort(() => Math.random() - 0.5).slice(0, 3);
      const all = [INTERVAL_NAMES[semitones], ...picked].sort(() => Math.random() - 0.5);
      setChoices(all.filter((x): x is string => Boolean(x)));

      // Play ascending
      playNote(rootMidi, 0.8);
      playNote(topMidi, 0.8, 0.9);

    } else if (mode === "note") {
      const midi = 48 + Math.floor(Math.random() * 25);
      setQuestionMidis([midi]);
      const name = NOTE_NAMES[midi % 12];
      setCorrectAnswer(name);

      // 4 choices
      const all = new Set([name]);
      while (all.size < 4) all.add(NOTE_NAMES[Math.floor(Math.random() * 12)]);
      setChoices([...all].sort(() => Math.random() - 0.5));
      playNote(midi, 1.2);
    }
  }, [mode, level]);

  // Generate first question on mount / when mode changes
  useEffect(() => {
    generateQuestion();
  }, [mode, level]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswer(answer: string) {
    if (answered) return;
    const isCorrect = answer === correctAnswer;
    setAnswered(isCorrect ? "correct" : "wrong");
    setUserAnswer(answer);

    setScore((prev) => {
      const streak = isCorrect ? prev.streak + 1 : 0;
      return {
        total: prev.total + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
      };
    });

    setWaitingForNext(true);
    timerRef.current = setTimeout(() => {
      generateQuestion();
    }, isCorrect ? 1000 : 1800);
  }

  function handleReplay() {
    questionMidis.forEach((m, i) => playNote(m, 0.8, i * 0.9));
  }

  function resetScore() {
    setScore({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header: mode tabs */}
      <div className="flex border-b border-border">
        {(["interval", "note"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={[
              "px-5 py-3 text-sm capitalize transition-colors",
              mode === m
                ? "border-b-2 border-accent-blue text-text-primary"
                : "text-text-muted hover:text-text-primary",
            ].join(" ")}
          >
            {m === "interval" ? "Intervals" : "Note ID"}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main area */}
        <div className="flex flex-col items-center justify-center flex-1 gap-8 px-8">

          {/* Question area */}
          <div className="text-center">
            <p className="text-text-muted text-sm mb-4">
              {mode === "interval"
                ? "What interval do you hear?"
                : "What note is being played?"}
            </p>
            <button
              onClick={handleReplay}
              className="px-6 py-2.5 rounded-lg bg-bg-elevated text-text-primary hover:bg-bg-elevated/80 border border-border text-sm transition-colors"
            >
              ▶ Replay
            </button>
          </div>

          {/* Choices */}
          <div className="grid grid-cols-2 gap-3 w-72">
            {choices.map((choice) => {
              let cls = "px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors border ";
              if (!answered) {
                cls += "border-border bg-bg-elevated text-text-primary hover:border-accent-blue hover:text-accent-blue cursor-pointer";
              } else if (choice === correctAnswer) {
                cls += "border-accent-green bg-accent-green/10 text-accent-green";
              } else if (choice === userAnswer && !answered) {
                cls += "border-accent-red bg-accent-red/10 text-accent-red";
              } else {
                cls += "border-border bg-bg-elevated text-text-muted cursor-default";
              }

              return (
                <button key={choice} onClick={() => handleAnswer(choice)} className={cls} disabled={!!answered}>
                  {choice}
                </button>
              );
            })}
          </div>

          {/* Result feedback */}
          <div className="h-8 text-sm font-semibold">
            {answered === "correct" && <span className="text-accent-green">Correct!</span>}
            {answered === "wrong" && (
              <span className="text-accent-red">Wrong — it was <span className="text-text-primary">{correctAnswer}</span></span>
            )}
          </div>

          {/* Next button if wrong */}
          {waitingForNext && answered === "wrong" && (
            <button
              onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); generateQuestion(); }}
              className="px-6 py-2 rounded-lg bg-accent-blue text-white text-sm hover:bg-blue-500 transition-colors"
            >
              Next →
            </button>
          )}
        </div>

        {/* Sidebar: score + level */}
        <div className="w-48 border-l border-border flex flex-col gap-6 p-5 shrink-0">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Score</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Accuracy</span>
                <span className="text-text-primary font-semibold">{accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Correct</span>
                <span className="text-accent-green font-semibold">{score.correct}/{score.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Streak</span>
                <span className="text-accent-yellow font-semibold">{score.streak}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Best</span>
                <span className="text-text-primary font-semibold">{score.bestStreak}</span>
              </div>
            </div>
            <button
              onClick={resetScore}
              className="mt-3 text-xs text-text-muted hover:text-text-primary"
            >
              Reset
            </button>
          </div>

          {mode === "interval" && (
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Level</p>
              <div className="flex flex-col gap-1">
                {[1, 2, 3, 4, 5].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={[
                      "px-3 py-1.5 rounded text-xs text-left transition-colors",
                      level === l
                        ? "bg-accent-blue text-white"
                        : "text-text-muted hover:bg-bg-elevated hover:text-text-primary",
                    ].join(" ")}
                  >
                    Level {l} {l === 1 ? "(P4/P5/8va)" : l === 2 ? "(+ 3rds/6ths)" : l === 3 ? "(+ 2nds)" : l === 4 ? "(+ 7ths)" : "(all)"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
