"use client";

import { useState } from "react";

export default function DemoPage() {
  const [showDefense, setShowDefense] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-blue-white text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/95 border-b-1.5 border-blue-200 z-50 shadow-xs backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            ARCÉ
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600">Design System</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Heading */}
        <section className="mb-20 sm:mb-24 lg:mb-32 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight">
            Design System
          </h2>
          <p className="text-base sm:text-lg lg:text-xl font-medium text-slate-600 leading-relaxed">
            Premium, minimalist design inspired by Apple. Modern blue, white, and slate palette with refined typography and smooth interactions.
          </p>
        </section>

        {/* Colors */}
        <section className="mb-20 sm:mb-24 lg:mb-32">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 sm:mb-12 lg:mb-16 text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Color Palette</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col text-center group cursor-pointer">
              <div className="w-full h-32 sm:h-40 bg-blue-600 rounded-2xl shadow-sm mb-4 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:rounded-3xl"></div>
              <p className="font-bold text-slate-900">Primary Blue</p>
              <p className="text-sm text-slate-500 font-medium">#2563eb</p>
            </div>
            <div className="flex flex-col text-center group cursor-pointer">
              <div className="w-full h-32 sm:h-40 bg-blue-100 rounded-2xl shadow-sm mb-4 border-1.5 border-blue-200 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:rounded-3xl"></div>
              <p className="font-bold text-slate-900">Light Blue</p>
              <p className="text-sm text-slate-500 font-medium">#e3f2fd</p>
            </div>
            <div className="flex flex-col text-center group cursor-pointer">
              <div className="w-full h-32 sm:h-40 bg-slate-400 rounded-2xl shadow-sm mb-4 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:rounded-3xl"></div>
              <p className="font-bold text-slate-900">Slate</p>
              <p className="text-sm text-slate-500 font-medium">#94a3b8</p>
            </div>
            <div className="flex flex-col text-center group cursor-pointer">
              <div className="w-full h-32 sm:h-40 bg-slate-900 rounded-2xl shadow-sm mb-4 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:rounded-3xl"></div>
              <p className="font-bold text-slate-900">Dark Slate</p>
              <p className="text-sm text-slate-500 font-medium">#0f172a</p>
            </div>
            <div className="flex flex-col text-center group cursor-pointer">
              <div className="w-full h-32 sm:h-40 bg-red-500 rounded-2xl shadow-sm mb-4 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:rounded-3xl"></div>
              <p className="font-bold text-slate-900">Frost</p>
              <p className="text-sm text-slate-500 font-medium">#ef4444</p>
            </div>
            <div className="flex flex-col text-center group cursor-pointer">
              <div className="w-full h-32 sm:h-40 bg-orange-500 rounded-2xl shadow-sm mb-4 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:rounded-3xl"></div>
              <p className="font-bold text-slate-900">Warning</p>
              <p className="text-sm text-slate-500 font-medium">#f97316</p>
            </div>
            <div className="flex flex-col text-center group cursor-pointer">
              <div className="w-full h-32 sm:h-40 bg-emerald-500 rounded-2xl shadow-sm mb-4 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:rounded-3xl"></div>
              <p className="font-bold text-slate-900">Ignition</p>
              <p className="text-sm text-slate-500 font-medium">#10b981</p>
            </div>
            <div className="flex flex-col text-center group cursor-pointer">
              <div className="w-full h-32 sm:h-40 rounded-2xl shadow-sm mb-4 bg-gradient-to-br from-blue-600 to-blue-400 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:rounded-3xl"></div>
              <p className="font-bold text-slate-900">Gradient</p>
              <p className="text-sm text-slate-500 font-medium">Primary</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-20 sm:mb-24 lg:mb-32">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 sm:mb-12 lg:mb-16 text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Buttons</h3>
          <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
            {/* Primary Button */}
            <div className="text-center">
              <p className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Primary Button</p>
              <button className="button-primary hover:shadow-lg active:scale-95 transition-all">
                Begin Crisis Scenario
              </button>
            </div>

            {/* Secondary Button */}
            <div className="text-center">
              <p className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Secondary Button</p>
              <button className="button-secondary hover:shadow-lg active:scale-95 transition-all">
                View Results
              </button>
            </div>

            {/* Outline Button */}
            <div className="text-center">
              <p className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Outline Button</p>
              <button className="button-outline hover:shadow-lg active:scale-95 transition-all">
                Start New Session
              </button>
            </div>

            {/* Disabled Button */}
            <div className="text-center">
              <p className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Disabled State</p>
              <button className="button-primary" disabled>
                Loading...
              </button>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="mb-20 sm:mb-24 lg:mb-32">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 sm:mb-12 lg:mb-16 text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Action Buttons (Touch-Friendly)</h3>
          <div className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
            {["Option A", "Option B", "Option C"].map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAction(option)}
                className={`action-button ${selectedAction === option ? "selected" : ""}`}
              >
                <span className="action-button-index">{String.fromCharCode(65 + idx)}</span>
                <span className="action-button-label flex-1 text-left">{option}</span>
                <span className="text-sm text-slate-500 hidden sm:inline">Click to select</span>
              </button>
            ))}
          </div>
        </section>

        {/* Cards */}
        <section className="mb-20 sm:mb-24 lg:mb-32">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 sm:mb-12 lg:mb-16 text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Card Components</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card group hover:scale-105 transition-transform duration-300">
                <div className="card-header">
                  <h4 className="card-title">Learning Node {i}</h4>
                  <p className="card-subtitle">Mastery Level: Intermediate</p>
                </div>
                <div className="card-body">
                  <p className="text-slate-600">
                    This is a learning node that demonstrates card hover effects and smooth transitions.
                  </p>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${i * 30 + 10}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-20 sm:mb-24 lg:mb-32">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 sm:mb-12 lg:mb-16 text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Statistics Display</h3>
          <div className="stats-grid max-w-5xl mx-auto">
            <div className="stat-card">
              <div className="stat-label">Final Heat</div>
              <div className="stat-value">72</div>
              <div className="stat-unit">percent</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Integrity</div>
              <div className="stat-value">85</div>
              <div className="stat-unit">percent</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Responses</div>
              <div className="stat-value">8</div>
              <div className="stat-unit">total</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Mastery Cards</div>
              <div className="stat-value">5</div>
              <div className="stat-unit">unlocked</div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-20 sm:mb-24 lg:mb-32">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 sm:mb-12 lg:mb-16 text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Form Elements</h3>
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <div className="text-center">
              <label className="block text-sm sm:text-base font-bold text-blue-900 mb-3">Text Input</label>
              <input
                type="text"
                placeholder="Enter your text here..."
                className="w-full"
              />
            </div>
            <div className="text-center">
              <label className="block text-sm sm:text-base font-bold text-blue-900 mb-3">Textarea</label>
              <textarea
                placeholder="Enter your defense here... The app will analyze your response and provide thermal feedback based on the depth of your analysis."
                className="defense-textarea"
              />
            </div>
          </div>
        </section>

        {/* Thermal States */}
        <section className="mb-20 sm:mb-24 lg:mb-32">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 sm:mb-12 lg:mb-16 text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Thermal States</h3>
          <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
            <div className="feedback-container feedback-frost hover:shadow-lg transition-all duration-300">
              [FROST] Your logic is shallow. This exposes a critical gap in your reasoning about causality.
            </div>
            <div className="feedback-container feedback-warning hover:shadow-lg transition-all duration-300">
              [WARNING] You are on the right track, but your defense is incomplete. Consider other perspectives.
            </div>
            <div className="feedback-container feedback-ignition hover:shadow-lg transition-all duration-300">
              [IGNITION] Deep causality detected! You have grasped the leverage point in this system.
            </div>
          </div>
        </section>

        {/* Animations Demo */}
        <section className="mb-20 sm:mb-24 lg:mb-32">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 sm:mb-12 lg:mb-16 text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Animations</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center justify-center h-32 bg-blue-50 rounded-2xl border-1.5 border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div className="spinner mb-4"></div>
              <p className="text-sm font-bold text-slate-600">Loading</p>
            </div>
            <div className="flex flex-col items-center justify-center h-32 bg-slate-50 rounded-2xl border-1.5 border-slate-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg"
                style={{
                  animation: "bounce-light 1.5s infinite"
                }}
              ></div>
              <p className="text-sm font-bold text-slate-600 mt-4">Bounce</p>
            </div>
            <div className="flex flex-col items-center justify-center h-32 bg-emerald-50 rounded-2xl border-1.5 border-emerald-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div
                className="text-4xl"
                style={{
                  animation: "pulse 1.5s infinite"
                }}
              >
                ✓
              </div>
              <p className="text-sm font-bold text-slate-600 mt-4">Success</p>
            </div>
          </div>
        </section>

        {/* Defense Textbox Preview */}
        <section className="mb-20 sm:mb-24 lg:mb-32">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 sm:mb-12 lg:mb-16 text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Defense Textbox (Slide-Up)</h3>
          <div className="text-center max-w-2xl mx-auto">
            <button
              onClick={() => setShowDefense(!showDefense)}
              className="button-primary mb-8 hover:shadow-lg active:scale-95 transition-all"
            >
              {showDefense ? "Hide Defense Box" : "Show Defense Box"}
            </button>
          </div>
          {showDefense && (
            <div className="defense-container">
              <label className="defense-label">Type Your Defense</label>
              <textarea
                className="defense-textarea"
                placeholder="Explain your choice and reasoning... Min 20 characters required."
              />
              <button className="button-primary w-full">
                Submit Defense
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <section className="border-t-1.5 border-blue-200 pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-16">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-10 lg:mb-12 text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">MVC Architecture</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            <div className="card group hover:scale-105 transition-transform duration-300">
              <div className="card-header">
                <h4 className="card-title text-center">Model Layer</h4>
              </div>
              <div className="card-body text-center">
                <p className="text-sm text-slate-600">
                  <strong>GameModel.ts</strong> handles business logic, validation, and thermal state calculations.
                </p>
              </div>
            </div>
            <div className="card group hover:scale-105 transition-transform duration-300">
              <div className="card-header">
                <h4 className="card-title text-center">Controller Layer</h4>
              </div>
              <div className="card-body text-center">
                <p className="text-sm text-slate-600">
                  <strong>GameController.ts</strong> orchestrates user interactions and routes actions to the model.
                </p>
              </div>
            </div>
            <div className="card group hover:scale-105 transition-transform duration-300">
              <div className="card-header">
                <h4 className="card-title text-center">View Layer</h4>
              </div>
              <div className="card-body text-center">
                <p className="text-sm text-slate-600">
                  <strong>React Components</strong> display state from Zustand store with interactive UI.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
