"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Ripple } from "@/components/magicui/ripple";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import {
  Sparkles, // --- CHANGE: Replaced Waves with Sparkles ---
  ArrowRight,
  HeartPulse,
  Lightbulb,
  Lock,
  MessageSquareHeart,
} from "lucide-react";

export default function Home() {
  const emotions = [
    { value: 0, label: "😔 Down", color: "from-blue-500/50" },
    { value: 25, label: "😊 Content", color: "from-green-500/50" },
    { value: 50, label: "😌 Peaceful", color: "from-purple-500/50" },
    { value: 75, label: "🤗 Happy", color: "from-yellow-500/50" },
    { value: 100, label: "✨ Excited", color: "from-pink-500/50" },
  ];

  const [emotion, setEmotion] = useState(50);
  const [mounted, setMounted] = useState(false);

  // --- CHANGE: Updated feature descriptions and titles ---
  const features = [
    {
      icon: HeartPulse,
      title: "Always Available",
      description: "Your companion is here for you around the clock, offering a listening ear whenever you need it.",
      color: "from-rose-500/20",
      delay: 0.2,
    },
    {
      icon: Lightbulb,
      title: "Personalized Guidance",
      description: "Receive intelligent insights that help you understand your emotional patterns and grow.",
      color: "from-amber-500/20",
      delay: 0.4,
    },
    {
      icon: Lock,
      title: "Completely Confidential",
      description: "Your thoughts are safe. All conversations are private and fully encrypted.",
      color: "from-emerald-500/20",
      delay: 0.6,
    },
    {
      icon: MessageSquareHeart,
      title: "Rooted in Science",
      description: "Built on proven therapeutic techniques to provide effective, meaningful support.",
      color: "from-blue-500/20",
      delay: 0.8,
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentEmotion =
    emotions.find((em) => Math.abs(emotion - em.value) < 15) || emotions[2];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-background">
      <section className="relative min-h-[90vh] mt-20 flex flex-col items-center justify-center py-12 px-4">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className={`absolute w-[500px] h-[500px] rounded-full blur-3xl top-0 -left-20 transition-all duration-700 ease-in-out bg-gradient-to-r ${currentEmotion.color} to-transparent opacity-50`} />
          <div className="absolute w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl -top-40 -right-40" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl bottom-0 right-0 animate-pulse delay-700" />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl" />
        </div>
        <Ripple color="var(--primary)" className="opacity-70" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative space-y-8 text-center"
        >
          {/* --- CHANGE: Updated icon and text for the top badge --- */}
          <div className="group inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm border border-primary/20 bg-primary/5 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 cursor-pointer group-hover:animate-radiate">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary dark:text-purple-300">
              AI-Powered Emotional Wellness
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-plus-jakarta tracking-tight text-primary dark:text-purple-400">
            Embrace serenity
            <br />
            <span className="inline-block mt-2 text-secondary-foreground dark:text-slate-200">
              within you.
            </span>
          </h1>

          {/* --- CHANGE: Rewritten paragraph for more impact --- */}
          <p className="max-w-[600px] mx-auto text-base md:text-lg leading-relaxed tracking-wide text-muted-foreground dark:text-slate-300">
            Navigate your emotions with a compassionate AI partner, designed to listen, understand, and gently guide you towards a more balanced state of mind.
          </p>

          <motion.div
            className="w-full max-w-[600px] mx-auto space-y-6 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="space-y-2 text-center">
              {/* --- CHANGE: Updated slider prompt text --- */}
              <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">
                Share how you're feeling right now
              </p>

              <div className="flex justify-between items-center px-2">
                {emotions.map((em) => {
                  const isActive = Math.abs(emotion - em.value) < 15;
                  return (
                    <div
                      key={em.value}
                      className={`transition-all duration-500 ease-out cursor-pointer hover:scale-105 text-center p-2 rounded-full ${
                        isActive
                          ? "opacity-100 scale-110 transform-gpu animate-radiate"
                          : "opacity-50 scale-100"
                      }`}
                      onClick={() => setEmotion(em.value)}
                    >
                      <div className="text-2xl transform-gpu">{em.label.split(" ")[0]}</div>
                      <div className="text-xs text-muted-foreground dark:text-slate-400 mt-1 font-medium">{em.label.split(" ")[1]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="relative px-2">
              <div className={`absolute inset-0 bg-gradient-to-r ${currentEmotion.color} to-transparent blur-xl -z-10 transition-all duration-500`} />
              <Slider
                value={[emotion]}
                onValueChange={(value) => setEmotion(value[0])}
                className="py-4 [&>span]:bg-primary/20 [&>span>span]:bg-gradient-to-r [&>span>span]:from-primary [&>span>span]:to-secondary"
              />
            </div>

            {/* --- CHANGE: Updated slider instruction text --- */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground animate-pulse">
                Move the slider to find your current feeling
              </p>
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Button
              size="lg"
              className="
                relative group h-12 px-8 rounded-full shadow-lg transition-all duration-300 ease-out
                bg-gradient-to-r from-primary to-secondary text-primary-foreground
                hover:scale-105 group-hover:animate-radiate
              "
            >
              {/* --- CHANGE: Updated button text --- */}
              <span className="relative z-10 font-medium flex items-center gap-2">
                Start Your Path to Peace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16 space-y-4">
            {/* --- CHANGE: Updated features headline --- */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Toolkit for Emotional Clarity
            </h2>
            {/* --- CHANGE: Updated features sub-headline --- */}
            <p className="text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto font-medium text-lg">
              Intelligent features designed to support and empower your mental wellness journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="group relative overflow-hidden border-border hover:border-primary/50 transition-all duration-300 min-h-[200px] bg-card/30 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold tracking-tight text-card-foreground dark:text-slate-100">
                        {feature.title}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

