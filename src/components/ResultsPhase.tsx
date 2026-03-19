"use client";

import { GameSession } from "@/types/arce";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-black px-4 py-8 flex flex-col items-center justify-center relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute -bottom-8 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      </div>

      {/* Logo - at end */}
      <div className="mb-12 text-center animate-fadeIn relative z-10">
        <h1 className="text-7xl font-black mb-4 tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">ARCÉ</h1>
        <p className="text-2xl font-light text-slate-600">Session Complete</p>
      </div>

      {/* Results Card */}
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-md border-2 border-blue-300 rounded-2xl p-12 shadow-xl relative z-10">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
            {session.globalHeat >= 80 ? "IGNITION ACHIEVED" : "Mastery Report"}
          </h2>
          <p className="text-xl text-slate-600">{session.sourceTitle}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="border-2 border-blue-300 rounded-xl p-6 text-center bg-gradient-to-br from-blue-50 to-slate-50">
            <div className="text-sm font-bold text-blue-600 uppercase mb-2">
              Final Heat
            </div>
            <div className="text-5xl font-black text-slate-900">
              {session.globalHeat}%
            </div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 transition-all duration-500"
                style={{ width: `${session.globalHeat}%` }}
              ></div>
            </div>
          </div>

          <div className="border-2 border-blue-300 rounded-xl p-6 text-center bg-gradient-to-br from-blue-50 to-slate-50">
            <div className="text-sm font-bold text-blue-600 uppercase mb-2">
              Integrity
            </div>
            <div className="text-5xl font-black text-slate-900">
              {session.globalIntegrity}%
            </div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${session.globalIntegrity}%` }}
              ></div>
            </div>
          </div>

          <div className="border-2 border-blue-300 rounded-xl p-6 text-center bg-gradient-to-br from-blue-50 to-slate-50">
            <div className="text-sm font-bold text-blue-600 uppercase mb-2">
              Responses
            </div>
            <div className="text-5xl font-black text-slate-900">
              {session.responses.length}
            </div>
          </div>

          <div className="border-2 border-blue-300 rounded-xl p-6 text-center bg-gradient-to-br from-blue-50 to-slate-50">
            <div className="text-sm font-bold text-blue-600 uppercase mb-2">
              Mastery Cards
            </div>
            <div className="text-5xl font-black text-slate-900">
              {session.masteryCards.length}
            </div>
          </div>
        </div>

        {/* Response Summary Table */}
        {session.responses.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-black text-slate-900 mb-4">Response Log</h3>
            <div className="overflow-x-auto border-2 border-blue-300 rounded-xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-left font-bold">#</th>
                    <th className="p-3 text-left font-bold">Thermal State</th>
                    <th className="p-3 text-left font-bold">Defense Length</th>
                  </tr>
                </thead>
                <tbody>
                  {session.responses.map((response, idx) => (
                    <tr
                      key={response.id}
                      className={`border-t border-blue-200 ${
                        response.thermalResult === "frost"
                          ? "bg-orange-50 hover:bg-orange-100"
                          : response.thermalResult === "warning"
                            ? "bg-yellow-50 hover:bg-yellow-100"
                            : "bg-emerald-50 hover:bg-emerald-100"
                      } transition-colors`}
                    >
                      <td className="p-3 font-bold text-slate-900">{idx + 1}</td>
                      <td className="p-3 text-slate-800">
                        {response.thermalResult === "frost" && "Frost"}
                        {response.thermalResult === "warning" && "Warning"}
                        {response.thermalResult === "ignition" && "Ignition"}
                      </td>
                      <td className="p-3 text-slate-800">{response.defense.length} chars</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sharing Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={shareToWhatsApp}
            className="w-full py-4 px-6 font-bold rounded-lg border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-slate-50 text-blue-700 hover:from-blue-100 hover:to-slate-100 transition-all shadow-md"
          >
            Share to WhatsApp
          </button>
          <button
            onClick={shareToTwitter}
            className="w-full py-4 px-6 font-bold rounded-lg border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-slate-50 text-blue-700 hover:from-blue-100 hover:to-slate-100 transition-all shadow-md"
          >
            Share to Twitter
          </button>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-300 rounded-xl p-6 mb-8">
          <h4 className="font-bold text-slate-900 mb-3">Key Insights</h4>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>
              • You identified {session.responses.filter((r) => r.thermalResult === "ignition").length} deep causal chains
            </li>
            <li>
              • Your highest integrity moment was at response{" "}
              {Math.ceil(session.responses.length / 2)}
            </li>
            <li>• Review warning-level responses to deepen your understanding</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onNewGame}
            className="w-full py-4 px-6 font-bold text-lg rounded-lg border-2 border-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg"
          >
            Start New Session
          </button>
        </div>
      </div>
    </div>
  );
}
