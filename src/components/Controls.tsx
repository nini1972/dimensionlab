import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Save, Trash2, Sliders, Play, Brain, ChevronDown, ChevronRight, Activity } from "lucide-react";
import { Figure, ParametricFormula } from "../types";
import { suggestFormula } from "../lib/gemini";

interface ControlsProps {
  figure: Figure;
  onUpdate: (figure: Figure) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function Controls({ figure, onUpdate, onSave, onDelete }: ControlsProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("math");

  const handleFormulaChange = (field: keyof ParametricFormula, value: any) => {
    onUpdate({
      ...figure,
      formula: {
        ...figure.formula,
        [field]: value
      }
    });
  };

  const handleParamChange = (param: 'a' | 'b' | 'c', value: number) => {
    onUpdate({
      ...figure,
      params: {
        ...figure.params,
        [param]: value
      }
    });
  };

  const handleAiSuggest = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const suggestion = await suggestFormula(aiPrompt);
      onUpdate({
        ...figure,
        name: suggestion.name,
        description: suggestion.description,
        formula: {
          ...figure.formula,
          x: suggestion.x,
          y: suggestion.y,
          z: suggestion.z,
          uRange: suggestion.uRange as [number, number],
          vRange: suggestion.vRange as [number, number],
        }
      });
      setAiPrompt("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-display font-bold tracking-tighter text-neon-cyan mb-1">DimensionLab</h1>
        <p className="text-xs text-zinc-500 font-mono">v1.1.0 // TEMPORAL_SYNC</p>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide p-6 space-y-8">
        {/* AI Generator Section */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-neon-pink">
            <Brain size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">AI Architect</span>
          </div>
          <div className="relative">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. A pulsing hyper-sphere using time t..."
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm rounded-lg focus:outline-none focus:border-neon-pink min-h-[80px] resize-none"
            />
            <button
              onClick={handleAiSuggest}
              disabled={isGenerating || !aiPrompt}
              className="absolute bottom-3 right-3 text-zinc-400 hover:text-neon-pink disabled:opacity-50 transition-colors"
            >
              <Sparkles size={18} className={isGenerating ? "animate-pulse" : ""} />
            </button>
          </div>
        </section>

        {/* Temporal Engine Section */}
        <section>
           <div className="flex items-center justify-between mb-3 text-emerald-400">
            <div className="flex items-center gap-2">
              <Activity size={16} />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Temporal Engine</span>
            </div>
            <button 
              onClick={() => onUpdate({ ...figure, isAnimated: !figure.isAnimated })}
              className={`px-3 py-1 text-[10px] font-mono border rounded uppercase transition-colors ${
                figure.isAnimated ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
              }`}
            >
              {figure.isAnimated ? "T-Active" : "T-Standby"}
            </button>
          </div>
        </section>

        {/* Dynamic Params Section */}
        <section>
           <div className="flex items-center gap-2 mb-4">
              <Sliders size={16} className="text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Field Parameters</span>
            </div>
            <div className="space-y-4">
              {['a', 'b', 'c'].map((p) => (
                <div key={p}>
                   <label className="flex justify-between text-[10px] text-zinc-600 mb-1 font-mono uppercase">
                    Variable {p} <span>{figure.params[p as 'a' | 'b' | 'c'].toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.01"
                    value={figure.params[p as 'a' | 'b' | 'c']}
                    onChange={(e) => handleParamChange(p as 'a' | 'b' | 'c', parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              ))}
            </div>
        </section>

        {/* Math Variables Section */}
        <section>
          <button 
            onClick={() => setExpandedSection(expandedSection === "math" ? null : "math")}
            className="flex items-center justify-between w-full mb-3 text-zinc-400 hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Play size={16} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest">Expression Matrix</span>
            </div>
            {expandedSection === "math" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          <AnimatePresence>
            {expandedSection === "math" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="block text-[10px] text-zinc-600 mb-1 font-mono uppercase">X(u, v, t, a, b, c)</label>
                  <input
                    value={figure.formula.x}
                    onChange={(e) => handleFormulaChange("x", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-sm rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-600 mb-1 font-mono uppercase">Y(u, v, t, a, b, c)</label>
                  <input
                    value={figure.formula.y}
                    onChange={(e) => handleFormulaChange("y", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-sm rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-600 mb-1 font-mono uppercase">Z(u, v, t, a, b, c)</label>
                  <input
                    value={figure.formula.z}
                    onChange={(e) => handleFormulaChange("z", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-sm rounded font-mono"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-1 font-mono uppercase">U Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={figure.formula.uRange[0]}
                        onChange={(e) => handleFormulaChange("uRange", [parseFloat(e.target.value), figure.formula.uRange[1]])}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs rounded"
                      />
                      <input
                        type="number"
                        value={figure.formula.uRange[1]}
                        onChange={(e) => handleFormulaChange("uRange", [figure.formula.uRange[0], parseFloat(e.target.value)])}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-1 font-mono uppercase">V Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={figure.formula.vRange[0]}
                        onChange={(e) => handleFormulaChange("vRange", [parseFloat(e.target.value), figure.formula.vRange[1]])}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs rounded"
                      />
                      <input
                        type="number"
                        value={figure.formula.vRange[1]}
                        onChange={(e) => handleFormulaChange("vRange", [figure.formula.vRange[0], parseFloat(e.target.value)])}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs rounded"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Visual Section */}
        <section>
           <button 
            onClick={() => setExpandedSection(expandedSection === "visual" ? null : "visual")}
            className="flex items-center justify-between w-full mb-3 text-zinc-400 hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-widest">Rendering styles</span>
            </div>
            {expandedSection === "visual" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          <AnimatePresence>
            {expandedSection === "visual" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="block text-[10px] text-zinc-600 mb-1 font-mono uppercase">Primary Color</label>
                  <input
                    type="color"
                    value={figure.color}
                    onChange={(e) => onUpdate({ ...figure, color: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 p-1 h-10 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] text-zinc-600 mb-1 font-mono uppercase">
                    Opacity <span>{Math.round(figure.opacity * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={figure.opacity}
                    onChange={(e) => onUpdate({ ...figure, opacity: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] text-zinc-600 mb-1 font-mono uppercase">
                    Resolution <span>{figure.formula.resolution}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="1"
                    value={figure.formula.resolution}
                    onChange={(e) => handleFormulaChange("resolution", parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <p className="text-[10px] text-zinc-700 mt-1 font-mono">Higher resolution = lower FPS during animation</p>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/50 border border-zinc-800/50">
                  <span className="text-xs font-mono uppercase text-zinc-400">Wireframe Mode</span>
                  <input
                    type="checkbox"
                    checked={figure.wireframe}
                    onChange={(e) => onUpdate({ ...figure, wireframe: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-neon-cyan focus:ring-neon-cyan"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <div className="p-6 border-t border-zinc-800 grid grid-cols-2 gap-3">
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 p-3 text-xs font-bold uppercase tracking-widest bg-zinc-900 hover:bg-red-950/30 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 rounded transition-all"
        >
          <Trash2 size={14} /> Reset
        </button>
        <button
          onClick={onSave}
          className="flex items-center justify-center gap-2 p-3 text-xs font-bold uppercase tracking-widest bg-neon-cyan hover:bg-cyan-400 text-zinc-950 rounded transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)]"
        >
          <Save size={14} /> Deploy
        </button>
      </div>
    </div>
  );
}
