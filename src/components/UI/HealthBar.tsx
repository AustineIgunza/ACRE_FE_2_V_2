"use client";

interface HealthBarProps {
  percentage: number;
  color?: "blue" | "red" | "green";
}

export default function HealthBar({
  percentage,
  color = "blue",
}: HealthBarProps) {
  const colorClasses = {
    blue: "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/50",
    red: "bg-gradient-to-r from-red-500 to-orange-500 shadow-red-500/50",
    green: "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/50",
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-700 rounded-full p-1 shadow-lg">
      <div
        className={`h-8 rounded-full transition-all duration-300 ${
          colorClasses[color]
        } shadow-lg flex items-center justify-center overflow-hidden`}
        style={{ width: `${Math.max(5, percentage)}%` }}
      >
        <span className="text-xs font-bold text-white drop-shadow">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
