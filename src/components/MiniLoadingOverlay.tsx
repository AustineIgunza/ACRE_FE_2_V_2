"use client";

export default function MiniLoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="bg-white border-3 border-black rounded-lg p-12 shadow-2xl text-center">
        {/* Spinner */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-black border-r-black rounded-full animate-spin"></div>
          </div>
        </div>

        <h3 className="text-2xl font-black text-black mb-2">Evaluating...</h3>
        <p className="text-gray-600">Analyzing your logic depth</p>

        {/* Pulsing dots */}
        <div className="mt-6 flex justify-center gap-3">
          <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-black rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-black rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
