"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Flower,
  Trees,
  Waves,
  Building2,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- FINAL IMPORTS for the working game components ---
import { BreathingGame } from "./breathing-game";
import { ForestGame } from "./forest-game";
import { OceanWaves } from "./ocean-waves";
import { TempleBuilder } from "./temple-builder";

const games = [
  {
    id: "petal-pulse",
    title: "Petal Pulse",
    description: "Sync your breath with a gently blooming flower.",
    icon: Flower,
    color: "text-rose-400 dark:text-rose-400",
    bgColor: "bg-rose-500/10",
    duration: "5 mins",
  },
  {
    id: "temple-builder",
    title: "Temple Builder",
    description: "Cultivate a personal sanctuary of peace and reflection.",
    icon: Building2,
    color: "text-green-400 dark:text-green-400",
    bgColor: "bg-green-500/10",
    duration: "Creative",
  },
  {
    id: "grove-anthem",
    title: "Grove Anthem",
    description: "Listen to the symphony of a tranquil, whispering forest.",
    icon: Trees,
    color: "text-emerald-400 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    duration: "3 mins",
  },
  {
    id: "coastal-cadence",
    title: "Coastal Cadence",
    description: "Match your breath to the rhythmic sound of ocean waves.",
    icon: Waves,
    color: "text-cyan-400 dark:text-cyan-400",
    bgColor: "bg-cyan-500/10",
    duration: "5 mins",
  },
];

interface AnxietyGamesProps {
  onGamePlayed?: (gameName: string, description: string) => Promise<void>;
}

export const AnxietyGames = ({ onGamePlayed }: AnxietyGamesProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);

  const handleGameStart = async (gameId: string) => {
    setSelectedGame(gameId);
    setShowGame(true);

    if (onGamePlayed) {
      try {
        await onGamePlayed(
          gameId,
          games.find((g) => g.id === gameId)?.description || ""
        );
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    }
  };

  const renderGame = () => {
    // --- THIS NOW RENDERS THE FINAL, WORKING COMPONENTS ---
    switch (selectedGame) {
      case "petal-pulse":
        return <BreathingGame />;
      case "temple-builder":
        return <TempleBuilder />;
      case "grove-anthem":
        return <ForestGame />;
      case "coastal-cadence":
        return <OceanWaves />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="border-primary/10 bg-transparent">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary dark:text-purple-300">
            <Sparkles className="h-5 w-5" />
            Calming Activities
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-slate-400">
            Interactive experiences designed to bring you to a state of peace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-full"
              >
                <Card
                  className="border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer h-full group"
                  onClick={() => handleGameStart(game.id)}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${game.bgColor}`}
                      >
                        <game.icon className={`h-6 w-6 ${game.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{game.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {game.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pl-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {game.duration}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showGame} onOpenChange={setShowGame}>
        <DialogContent className="sm:max-w-[600px] bg-background">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {games.find((g) => g.id === selectedGame)?.title}
            </DialogTitle>
          </DialogHeader>
          {renderGame()}
        </DialogContent>
      </Dialog>
    </>
  );
};

