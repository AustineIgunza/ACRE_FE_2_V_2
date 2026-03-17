"use client";

import { useState } from "react";
import { HeatmapSession, ConceptNode, NodeState } from "@/types";

interface InputPhaseProps {
  onSessionStart: (session: HeatmapSession) => void;
}

export default function InputPhase({ onSessionStart }: InputPhaseProps) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock function to generate nodes from content (Day 2+ will call backend)
  const generateMockNodes = (sourceContent: string): ConceptNode[] => {
    const mockNodeCount = 4; // 2x2 grid
    const nodes: ConceptNode[] = [];

    for (let i = 0; i < mockNodeCount; i++) {
      nodes.push({
        id: `node-${i}`,
        label: `Logic Node ${i + 1}`,
        description: `Key concept extracted from your content`,
        state: NodeState.COLD,
        heat: 0,
        iterations: [],
      });
    }

    return nodes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Please paste your notes or transcript");
      return;
    }

    setIsLoading(true);

    // Simulate API delay (Day 2+ will be real backend call)
    setTimeout(() => {
      const session: HeatmapSession = {
        id: `session-${Date.now()}`,
        sourceContent: content,
        sourceTitle: title || "Untitled Challenge",
        nodes: generateMockNodes(content),
        totalHeat: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        completed: false,
      };

      // Save to localStorage
      localStorage.setItem(`acre-session-${session.id}`, JSON.stringify(session));

      onSessionStart(session);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-2">Start Your Challenge</h2>
        <p className="text-slate-400 mb-6">
          Paste your notes, video transcript, or any learning material to activate the heat map.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Challenge Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Alex Hormozi: Volume Negates Luck"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none transition"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Paste Your Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your notes, transcript, or any text content here..."
              className="w-full h-64 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none transition resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {content.length} characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              isLoading || !content.trim()
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/50"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin mr-2">⚡</div>
                Generating heat map...
              </div>
            ) : (
              "Ignite the Heat Map"
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <p className="text-sm text-slate-300">
            💡 <strong>Pro Tip:</strong> The longer and more detailed your content, the richer your heat map will be. Try pasting a video transcript or detailed lecture notes.
          </p>
        </div>
      </div>
    </div>
  );
}
