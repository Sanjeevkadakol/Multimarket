import React, { useState } from 'react';
import PixelBlast from './PixelBlast';
import { Card } from './card';

export default function PixelBlastDemo() {
  const [variant, setVariant] = useState<'square' | 'circle' | 'triangle' | 'diamond'>('circle');
  const [pixelSize, setPixelSize] = useState(6);
  const [color, setColor] = useState('#6366f1');
  const [patternScale, setPatternScale] = useState(3);
  const [patternDensity, setPatternDensity] = useState(1.2);
  const [pixelSizeJitter, setPixelSizeJitter] = useState(0.5);
  const [enableRipples, setEnableRipples] = useState(true);
  const [rippleSpeed, setRippleSpeed] = useState(0.4);
  const [rippleThickness, setRippleThickness] = useState(0.12);
  const [rippleIntensity, setRippleIntensity] = useState(1.5);
  const [liquid, setLiquid] = useState(true);
  const [liquidStrength, setLiquidStrength] = useState(0.12);
  const [liquidRadius, setLiquidRadius] = useState(1.2);
  const [liquidWobbleSpeed, setLiquidWobbleSpeed] = useState(5);
  const [speed, setSpeed] = useState(0.6);
  const [edgeFade, setEdgeFade] = useState(0.25);
  const [noiseAmount, setNoiseAmount] = useState(0.02);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-8 max-w-7xl mx-auto min-h-screen text-slate-100 bg-slate-950 font-sans">
      {/* Dynamic WebGL Canvas Container */}
      <div className="flex-1 min-h-[450px] lg:min-h-auto relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/40 backdrop-blur-md">
        <PixelBlast
          variant={variant}
          pixelSize={pixelSize}
          color={color}
          patternScale={patternScale}
          patternDensity={patternDensity}
          pixelSizeJitter={pixelSizeJitter}
          enableRipples={enableRipples}
          rippleSpeed={rippleSpeed}
          rippleThickness={rippleThickness}
          rippleIntensityScale={rippleIntensity}
          liquid={liquid}
          liquidStrength={liquidStrength}
          liquidRadius={liquidRadius}
          liquidWobbleSpeed={liquidWobbleSpeed}
          speed={speed}
          edgeFade={edgeFade}
          noiseAmount={noiseAmount}
          transparent={true}
        />
        {/* Title Overlay */}
        <div className="absolute top-6 left-6 pointer-events-none z-10 bg-slate-950/70 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
          <h2 className="text-xl font-bold tracking-tight text-white">WebGL PixelBlast Canvas</h2>
          <p className="text-xs text-indigo-400 font-semibold mt-1">Interactive Bayer Dithering & Liquid Shader</p>
          <div className="text-[10px] text-slate-400 mt-2 flex gap-2 items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Click or drag across canvas for live ripples & wobbles
          </div>
        </div>
      </div>

      {/* Premium Controls Panel */}
      <Card className="w-full lg:w-[420px] p-6 bg-slate-900/60 border-slate-800 text-slate-100 flex flex-col gap-6 backdrop-blur-md shadow-2xl rounded-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            PixelBlast Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fine-tune and customize shader-dither parameters live
          </p>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Variant Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300">Pixel Variant</label>
            <div className="grid grid-cols-4 gap-2">
              {(['square', 'circle', 'triangle', 'diamond'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                    variant === v
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>Particle Color</span>
              <span className="text-[10px] font-mono text-indigo-400">{color}</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
              />
              <div className="flex flex-wrap gap-2">
                {['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full border border-slate-700/60 shadow-inner"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-800 my-2" />

          {/* Shader & Dither Parameters */}
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Shader Primitives</h3>

          {/* Pixel Size */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Pixel size</span>
              <span className="font-mono text-slate-400">{pixelSize}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              value={pixelSize}
              onChange={(e) => setPixelSize(Number(e.target.value))}
              className="accent-indigo-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer"
            />
          </div>

          {/* Pattern Scale */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Noise Pattern Scale</span>
              <span className="font-mono text-slate-400">{patternScale.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.1"
              value={patternScale}
              onChange={(e) => setPatternScale(Number(e.target.value))}
              className="accent-indigo-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer"
            />
          </div>

          {/* Speed */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Animation Speed</span>
              <span className="font-mono text-slate-400">{speed.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="accent-indigo-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer"
            />
          </div>

          <div className="h-px bg-slate-800 my-2" />

          {/* Ripples Parameter */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Enable Click Ripples</label>
            <input
              type="checkbox"
              checked={enableRipples}
              onChange={(e) => setEnableRipples(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>

          {enableRipples && (
            <div className="flex flex-col gap-3 pl-3 border-l border-slate-850">
              {/* Ripple Speed */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Ripple Wave Speed</span>
                  <span className="font-mono text-slate-400">{rippleSpeed.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={rippleSpeed}
                  onChange={(e) => setRippleSpeed(Number(e.target.value))}
                  className="accent-indigo-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer"
                />
              </div>

              {/* Ripple Intensity */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Ripple Intensity</span>
                  <span className="font-mono text-slate-400">{rippleIntensity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4"
                  step="0.1"
                  value={rippleIntensity}
                  onChange={(e) => setRippleIntensity(Number(e.target.value))}
                  className="accent-indigo-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="h-px bg-slate-800 my-2" />

          {/* Liquid Parameters */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Enable Liquid Wobble</label>
            <input
              type="checkbox"
              checked={liquid}
              onChange={(e) => setLiquid(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>

          {liquid && (
            <div className="flex flex-col gap-3 pl-3 border-l border-slate-850">
              {/* Liquid Strength */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Distortion Strength</span>
                  <span className="font-mono text-slate-400">{liquidStrength.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={liquidStrength}
                  onChange={(e) => setLiquidStrength(Number(e.target.value))}
                  className="accent-indigo-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer"
                />
              </div>

              {/* Liquid Radius */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Touch Radius</span>
                  <span className="font-mono text-slate-400">{liquidRadius.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.1"
                  value={liquidRadius}
                  onChange={(e) => setLiquidRadius(Number(e.target.value))}
                  className="accent-indigo-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
