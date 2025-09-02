"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Calendar,
  Activity,
  Sun,
  Moon,
  Heart,
  Trophy,
  Bell,
  AlertCircle,
  PhoneCall,
  Sparkles,
  MessageSquare,
  BrainCircuit,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { MoodForm } from "@/components/mood/mood-form";
import { AnxietyGames } from "@/components/games/anxiety-games";
import {
  getUserActivities,
  saveMoodData,
  logActivity,
} from "@/lib/static-dashboard-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { addDays, format, subDays, startOfDay, isWithinInterval } from "date-fns";
import { ActivityLogger } from "@/components/activities/activity-logger";
import { useSession } from "@/lib/contexts/session-context";
import { getAllChatSessions } from "@/lib/api/chat";

// Type definitions
type ActivityLevel = "none" | "low" | "medium" | "high";

interface Activity {
  id: string;
  userId: string | null;
  type: string;
  name: string;
  description: string | null;
  timestamp: Date;
  duration: number | null;
  completed: boolean;
  moodScore: number | null;
  moodNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DailyStats {
  moodScore: number | null;
  completionRate: number;
  mindfulnessCount: number;
  totalActivities: number;
  lastUpdated: Date;
}

// Helper function to calculate daily stats
const calculateDailyStats = (activities: Activity[]): DailyStats => {
  const today = startOfDay(new Date());
  const todaysActivities = activities.filter((activity) =>
    isWithinInterval(new Date(activity.timestamp), {
      start: today,
      end: addDays(today, 1),
    })
  );
  const moodEntries = todaysActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  const averageMood =
    moodEntries.length > 0
      ? Math.round(
          moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
            moodEntries.length
        )
      : null;
  const therapySessions = activities.filter((a) => a.type === "therapy").length;
  return {
    moodScore: averageMood,
    completionRate: 100,
    mindfulnessCount: therapySessions,
    totalActivities: todaysActivities.length,
    lastUpdated: new Date(),
  };
};

// Original, more detailed insight generation logic
const generateInsights = (activities: Activity[]) => {
  const insights: {
    title: string;
    description: string;
    icon: any;
    priority: "low" | "medium" | "high";
  }[] = [];
  const lastWeek = subDays(new Date(), 7);
  const recentActivities = activities.filter(
    (a) => new Date(a.timestamp) >= lastWeek
  );
  const moodEntries = recentActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  if (moodEntries.length >= 2) {
    const averageMood =
      moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
      moodEntries.length;
    const latestMood = moodEntries[moodEntries.length - 1].moodScore || 0;
    if (latestMood > averageMood) {
      insights.push({
        title: "Positive Momentum",
        description:
          "Your recent mood logs are trending upwards. Keep nurturing this positive feeling!",
        icon: Sun,
        priority: "high",
      });
    } else if (latestMood < averageMood - 20) {
      insights.push({
        title: "A Moment to Reflect",
        description:
          "It seems your mood has dipped recently. This might be a good time for a calming activity.",
        icon: Moon,
        priority: "high",
      });
    }
  }
  const mindfulnessActivities = recentActivities.filter((a) =>
    ["game", "meditation", "breathing"].includes(a.type)
  );
  if (mindfulnessActivities.length > 3) {
    insights.push({
      title: "Consistent Practice",
      description:
        "You're consistently making time for mindfulness. This is a wonderful habit for mental clarity.",
      icon: Trophy,
      priority: "medium",
    });
  }
  const completedActivities = recentActivities.filter((a) => a.completed);
  const completionRate =
    recentActivities.length > 0
      ? (completedActivities.length / recentActivities.length) * 100
      : 0;
  if (completionRate >= 80) {
    insights.push({
      title: "High Achievement",
      description: `You've completed ${Math.round(
        completionRate
      )}% of your activities this week. Excellent commitment!`,
      icon: Trophy,
      priority: "high",
    });
  }
  return insights
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const { user } = useSession();
  const [insights, setInsights] = useState<
    {
      title: string;
      description: string;
      icon: any;
      priority: "low" | "medium" | "high";
    }[]
  >([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showCheckInChat, setShowCheckInChat] = useState(false); // Restored state
  const [showActivityLogger, setShowActivityLogger] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false); // Restored state
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    moodScore: null,
    completionRate: 100,
    mindfulnessCount: 0,
    totalActivities: 0,
    lastUpdated: new Date(),
  });

  const loadActivities = useCallback(async () => {
    try {
      const userActivities = await getUserActivities("default-user");
      setActivities(userActivities);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  }, []);
  
  // Restored original, more robust data fetching function
  const fetchDailyStats = useCallback(async () => {
    try {
      const sessions = await getAllChatSessions();
      const activitiesResponse = await fetch("/api/activities/today");
      if (!activitiesResponse.ok) throw new Error("Failed to fetch activities");
      const activities = await activitiesResponse.json();
      const moodEntries = activities.filter(
        (a: Activity) => a.type === "mood" && a.moodScore !== null
      );
      const averageMood =
        moodEntries.length > 0
          ? Math.round(
              moodEntries.reduce(
                (acc: number, curr: Activity) => acc + (curr.moodScore || 0),
                0
              ) / moodEntries.length
            )
          : null;
      setDailyStats({
        moodScore: averageMood,
        completionRate: 100,
        mindfulnessCount: sessions.length,
        totalActivities: activities.length,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching daily stats:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadActivities();
    fetchDailyStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const statsInterval = setInterval(fetchDailyStats, 5 * 60 * 1000); // Restored interval
    return () => {
      clearInterval(timer);
      clearInterval(statsInterval);
    };
  }, [loadActivities, fetchDailyStats]);

  useEffect(() => {
    if (activities.length > 0) {
      setDailyStats(calculateDailyStats(activities));
      setInsights(generateInsights(activities));
    }
  }, [activities]);
  
  // Restored Action Handlers
  const handleStartTherapy = () => {
    router.push("/therapy/new");
  };

  const handleMoodSubmit = async (data: { moodScore: number }) => {
    setIsSavingMood(true);
    try {
      await saveMoodData({
        userId: "default-user",
        mood: data.moodScore,
        note: "",
      });
      setShowMoodModal(false);
      loadActivities(); // Refresh data after submission
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSavingMood(false);
    }
  };
  
  const handleAICheckIn = () => {
    // This can open either the logger or the chat panel
    setShowActivityLogger(true); 
  };
  
  const handleGamePlayed = useCallback(
    async (gameName: string, description: string) => {
      try {
        await logActivity({
          userId: "default-user",
          type: "game",
          name: gameName,
          description: description,
          duration: 0,
        });
        loadActivities(); // Refresh activities
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    },
    [loadActivities]
  );
  
  // New styled wellness stats array
  const wellnessStats = [
    {
      title: "Today's Mood",
      value: dailyStats.moodScore ? `${dailyStats.moodScore}%` : "N/A",
      icon: Brain,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Task Harmony",
      value: "100%",
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Sessions",
      value: `${dailyStats.mindfulnessCount}`,
      icon: Heart,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
    },
    {
      title: "Activities",
      value: dailyStats.totalActivities.toString(),
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* New decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl -top-20 -left-20" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl -bottom-20 -right-20 animate-pulse" />
      </div>

      <Container className="pt-20 pb-8 space-y-6">
        {/* New styled header */}
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-3xl font-bold text-primary dark:text-purple-300">
              Your Sanctuary
            </h1>
            <p className="text-muted-foreground dark:text-slate-400">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </motion.div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New styled Quick Actions card with original onClick handlers */}
            <Card className="border-primary/10 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        A Moment for You
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Begin with a single, mindful step.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Button
                      variant="default"
                      className="w-full justify-between items-center p-6 h-auto group rounded-lg transition-all duration-300 shadow-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:scale-[1.02] group-hover:animate-radiate"
                      onClick={handleStartTherapy}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Talk with InnerEase</div>
                          <div className="text-xs text-white/80">
                            Start a guided conversation.
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="flex flex-col h-auto p-4 gap-2 text-center group"
                        onClick={() => setShowMoodModal(true)}
                      >
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Log Your Feeling</div>
                          <div className="text-xs text-muted-foreground">
                            Record your emotional state.
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col h-auto p-4 gap-2 text-center group"
                        onClick={handleAICheckIn}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <BrainCircuit className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Daily Reflection</div>
                          <div className="text-xs text-muted-foreground">
                            A moment for mindfulness.
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New styled Overview card with functional refresh button restored */}
            <Card className="border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Today's Harmony</CardTitle>
                  <CardDescription>A snapshot of your day.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchDailyStats} className="h-8 w-8">
                  <Loader2 className={cn("h-4 w-4", "animate-spin")} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {wellnessStats.map((stat) => (
                    <div
                      key={stat.title}
                      className={cn(
                        "p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]",
                        stat.bgColor
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                        <p className="text-sm font-medium text-foreground/80">
                          {stat.title}
                        </p>
                      </div>
                      <p className="text-2xl font-bold mt-2 text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-muted-foreground text-right">
                  Last updated: {format(dailyStats.lastUpdated, "h:mm a")}
                </div>
              </CardContent>
            </Card>
            
            {/* New styled Insights card */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Mindful Moments
                </CardTitle>
                <CardDescription>
                  Gentle suggestions for your path.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.length > 0 ? (
                    insights.map((insight, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-lg space-y-2 transition-all hover:scale-[1.02]",
                          insight.priority === "high"
                            ? "bg-primary/10"
                            : "bg-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <insight.icon className="w-5 h-5 text-primary" />
                          <p className="font-medium text-foreground">
                            {insight.title}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p>
                        Engage in more activities to unlock personalized
                        insights.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New styled Anxiety Games section with original onGamePlayed handler */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Calming Activities</CardTitle>
              <CardDescription>
                Interactive experiences to find your center.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnxietyGames onGamePlayed={handleGamePlayed} />
            </CardContent>
          </Card>
        </div>
      </Container>
      
      {/* Original functional modals */}
      <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How are you feeling?</DialogTitle>
            <DialogDescription>
              Move the slider to track your current mood
            </DialogDescription>
          </DialogHeader>
          <MoodForm
            onSuccess={handleMoodSubmit} // Restored the correct handler
            isSaving={isSavingMood}
          />
        </DialogContent>
      </Dialog>
      
      {/* Restored AI check-in chat panel */}
      {showCheckInChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-lg">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">AI Check-in</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCheckInChat(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Restored Activity Logger */}
      <ActivityLogger
        open={showActivityLogger}
        onOpenChange={setShowActivityLogger}
        onActivityLogged={loadActivities}
      />
    </div>
  );
}