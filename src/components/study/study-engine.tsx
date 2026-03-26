// src/components/study/study-engine.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Flashcard } from "./flashcard";
import { SessionComplete } from "./session-complete";
import { useStudySession } from "@/hooks/use-study-session";
import type { Hint, StudyMode } from "@/types/database";

interface StudySpecimen {
  id: string;
  species_name: string;
  common_name: string | null;
  genus: string;
  family: string;
  description: string | null;
  dna_sequenced: boolean;
}

interface StudyPhoto {
  url: string;
  attribution: string | null;
}

interface StudyGuide {
  hints: Hint[];
  ecology?: string;
}

interface StudyEngineProps {
  userId: string;
  mode: StudyMode;
  specimens: StudySpecimen[];
  photos: Record<string, StudyPhoto[]>; // keyed by specimen ID
  guides: Record<string, StudyGuide>; // keyed by species_name
  maxQuestions?: number; // undefined = unlimited (marathon)
  filters?: Record<string, unknown>;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function StudyEngine({
  userId,
  mode,
  specimens,
  photos,
  guides,
  maxQuestions,
  filters,
}: StudyEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);

  const { stats, startSession, trackAnswer, endSession } = useStudySession({
    userId,
    mode,
    filters,
  });

  // Shuffle specimens on mount
  const shuffledSpecimens = useMemo(() => {
    const shuffled = shuffleArray(specimens);
    return maxQuestions ? shuffled.slice(0, maxQuestions) : shuffled;
  }, [specimens, maxQuestions]);

  const totalQuestions = maxQuestions ?? "∞";
  const currentSpecimen = shuffledSpecimens[currentIndex % shuffledSpecimens.length];

  // Start session on mount
  useEffect(() => {
    if (!started) {
      startSession();
      setStarted(true);
    }
  }, [started, startSession]);

  const handleAnswer = useCallback(
    (result: { score: number; isCorrect: boolean; hintsUsed: number }) => {
      trackAnswer(result);
    },
    [trackAnswer]
  );

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;

    // Check if session is complete
    if (maxQuestions && nextIndex >= maxQuestions) {
      setIsComplete(true);
      endSession();
      return;
    }

    // For marathon mode, loop back
    if (nextIndex >= shuffledSpecimens.length) {
      // Re-shuffle would be ideal but keeping it simple for now
      setCurrentIndex(0);
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, maxQuestions, shuffledSpecimens.length, endSession]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setIsComplete(false);
    setStarted(false);
  }, []);

  if (specimens.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🍄</div>
        <h2 className="text-xl font-semibold mb-2">No specimens available</h2>
        <p className="text-fungi-text-muted">
          There are no approved specimens to study yet. Check back after the admin approves some.
        </p>
      </div>
    );
  }

  if (isComplete) {
    return <SessionComplete stats={stats} mode={mode} onRestart={handleRestart} />;
  }

  if (!currentSpecimen) {
    return null;
  }

  const specimenPhotos = photos[currentSpecimen.id] ?? [];
  const guide = guides[currentSpecimen.species_name];

  return (
    <Flashcard
      specimen={{
        ...currentSpecimen,
        photos: specimenPhotos,
        hints: guide?.hints ?? [],
        ecology: guide?.ecology,
      }}
      questionNumber={currentIndex + 1}
      totalQuestions={totalQuestions}
      onAnswer={handleAnswer}
      onNext={handleNext}
      streak={stats.streak}
    />
  );
}
