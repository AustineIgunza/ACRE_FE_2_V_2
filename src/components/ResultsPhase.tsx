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
    <div className="min-h-screen bg-white text-black px-4 py-8 flex flex-col items-center justify-center">
      {/* Logo - at end */}
      <div className="mb-12 text-center animate-fadeIn">
        <h1 className="text-7xl font-black mb-4 tracking-tight">ARCÉ</h1>
        <p className="text-2xl font-light text-gray-600">Session Complete</p>
      </div>

      {/* Results Card */}
      <div className="max-w-2xl w-full bg-white border-3 border-black rounded-lg p-12 shadow-xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-black mb-2">
            {session.globalHeat >= 80 ? "IGNITION ACHIEVED" : "Mastery Report"}
          </h2>
          <p className="text-xl text-gray-600">{session.sourceTitle}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="border-2 border-black rounded-lg p-6 text-center">
            <div className="text-sm font-bold text-gray-600 uppercase mb-2">
              Final Heat
            </div>
            <div className="text-5xl font-black text-black">
              {session.globalHeat}%
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${session.globalHeat}%` }}
              ></div>
            </div>
          </div>

          <div className="border-2 border-black rounded-lg p-6 text-center">
            <div className="text-sm font-bold text-gray-600 uppercase mb-2">
              Integrity
            </div>
            <div className="text-5xl font-black text-black">
              {session.globalIntegrity}%
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${session.globalIntegrity}%` }}
              ></div>
            </div>
          </div>

          <div className="border-2 border-black rounded-lg p-6 text-center">
            <div className="text-sm font-bold text-gray-600 uppercase mb-2">
              Responses
            </div>
            <div className="text-5xl font-black text-black">
              {session.responses.length}
            </div>
          </div>

          <div className="border-2 border-black rounded-lg p-6 text-center">
            <div className="text-sm font-bold text-gray-600 uppercase mb-2">
              Mastery Cards
            </div>
            <div className="text-5xl font-black text-black">
              {session.masteryCards.length}
            </div>
          </div>
        </div>

        {/* Response Summary Table */}
        {session.responses.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-black text-black mb-4">Response Log</h3>
            <div className="overflow-x-auto border-2 border-black rounded-lg">
              <table className="w-full">
                <thead className="bg-black text-white">
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
                      className={`border-t-2 border-black ${
                        response.thermalResult === "frost"
                          ? "bg-red-50"
                          : response.thermalResult === "warning"
                            ? "bg-yellow-50"
                            : "bg-green-50"
                      }`}
                    >
                      <td className="p-3 font-bold">{idx + 1}</td>
                      <td className="p-3">
                        {response.thermalResult === "frost" && "Frost"}
                        {response.thermalResult === "warning" && "Warning"}
                        {response.thermalResult === "ignition" && "Ignition"}
                      </td>
                      <td className="p-3">{response.defense.length} chars</td>
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
            className="button-rainbow w-full py-4 px-6 font-bold rounded-lg border-2 border-black bg-white text-black hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
          >
            Share to WhatsApp
          </button>
          <button
            onClick={shareToTwitter}
            className="button-rainbow w-full py-4 px-6 font-bold rounded-lg border-2 border-black bg-white text-black hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
          >
            Share to Twitter
          </button>
        </div>

        {/* Recommendations */}
        <div className="bg-gray-50 border-2 border-black rounded-lg p-6 mb-8">
          <h4 className="font-bold text-black mb-3">Key Insights</h4>
          <ul className="text-sm text-gray-700 space-y-2">
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
            className="button-rainbow w-full py-4 px-6 font-bold text-lg rounded-lg border-2 border-black bg-black text-white hover:bg-gray-800 transition-all"
          >
            Start New Session
          </button>
        </div>
      </div>
    </div>
  );
}
