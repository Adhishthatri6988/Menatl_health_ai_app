"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Waves, Volume2, VolumeX, Play, Pause, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

const BREATH_DURATION = 8; // seconds for one full wave cycle
const SESSION_DURATION = 5 * 60; // 5 minutes in seconds

export function OceanWaves() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const waveControls = useAnimation();
  
  // Use a ref to hold the audio element
  const audio = useRef(new Audio("/sounds/waves.mp3"));

  useEffect(() => {
    const audioEl = audio.current;
    audioEl.loop = true;

    // Cleanup function
    return () => {
      audioEl.pause();
      audioEl.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    audio.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
           if (newTime <= 0) {
             setIsPlaying(false);
             setIsComplete(true);
             waveControls.stop();
             audio.current.pause();
           }
          setProgress(((SESSION_DURATION - newTime) / SESSION_DURATION) * 100);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, waveControls]);

  const togglePlay = () => {
    if (isPlaying) {
      audio.current.pause();
      waveControls.stop();
    } else {
      if (isComplete) {
         setTimeLeft(SESSION_DURATION);
         setProgress(0);
         setIsComplete(false);
      }
      audio.current.play();
      waveControls.start({
        y: ["-10%", "10%", "-10%"],
        transition: {
          duration: BREATH_DURATION,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });
    }
    setIsPlaying(!isPlaying);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

   if (isComplete) {
    return (
       <div className="flex flex-col items-center justify-center h-[400px] space-y-6 bg-background rounded-xl p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="w-10 h-10 text-primary" />
        </motion.div>
        <h3 className="text-2xl font-semibold text-primary">Session Complete</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          You've finished your session with the calming rhythm of the ocean.
        </p>
        <Button onClick={togglePlay} className="mt-4">
          Begin Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-[400px] space-y-8 bg-background rounded-xl p-6">
      <div className="relative w-48 h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-full blur-xl" />
        <motion.div animate={waveControls} className="absolute inset-0 flex items-center justify-center">
            <Waves className="w-24 h-24 text-cyan-400" />
        </motion.div>
      </div>

       <div className="w-64 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Volume</span>
            <span>{volume}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setVolume(0)}><VolumeX className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
            <Slider value={[volume]} onValueChange={(value) => setVolume(value[0])} max={100} step={1} />
            <button onClick={() => setVolume(100)}><Volume2 className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
          </div>
        </div>

        <Progress value={progress} className="h-2 bg-primary/10 [&>div]:bg-cyan-400" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-muted-foreground">{formatTime(timeLeft)}</span>
          <Button variant="outline" size="icon" onClick={togglePlay} className="rounded-full w-12 h-12 bg-primary/10 border-primary/20 hover:bg-primary/20">
            {isPlaying ? <Pause className="h-5 w-5 text-primary" /> : <Play className="h-5 w-5 text-primary" />}
          </Button>
          <span className="text-sm font-mono text-muted-foreground">{formatTime(SESSION_DURATION)}</span>
        </div>
      </div>
    </div>
  );
}

