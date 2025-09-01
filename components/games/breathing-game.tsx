"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flower, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const TOTAL_ROUNDS = 5;
const INHALE_DURATION = 5000; // 5 seconds
const HOLD_DURATION = 2500; // 2.5 seconds
const EXHALE_DURATION = 5000; // 5 seconds

export function BreathingGame() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [progress, setProgress] = useState(0);
  const [round, setRound] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isComplete || isPaused) return;

    const phaseDurations = {
      inhale: INHALE_DURATION,
      hold: HOLD_DURATION,
      exhale: EXHALE_DURATION,
    };
    const currentDuration = phaseDurations[phase];
    let startTime = Date.now();

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = Math.min((elapsedTime / currentDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        if (phase === "inhale") setPhase("hold");
        else if (phase === "hold") setPhase("exhale");
        else { // exhale
          if (round >= TOTAL_ROUNDS) {
            setIsComplete(true);
          } else {
            setRound(r => r + 1);
            setPhase("inhale");
          }
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [phase, round, isComplete, isPaused]);
  
  const handleReset = () => {
    setPhase("inhale");
    setProgress(0);
    setRound(1);
    setIsComplete(false);
    setIsPaused(false);
  };

  const phaseConfig = {
      inhale: { text: "Breathe In", color: "bg-blue-500/10", scale: 1.5 },
      hold: { text: "Hold", color: "bg-yellow-500/10", scale: 1.2 },
      exhale: { text: "Breathe Out", color: "bg-purple-500/10", scale: 1 },
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-6 bg-background rounded-xl p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="w-10 h-10 text-primary" />
        </motion.div>
        <h3 className="text-2xl font-semibold text-primary">Well Done!</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          You’ve completed {TOTAL_ROUNDS} rounds of mindful breathing.
        </p>
        <Button onClick={handleReset} className="mt-4">
          Practice Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[400px] space-y-8 bg-background rounded-xl p-6">
      <div className="text-center space-y-4">
        <div className="relative w-36 h-36 mx-auto">
          <motion.div
            animate={{ scale: phaseConfig[phase].scale }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className={`absolute inset-0 rounded-full ${phaseConfig[phase].color}`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Flower className="w-12 h-12 text-rose-400" />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.h3
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-2xl font-semibold tracking-wide text-foreground"
          >
            {phaseConfig[phase].text}
          </motion.h3>
        </AnimatePresence>
      </div>

      <div className="w-64">
        <Progress value={progress} className={`h-2 [&>div]:bg-purple-400`} />
      </div>

      <div className="space-y-2 text-center">
        <div className="text-sm text-muted-foreground">
          Round {round} of {TOTAL_ROUNDS}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsPaused(!isPaused)} className="text-primary">
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </div>
    </div>
  );
}

