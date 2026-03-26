// src/components/study/flashcard.tsx
"use client";

import { useState, useCallback } from "react";
import { scoreAnswer } from "@/lib/scoring";
import type { Hint } from "@/types/database";

interface FlashcardSpecimen {
  id: string;
  species_name: string;
  common_name: string | null;
  genus: string;
  family: string;
  description: string | null;
  dna_sequenced: boolean;
  photos: { url: string; attribution: string | null }[];
  hints: Hint[];
  ecology?: string;
}

interface FlashcardProps {
  specimen: FlashcardSpecimen;
  questionNumber: number;
  totalQuestions: number | "∞";
  onAnswer: (result: { score: number; isCorrect: boolean; hintsUsed: number }) => void;
  onNext: () => void;
  streak: number;
}

export function Flashcard({
  specimen,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  streak,
}: FlashcardProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [revealedHints, setRevealedHints] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    isCorrect: boolean;
    matchType: string;
  } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const sortedHints = [...(specimen.hints || [])].sort((a, b) => a.level - b.level);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (result) return; // Already answered

      const scored = scoreAnswer(specimen.species_name, specimen.species_name, revealedHints);
      // Re-score with actual user answer
      const actual = scoreAnswer(userAnswer, specimen.species_name, revealedHints);
      setResult(actual);
      onAnswer({
        score: actual.score,
        isCorrect: actual.isCorrect,
        hintsUsed: revealedHints,
      });
    },
    [userAnswer, specimen.species_name, revealedHints, result, onAnswer]
  );

  const handleGiveUp = useCallback(() => {
    setResult({ score: 0, isCorrect: false, matchType: "wrong" });
    onAnswer({ score: 0, isCorrect: false, hintsUsed: revealedHints });
  }, [revealedHints, onAnswer]);

  const handleRevealHint = useCallback(() => {
    if (revealedHints < sortedHints.length) {
      setRevealedHints((prev) => prev + 1);
    }
  }, [revealedHints, sortedHints.length]);

  const handleNext = useCallback(() => {
    setUserAnswer("");
    setRevealedHints(0);
    setResult(null);
    setShowGuide(false);
    setCurrentPhotoIndex(0);
    onNext();
  }, [onNext]);

  const photos = specimen.photos.length > 0
    ? specimen.photos
    : [{ url: "", attribution: null }];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-fungi-text-muted">
          Question {questionNumber} of {totalQuestions}
        </div>
        {streak > 1 && (
          <div className="text-sm font-medium text-fungi-accent flex items-center gap-1">
            🔥 {streak} streak
          </div>
        )}
      </div>

      {/* Photo Area */}
      <div className="relative rounded-xl overflow-hidden bg-fungi-bg-card border border-fungi-bg-tertiary/50 mb-4 aspect-[4/3]">
        {photos[currentPhotoIndex]?.url ? (
          <img
            src={photos[currentPhotoIndex].url}
            alt="Identify this specimen"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-fungi-bg-secondary">
            🍄
          </div>
        )}

        {/* Photo navigation */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhotoIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentPhotoIndex
                    ? "bg-white scale-110"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* Photo count badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 text-xs text-white/80 backdrop-blur-sm">
          📸 {currentPhotoIndex + 1}/{photos.length}
        </div>
      </div>

      {/* Hints */}
      {sortedHints.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-fungi-text-muted">
              Hints ({revealedHints}/{sortedHints.length})
            </span>
            {!result && revealedHints < sortedHints.length && (
              <button
                onClick={handleRevealHint}
                className="text-sm text-fungi-accent hover:underline"
              >
                Reveal hint (-20 pts)
              </button>
            )}
          </div>

          <div className="space-y-2">
            {sortedHints.slice(0, revealedHints).map((hint, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-fungi-bg-secondary border-l-2 animate-fade-in"
                style={{
                  borderColor:
                    hint.type === "morphological"
                      ? "#FF6B35"
                      : hint.type === "comparative"
                        ? "#D2691E"
                        : hint.type === "ecological"
                          ? "#228B22"
                          : "#8B4513",
                }}
              >
                <div className="text-xs font-medium text-fungi-text-muted uppercase mb-1">
                  {hint.type} hint
                </div>
                <div className="text-sm text-fungi-text-secondary">
                  {hint.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Input or Result */}
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter species name (e.g., Amanita muscaria)"
            autoFocus
            autoComplete="off"
            className="w-full px-4 py-3 rounded-xl bg-fungi-bg-secondary border border-fungi-bg-tertiary text-fungi-text placeholder:text-fungi-text-muted focus:border-fungi-secondary focus:ring-1 focus:ring-fungi-secondary/50 outline-none transition-colors text-lg"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-fungi-primary to-fungi-secondary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              Submit Answer
            </button>
            <button
              type="button"
              onClick={handleGiveUp}
              className="px-5 py-3 rounded-xl font-medium text-fungi-text-muted border border-fungi-bg-tertiary hover:border-fungi-danger/50 hover:text-fungi-danger/80 transition-colors"
            >
              I don&apos;t know
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Score result */}
          <div
            className={`p-4 rounded-xl border ${
              result.isCorrect
                ? "bg-green-500/5 border-green-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">
                {result.isCorrect ? "✅ Correct!" : "❌ Not quite"}
              </span>
              <span
                className={`text-2xl font-bold ${
                  result.score >= 80
                    ? "text-green-400"
                    : result.score >= 50
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {result.score}%
              </span>
            </div>

            <div className="text-fungi-text-secondary">
              <span className="font-semibold italic">{specimen.species_name}</span>
              {specimen.common_name && (
                <span className="text-fungi-text-muted"> — {specimen.common_name}</span>
              )}
            </div>

            {result.matchType === "genus" && (
              <p className="text-sm text-yellow-400/80 mt-1">
                You identified the genus correctly. Full species name: <em>{specimen.species_name}</em>
              </p>
            )}
            {result.matchType === "close" && (
              <p className="text-sm text-green-400/80 mt-1">
                Close match accepted!
              </p>
            )}
          </div>

          {/* Species guide toggle */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full py-2 text-sm text-fungi-accent hover:underline"
          >
            {showGuide ? "Hide species details" : "View species details"}
          </button>

          {showGuide && (
            <div className="p-4 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50 space-y-3 animate-fade-in">
              <div>
                <h3 className="text-xs font-medium text-fungi-text-muted uppercase mb-1">Family</h3>
                <p className="text-sm">{specimen.family}</p>
              </div>
              {specimen.description && (
                <div>
                  <h3 className="text-xs font-medium text-fungi-text-muted uppercase mb-1">Description</h3>
                  <p className="text-sm text-fungi-text-secondary">{specimen.description}</p>
                </div>
              )}
              {specimen.ecology && (
                <div>
                  <h3 className="text-xs font-medium text-fungi-text-muted uppercase mb-1">Ecology</h3>
                  <p className="text-sm text-fungi-text-secondary">{specimen.ecology}</p>
                </div>
              )}
              {specimen.dna_sequenced && (
                <div className="text-xs text-green-400 flex items-center gap-1">
                  🧬 DNA verified specimen
                </div>
              )}
            </div>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-fungi-accent to-fungi-secondary hover:opacity-90 transition-opacity"
          >
            Next Question →
          </button>
        </div>
      )}
    </div>
  );
}
