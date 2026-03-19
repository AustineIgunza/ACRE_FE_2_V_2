"use client";

import { useState } from "react";

export default function DemoPage() {
  const [showDefense, setShowDefense] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white border-b-2 border-blue-200 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            ARCÉ Component Demo
          </h1>
          <p className="text-sm text-gray-600">MVC Architecture Showcase</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Heading */}
        <section className="mb-16">
          <h2 className="text-4xl font-black mb-4">Design System</h2>
          <p className="text-xl text-gray-600">
            Modern light blue, grey, black and white palette with smooth hover effects
          </p>
        </section>

        {/* Colors */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8">Color Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <div className="w-full h-32 bg-blue-600 rounded-lg shadow-md mb-4"></div>
              <p className="font-bold">Primary Blue</p>
              <p className="text-sm text-gray-600">#0066cc</p>
            </div>
            <div className="flex flex-col">
              <div className="w-full h-32 bg-blue-100 rounded-lg shadow-md mb-4 border-2 border-blue-200"></div>
              <p className="font-bold">Light Blue</p>
              <p className="text-sm text-gray-600">#e6f0ff</p>
            </div>
            <div className="flex flex-col">
              <div className="w-full h-32 bg-gray-400 rounded-lg shadow-md mb-4"></div>
              <p className="font-bold">Grey</p>
              <p className="text-sm text-gray-600">#718096</p>
            </div>
            <div className="flex flex-col">
              <div className="w-full h-32 bg-black rounded-lg shadow-md mb-4"></div>
              <p className="font-bold text-white">Black</p>
              <p className="text-sm text-gray-600">#1a1a1a</p>
            </div>
            <div className="flex flex-col">
              <div className="w-full h-32 bg-red-500 rounded-lg shadow-md mb-4"></div>
              <p className="font-bold">Frost</p>
              <p className="text-sm text-gray-600">#ef4444</p>
            </div>
            <div className="flex flex-col">
              <div className="w-full h-32 bg-orange-500 rounded-lg shadow-md mb-4"></div>
              <p className="font-bold">Warning</p>
              <p className="text-sm text-gray-600">#f97316</p>
            </div>
            <div className="flex flex-col">
              <div className="w-full h-32 bg-green-500 rounded-lg shadow-md mb-4"></div>
              <p className="font-bold">Ignition</p>
              <p className="text-sm text-gray-600">#10b981</p>
            </div>
            <div className="flex flex-col">
              <div className="w-full h-32 rounded-lg shadow-md mb-4 bg-gradient-to-br from-blue-600 to-blue-400"></div>
              <p className="font-bold">Gradient</p>
              <p className="text-sm text-gray-600">Primary</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8">Buttons</h3>
          <div className="space-y-8">
            {/* Primary Button */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-4 uppercase">Primary Button</p>
              <button className="button-primary">
                Begin Crisis Scenario
              </button>
            </div>

            {/* Secondary Button */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-4 uppercase">Secondary Button</p>
              <button className="button-secondary">
                View Results
              </button>
            </div>

            {/* Outline Button */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-4 uppercase">Outline Button</p>
              <button className="button-outline">
                Start New Session
              </button>
            </div>

            {/* Disabled Button */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-4 uppercase">Disabled State</p>
              <button className="button-primary" disabled>
                Loading...
              </button>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8">Action Buttons (Touch-Friendly)</h3>
          <div className="space-y-3 max-w-2xl">
            {["Option A", "Option B", "Option C"].map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAction(option)}
                className={`action-button ${selectedAction === option ? "selected" : ""}`}
              >
                <span className="action-button-index">{String.fromCharCode(65 + idx)}</span>
                <span className="action-button-label flex-1 text-left">{option}</span>
                <span className="text-sm text-gray-500">Click to select</span>
              </button>
            ))}
          </div>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8">Card Components</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="card-header">
                  <h4 className="card-title">Learning Node {i}</h4>
                  <p className="card-subtitle">Mastery Level: Intermediate</p>
                </div>
                <div className="card-body">
                  <p className="text-gray-600">
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
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8">Statistics Display</h3>
          <div className="stats-grid">
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
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8">Form Elements</h3>
          <div className="max-w-2xl space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Text Input</label>
              <input
                type="text"
                placeholder="Enter your text here..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Textarea</label>
              <textarea
                placeholder="Enter your defense here... The app will analyze your response and provide thermal feedback based on the depth of your analysis."
                className="defense-textarea"
              />
            </div>
          </div>
        </section>

        {/* Thermal States */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8">Thermal States</h3>
          <div className="space-y-4 max-w-2xl">
            <div className="feedback-container feedback-frost">
              [FROST] Your logic is shallow. This exposes a critical gap in your reasoning about causality.
            </div>
            <div className="feedback-container feedback-warning">
              [WARNING] You are on the right track, but your defense is incomplete. Consider other perspectives.
            </div>
            <div className="feedback-container feedback-ignition">
              [IGNITION] Deep causality detected! You have grasped the leverage point in this system.
            </div>
          </div>
        </section>

        {/* Animations Demo */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8">Animations</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center h-32 bg-blue-100 rounded-lg border-2 border-blue-300">
              <div className="spinner mb-4"></div>
              <p className="text-sm font-bold text-gray-600">Loading</p>
            </div>
            <div className="flex flex-col items-center justify-center h-32 bg-gray-100 rounded-lg border-2 border-gray-300">
              <div
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg"
                style={{
                  animation: "bounce-light 1.5s infinite"
                }}
              ></div>
              <p className="text-sm font-bold text-gray-600 mt-4">Bounce</p>
            </div>
            <div className="flex flex-col items-center justify-center h-32 bg-green-100 rounded-lg border-2 border-green-300">
              <div
                className="text-4xl"
                style={{
                  animation: "pulse 1.5s infinite"
                }}
              >
                ✓
              </div>
              <p className="text-sm font-bold text-gray-600 mt-4">Success</p>
            </div>
          </div>
        </section>

        {/* Defense Textbox Preview */}
        <section className="mb-32">
          <h3 className="text-2xl font-bold mb-8">Defense Textbox (Slide-Up)</h3>
          <button
            onClick={() => setShowDefense(!showDefense)}
            className="button-primary mb-8"
          >
            {showDefense ? "Hide Defense Box" : "Show Defense Box"}
          </button>
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
        <section className="border-t-2 border-blue-200 pt-12 mb-8">
          <h3 className="text-2xl font-bold mb-4">MVC Architecture</h3>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Model Layer</h4>
              </div>
              <div className="card-body">
                <p className="text-sm text-gray-600">
                  <strong>GameModel.ts</strong> handles business logic, validation, and thermal state calculations.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Controller Layer</h4>
              </div>
              <div className="card-body">
                <p className="text-sm text-gray-600">
                  <strong>GameController.ts</strong> orchestrates user interactions and routes actions to the model.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">View Layer</h4>
              </div>
              <div className="card-body">
                <p className="text-sm text-gray-600">
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
