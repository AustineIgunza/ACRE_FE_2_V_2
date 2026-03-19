"use client";

export default function MiniLoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-40 animate-fadeIn">
      <div className="bg-gradient-to-br from-white to-blue-50 border-1.5 border-blue-200 rounded-2xl p-12 shadow-2xl text-center max-w-sm w-full mx-4 animate-scaleIn">
        {/* Premium Gradient Spinner */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-20 h-20">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-blue-400 rounded-full animate-spin" style={{ animationDuration: "2s" }}></div>
            {/* Inner counter-rotating ring */}
            <div className="absolute inset-2 border-3 border-transparent border-b-emerald-500 border-l-emerald-400 rounded-full animate-spin" style={{ animationDuration: "3s", animationDirection: "reverse" }}></div>
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3 animate-slideDown">
          Evaluating...
        </h3>
        <p className="text-slate-600 text-sm sm:text-base font-medium mb-8 animate-slideDown" style={{ animationDelay: "0.1s" }}>
          Analyzing your logic depth and causality
        </p>

        {/* Animated progress dots */}
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
