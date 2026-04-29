/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Figure } from "./types";
import { Scene } from "./components/Scene";
import { Controls } from "./components/Controls";
import { Boxes, Info } from "lucide-react";

const INITIAL_FIGURE: Figure = {
  id: "default",
  name: "Animated Hypersurface",
  description: "A dynamic surface morphing through time 't' and params 'a, b, c'",
  formula: {
    x: "(2 + cos(v)) * cos(u) + sin(t) * a",
    y: "(2 + cos(v)) * sin(u) + cos(t) * b",
    z: "sin(v) + c * sin(5 * u + t)",
    uRange: [0, Math.PI * 2],
    vRange: [0, Math.PI * 2],
    resolution: 80, // Lower initial resolution for smooth animation
  },
  color: "#00f3ff",
  opacity: 0.8,
  wireframe: true,
  isAnimated: true,
  params: {
    a: 1,
    b: 1,
    c: 0.5,
  },
};

export default function App() {
  const [figure, setFigure] = useState<Figure>(INITIAL_FIGURE);
  const [notification, setNotification] = useState<string | null>(null);

  const handleUpdate = (newFigure: Figure) => {
    setFigure(newFigure);
  };

  const handleSave = () => {
    setNotification("FIGURE_STATE_DEPLOYED_SUCCESSFULLY");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReset = () => {
    setFigure(INITIAL_FIGURE);
    setNotification("FIGURE_STATE_RESET");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Sidebar Controls */}
      <aside className="w-80 border-r border-zinc-800 glass-panel z-10">
        <Controls 
          figure={figure} 
          onUpdate={handleUpdate} 
          onSave={handleSave} 
          onDelete={handleReset} 
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col">
        {/* Top Header Label */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
          <div className="p-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded shadow-[0_0_15px_rgba(0,243,255,0.1)]">
            <Boxes className="text-neon-cyan" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-display font-medium tracking-tight uppercase">{figure.name}</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{figure.description}</p>
          </div>
        </div>

        {/* 3D Scene */}
        <div className="flex-1 w-full h-full">
          <Scene figure={figure} />
        </div>

        {/* Info Labels / HUD Elements */}
        <div className="absolute bottom-6 left-6 z-10 space-y-2 pointer-events-none">
          <div className="flex items-center gap-2 drop-shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Render: [ACTIVE]</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Resolution: {figure.formula.resolution}x{figure.formula.resolution}
          </div>
        </div>

        {/* Floating Help Bubble */}
        <div className="absolute top-6 right-6 z-10">
          <div className="group relative">
            <div className="p-2 cursor-help text-zinc-500 hover:text-white transition-colors">
              <Info size={18} />
            </div>
            <div className="absolute top-full right-0 mt-2 w-64 p-3 glass-panel rounded-lg text-[10px] leading-relaxed text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-zinc-800">
              <p className="font-bold text-zinc-300 mb-1 uppercase tracking-tighter italic">Operational Instructions</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use <span className="text-zinc-100">u</span> and <span className="text-zinc-100">v</span> as parameters.</li>
                <li>Mathematical functions: sin, cos, tan, exp, sqrt, abs...</li>
                <li>Mouse: Drag to rotate, Scroll to zoom.</li>
                <li>AI Architect: Describe a shape to generate formulas.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Notification Overlay */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-8 right-8 z-20 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded shadow-xl flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full shadow-[0_0_8px_#00f3ff]"></div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

