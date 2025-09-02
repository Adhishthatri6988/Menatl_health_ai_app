"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- CHANGE: The props are now correct.
// onSuccess expects to receive the mood data.
// isSaving is passed down from the parent to control the loading state.
interface MoodFormProps {
  onSuccess: (data: { moodScore: number }) => void;
  isSaving?: boolean;
}

export function MoodForm({ onSuccess, isSaving }: MoodFormProps) {
  const [moodScore, setMoodScore] = useState(50);

  const emotions = [
    { value: 0, label: "😔", description: "Very Low" },
    { value: 25, label: "😕", description: "Low" },
    { value: 50, label: "😊", description: "Neutral" },
    { value: 75, label: "😃", description: "Good" },
    { value: 100, label: "🤗", description: "Great" },
  ];

  const currentEmotion =
    emotions.find((em) => Math.abs(moodScore - em.value) < 15) || emotions[2];

  // --- CHANGE: The handleSubmit function is now much simpler.
  // It no longer makes an API call. It just passes the data up to the parent.
  const handleSubmit = () => {
    if (isSaving) return;
    onSuccess({ moodScore });
  };

  return (
    // --- CHANGE: The entire component is now styled to match your purple theme. ---
    <div className="space-y-8 py-4">
      <motion.div
        key={currentEmotion.label}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-center space-y-2"
      >
        <div className="text-6xl">{currentEmotion.label}</div>
        <div className="text-md font-medium text-foreground">
          {currentEmotion.description}
        </div>
      </motion.div>

      <div className="space-y-4 px-2">
        {/* --- CHANGE: Styled Slider to match the theme. --- */}
        <Slider
          value={[moodScore]}
          onValueChange={(value) => setMoodScore(value[0])}
          min={0}
          max={100}
          step={1}
          className="py-4 [&>span]:bg-primary/20 [&>span>span]:bg-gradient-to-r [&>span>span]:from-primary [&>span>span]:to-secondary"
        />
        <div className="flex justify-between">
          {emotions.map((em) => (
            <div
              key={em.value}
              className="text-2xl opacity-50 cursor-pointer hover:opacity-100 transition-opacity"
              onClick={() => setMoodScore(em.value)}
            >
              {em.label}
            </div>
          ))}
        </div>
      </div>

      {/* --- CHANGE: Styled Button with the primary gradient and loading state. --- */}
      <Button
        className={cn(
            "w-full h-12 text-md font-semibold transition-all duration-300 ease-out group",
            "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
            "hover:scale-105 hover:shadow-primary/40 dark:hover:shadow-[0_0_24px_theme(colors.primary/0.6)]"
        )}
        onClick={handleSubmit}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Mood"
        )}
      </Button>
    </div>
  );
}
