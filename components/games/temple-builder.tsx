"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eraser, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Indian Temple Builder pieces
const templePieces = [
  { type: "temple", icon: "🛕" },
  { type: "diya", icon: "🪔" },
  { type: "lotus", icon: "🪷" },
  { type: "om", icon: "🕉️" },
  { type: "flag", icon: "🚩" },
];

const GRID_SIZE = 40;
const LAYER_HEIGHT = 14;

export function TempleBuilder() {
  const [placedItems, setPlacedItems] = useState<
    Array<{ type: string; icon: string; x: number; y: number; layer: number }>
  >([]);
  const [selectedItem, setSelectedItem] = useState(templePieces[0]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Snap to grid
    x = Math.round(x / GRID_SIZE) * GRID_SIZE;
    y = Math.round(y / GRID_SIZE) * GRID_SIZE;

    const overlapping = placedItems.filter((item) => item.x === x && item.y === y);
    const layer = overlapping.length;

    setPlacedItems([...placedItems, { ...selectedItem, x, y, layer }]);
  };

  const handleDeleteLast = () => {
    setPlacedItems((prev) => prev.slice(0, -1));
  };

  const handleClear = () => setPlacedItems([]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-center items-center gap-2 md:gap-4 p-2 bg-primary/5 rounded-full">
        {templePieces.map((item) => (
          <motion.button
            key={item.type}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedItem(item)}
            className={cn(
                "p-3 rounded-full transition-all duration-300",
                selectedItem.type === item.type
                  ? "bg-primary/20 ring-2 ring-primary/50"
                  : "hover:bg-primary/10"
              )}
          >
            <span className="text-2xl">{item.icon}</span>
          </motion.button>
        ))}
        <div className="h-8 w-px bg-primary/20 mx-2" />
        <Button onClick={handleDeleteLast} variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
          <Eraser className="w-5 h-5" />
        </Button>
        <Button onClick={handleClear} variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-rose-500">
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Temple Canvas */}
      <div
        onClick={handleCanvasClick}
        className="relative w-full h-[360px] md:h-[420px] rounded-2xl cursor-pointer overflow-hidden 
                   bg-gradient-to-br from-purple-500/5 to-indigo-500/5 
                   dark:from-gray-900 dark:to-gray-800 border border-primary/10 shadow-inner"
      >
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(Math.floor(500 / GRID_SIZE))].map((_, i) => (
            <div key={`grid-line-${i}`}>
              <div
                className="absolute w-full h-px bg-primary/10"
                style={{ top: i * GRID_SIZE }}
              />
              <div
                className="absolute h-full w-px bg-primary/10"
                style={{ left: i * GRID_SIZE }}
              />
            </div>
          ))}
        </div>

        {/* Placed items */}
        {placedItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "absolute",
              left: item.x - 14,
              top: item.y - 14 - item.layer * LAYER_HEIGHT,
              zIndex: item.layer + 1
            }}
            className="text-2xl drop-shadow-lg"
          >
            {item.icon}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

