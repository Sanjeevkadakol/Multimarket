import React, { useState } from 'react';
import Stepper, { Step } from './Stepper';
import { Card } from './card';

export default function StepperDemo() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('developer');
  const [completed, setCompleted] = useState(false);

  const handleFinalStepCompleted = () => {
    setCompleted(true);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setRole('developer');
    setCompleted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400">
            Interactive Stepper Studio
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Build and preview multi-stage flow experiences
          </p>
        </div>

        {completed ? (
          <Card className="p-8 bg-slate-900 border-slate-800 text-center flex flex-col items-center gap-4 rounded-3xl shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl animate-bounce">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-white">All Steps Completed!</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Nice work! You have successfully walked through the stepper wizard.
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 w-full text-left font-mono text-xs text-indigo-300">
              <div>Name: {name || 'N/A'}</div>
              <div>Email: {email || 'N/A'}</div>
              <div>Role: {role}</div>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              Restart Onboarding
            </button>
          </Card>
        ) : (
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden p-6">
            <Stepper
              initialStep={1}
              onFinalStepCompleted={handleFinalStepCompleted}
              stepCircleContainerClassName="border-slate-800 bg-slate-950/40 p-4 rounded-2xl"
              contentClassName="mt-6 min-h-[220px]"
              footerClassName="mt-6"
            >
              <Step>
                <div className="flex flex-col gap-3">
                  <h2 className="text-xl font-bold text-white">Welcome to Multimarket Tour!</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    This wizard will show you how to compare prices, save items, and analyze marketplace redirection counts concurrently.
                  </p>
                  <div className="mt-4 p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl flex gap-3 items-center">
                    <span className="text-xl">🚀</span>
                    <span className="text-xs text-slate-400">Press Continue to check out the next onboarding steps.</span>
                  </div>
                </div>
              </Step>
              
              <Step>
                <div className="flex flex-col gap-3">
                  <h2 className="text-xl font-bold text-white">Compare & Find Deals</h2>
                  <img
                    style={{
                      height: '110px',
                      width: '100%',
                      objectFit: 'cover',
                      borderRadius: '15px',
                      marginTop: '0.5em',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80"
                    alt="E-commerce graph"
                  />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Direct SQLite relational links match product keywords instantly across Amazon, Walmart, Flipkart, and Snapdeal.
                  </p>
                </div>
              </Step>
              
              <Step>
                <div className="flex flex-col gap-3">
                  <h2 className="text-xl font-bold text-white">Let's Get to Know You</h2>
                  <p className="text-xs text-slate-400 mb-1">We'll customize your price comparison portal.</p>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name?"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-600 transition-colors"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your Email?"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-600 transition-colors"
                    />
                  </div>
                </div>
              </Step>
              
              <Step>
                <div className="flex flex-col gap-3">
                  <h2 className="text-xl font-bold text-white">Final Step</h2>
                  <p className="text-sm text-slate-400">
                    You're all set! Press Complete to see your dashboard profile summaries.
                  </p>
                  <div className="flex gap-4 mt-2">
                    {['developer', 'shopper', 'admin'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg border transition-all ${
                          role === r
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </Step>
            </Stepper>
          </Card>
        )}
      </div>
    </div>
  );
}
