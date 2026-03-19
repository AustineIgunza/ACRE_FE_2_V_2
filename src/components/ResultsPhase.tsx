"use client";

import { GameSession, Cluster } from "@/types/arce";
import MasteryCanvas from "./MasteryCanvas";

interface ResultsPhaseProps {
  session: GameSession;
  onNewGame?: () => void;
}

export default function ResultsPhase({ session, onNewGame }: ResultsPhaseProps) {
  const shareToWhatsApp = () => {
    const text = `I just mastered "${session.sourceTitle}" on ARCÉ!

Heat: ${session.globalHeat}%
Integrity: ${session.globalIntegrity}%
Responses: ${session.responses.length}

Can you beat my score? Try ARCÉ now!`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareToTwitter = () => {
    const text = `Just crushed "${session.sourceTitle}" on ARCÉ - The Iteration Engine!

Final Heat: ${session.globalHeat}%
Mastered ${session.masteryCards.length} concepts through crisis scenarios.

Who can beat this? #ARCÉ #Mastery`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="min-h-screen-gradient bg-gradient-blue-white text-slate-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Header Section */}
      <div className="mb-12 sm:mb-16 text-center animate-fadeIn relative z-10 max-w-3xl">
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 tracking-tight bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          ARCÉ
        </h1>
        <h2 className="text-3xl sm:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          {session.globalHeat >= 80 ? "🔥 IGNITION ACHIEVED!" : "Session Complete"}
        </h2>
        <p className="text-lg sm:text-xl font-medium text-slate-600">
          {session.sourceTitle}
        </p>
      </div>

      {/* Results Container */}
      <div className="max-w-3xl w-full bg-white/90 backdrop-blur-lg border-1.5 border-blue-200 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-sm hover:shadow-md transition-all duration-300 relative z-10">
        {/* Stats Grid - Premium Card Design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Final Heat */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-1.5 border-orange-200 rounded-2xl p-4 sm:p-6 text-center group hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="text-xs sm:text-sm font-bold text-orange-600 uppercase tracking-widest mb-2 sm:mb-3">
              Final Heat
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-900 mb-3">
              {session.globalHeat}%
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-700"
                style={{ width: `${session.globalHeat}%` }}
              ></div>
            </div>
          </div>

          {/* Integrity */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-1.5 border-emerald-200 rounded-2xl p-4 sm:p-6 text-center group hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="text-xs sm:text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">
              Integrity
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-900 mb-3">
              {session.globalIntegrity}%
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-700"
                style={{ width: `${session.globalIntegrity}%` }}
              ></div>
            </div>
          </div>

          {/* Responses */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-1.5 border-blue-200 rounded-2xl p-4 sm:p-6 text-center group hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-widest mb-2 sm:mb-3">
              Responses
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-900">
              {session.responses.length}
            </div>
          </div>

          {/* Mastery Cards */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-1.5 border-purple-200 rounded-2xl p-4 sm:p-6 text-center group hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="text-xs sm:text-sm font-bold text-purple-600 uppercase tracking-widest mb-2 sm:mb-3">
              Mastery Cards
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-900">
              {session.masteryCards.length}
            </div>
          </div>
        </div>

        {/* Response Summary */}
        {session.responses.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 text-center">Response Journey</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {session.responses.map((response, idx) => (
                <div
                  key={response.id}
                  className={`p-3 sm:p-4 rounded-xl border-1.5 transition-all duration-300 group hover:scale-102 ${
                    response.thermalResult === "frost"
                      ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
                      : response.thermalResult === "warning"
                        ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                        : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-bold text-sm sm:text-base text-slate-700 whitespace-nowrap">Response {idx + 1}</span>
                      <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap ${
                        response.thermalResult === "frost"
                          ? "bg-orange-200 text-orange-900"
                          : response.thermalResult === "warning"
                            ? "bg-yellow-200 text-yellow-900"
                            : "bg-emerald-200 text-emerald-900"
                      }`}>
                        {response.thermalResult === "frost" && "❄️ Frost"}
                        {response.thermalResult === "warning" && "⚠️ Warning"}
                        {response.thermalResult === "ignition" && "🔥 Ignition"}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-slate-600 font-medium ml-2">{response.defense.length} chars</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mastery Cards Display */}
        {session.masteryCards.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 text-center">🔥 Your Mastery Cards</h3>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {session.masteryCards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50 border-1.5 border-blue-200 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <div className="mb-3">
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{card.nodeId.replace("node-", "Concept ")} - Unlocked</h4>
                    <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                      {card.formalDefinition}
                    </p>
                  </div>
                  
                  {/* Keywords */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {card.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 border-1.5 border-blue-200 rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10">
          <h4 className="font-bold text-slate-900 mb-3 sm:mb-4 text-center sm:text-left">✨ Key Insights</h4>
          <ul className="text-sm sm:text-base text-slate-700 space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">✓</span>
              <span>You identified <strong>{session.responses.filter((r) => r.thermalResult === "ignition").length}</strong> deep causal chains (Ignition level)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">✓</span>
              <span>You provided <strong>{session.responses.length}</strong> thoughtful responses</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">✓</span>
              <span>Review warning-level responses to deepen your mastery</span>
            </li>
          </ul>
        </div>

        {/* Sharing Buttons */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={shareToWhatsApp}
            className="py-3 sm:py-4 px-4 sm:px-6 font-bold text-sm sm:text-base rounded-2xl border-1.5 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 hover:shadow-md hover:scale-105 transition-all duration-300 active:scale-95"
          >
            📱 Share to WhatsApp
          </button>
          <button
            onClick={shareToTwitter}
            className="py-3 sm:py-4 px-4 sm:px-6 font-bold text-sm sm:text-base rounded-2xl border-1.5 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 hover:shadow-md hover:scale-105 transition-all duration-300 active:scale-95"
          >
            𝕏 Share to Twitter
          </button>
        </div>

        {/* Start New Session Button */}
        <button
          onClick={onNewGame}
          className="w-full py-4 sm:py-5 px-6 font-bold text-base sm:text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
        >
          🚀 Start New Session
        </button>
      </div>

      {/* Mastery Canvas - Elastic Grid of Nodes */}
      <div className="w-full mt-12 sm:mt-16 relative z-10">
        <MasteryCanvas clusters={session.clusters} />
      </div>
    </div>
  );
}
