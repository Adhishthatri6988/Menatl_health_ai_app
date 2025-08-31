"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Indian Temple Builder pieces
const templePieces = [
  { type: "temple", icon: "🛕" },
  { type: "diya", icon: "🪔" },
  { type: "lotus", icon: "🪷" },
  { type: "om", icon: "🕉️" },
  { type: "flag", icon: "🚩" },
];

const GRID_SIZE = 40; // Grid snapping
const LAYER_HEIGHT = 14; // Vertical offset per layer

export function TempleBuilder() {
  const [placedItems, setPlacedItems] = useState<
    Array<{ type: string; icon: string; x: number; y: number; layer: number }>
  >([]);
  const [selectedItem, setSelectedItem] = useState(templePieces[0]);

  // Place item with snapping and stacking
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Snap to grid
    x = Math.round(x / GRID_SIZE) * GRID_SIZE;
    y = Math.round(y / GRID_SIZE) * GRID_SIZE;

    // Count how many pieces already exist at this cell to determine layer
    const overlapping = placedItems.filter((item) => item.x === x && item.y === y);
    const layer = overlapping.length;

    setPlacedItems([...placedItems, { ...selectedItem, x, y, layer }]);
  };

  // Delete last placed piece
  const handleDeleteLast = () => {
    setPlacedItems((prev) => prev.slice(0, -1));
  };

  // Clear all pieces
  const handleClear = () => setPlacedItems([]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-center gap-4">
        {templePieces.map((item) => (
          <motion.button
            key={item.type}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedItem(item)}
            className={`p-4 rounded-xl shadow-md transition-colors duration-200
              ${
                selectedItem.type === item.type
                  ? "bg-gradient-to-br from-orange-300/30 to-yellow-300/30 ring-2 ring-primary"
                  : "bg-muted/30 hover:bg-muted/50"
              }`}
          >
            <span className="text-2xl">{item.icon}</span>
          </motion.button>
        ))}

        {/* Delete Last */}
        <button
          onClick={handleDeleteLast}
          className="p-4 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-700 dark:text-yellow-400 shadow-md transition-colors"
        >
          ⬅️
        </button>

        {/* Clear All */}
        <button
          onClick={handleClear}
          className="p-4 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-600 dark:text-red-400 shadow-md transition-colors"
        >
          🗑️
        </button>
      </div>

      {/* Temple Canvas */}
      <div
        onClick={handleCanvasClick}
        className="relative w-full h-[420px] rounded-2xl cursor-pointer overflow-hidden 
                   bg-gradient-to-br from-yellow-50 to-orange-100 
                   dark:from-gray-900 dark:to-gray-800 border border-muted shadow-inner"
      >
        {/* Subtle courtyard texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.03)_1px,_transparent_0)] 
                        bg-[length:20px_20px] opacity-20 pointer-events-none" />

        {/* Optional grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(Math.floor(420 / GRID_SIZE))].map((_, i) => (
            <div key={i}>
              <div
                className="absolute w-full h-[1px] bg-gray-200 dark:bg-gray-700 opacity-20"
                style={{ top: i * GRID_SIZE }}
              />
              <div
                className="absolute h-full w-[1px] bg-gray-200 dark:bg-gray-700 opacity-20"
                style={{ left: i * GRID_SIZE }}
              />
            </div>
          ))}
        </div>

        {/* Placed temple items with layers */}
        {placedItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "absolute",
              left: item.x - 14,
              top: item.y - 14 - item.layer * LAYER_HEIGHT, // layer offset
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
