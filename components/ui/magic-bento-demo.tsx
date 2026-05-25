import React, { useState } from "react"
import MagicBento from "./MagicBento"

export default function MagicBentoDemo() {
  const [enableStars, setEnableStars] = useState(true)
  const [enableSpotlight, setEnableSpotlight] = useState(true)
  const [enableBorderGlow, setEnableBorderGlow] = useState(true)
  const [enableTilt, setEnableTilt] = useState(true)
  const [enableMagnetism, setEnableMagnetism] = useState(true)
  const [textAutoHide, setTextAutoHide] = useState(true)
  const [spotlightRadius, setSpotlightRadius] = useState(300)
  const [glowColor, setGlowColor] = useState("132, 0, 255")

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0f19", color: "#f8fafc", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto 3rem auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", background: "linear-gradient(135deg, #a855f7, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          MagicBento Playground
        </h1>
        <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto" }}>
          Hover and interact with the glassmorphic cards below. Tweak the control panel configuration to observe changes in animations, glow filters, particles, and spotlights!
        </p>

        {/* Dynamic Controls Dashboard */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          background: "rgba(15, 23, 42, 0.4)",
          border: "1px solid rgba(255,255,255,0.05)",
          padding: "1.5rem",
          borderRadius: "16px",
          marginTop: "2rem",
          textAlign: "left",
        }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
              <input type="checkbox" checked={enableStars} onChange={(e) => setEnableStars(e.target.checked)} />
              Enable Star Particles
            </label>
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
              <input type="checkbox" checked={enableSpotlight} onChange={(e) => setEnableSpotlight(e.target.checked)} />
              Enable Spotlight Proximity
            </label>
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
              <input type="checkbox" checked={enableBorderGlow} onChange={(e) => setEnableBorderGlow(e.target.checked)} />
              Enable Border Glow Masks
            </label>
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
              <input type="checkbox" checked={enableTilt} onChange={(e) => setEnableTilt(e.target.checked)} />
              Enable 3D Card Hover Tilt
            </label>
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
              <input type="checkbox" checked={enableMagnetism} onChange={(e) => setEnableMagnetism(e.target.checked)} />
              Enable Content Magnetism
            </label>
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
              <input type="checkbox" checked={textAutoHide} onChange={(e) => setTextAutoHide(e.target.checked)} />
              Text Auto-Hide on Hover
            </label>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Spotlight Radius: {spotlightRadius}px</span>
            <input type="range" min="150" max="600" step="10" value={spotlightRadius} onChange={(e) => setSpotlightRadius(Number(e.target.value))} style={{ cursor: "pointer" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Glow Hex Colors (RGB):</span>
            <select value={glowColor} onChange={(e) => setGlowColor(e.target.value)} style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "white", padding: "0.2rem", cursor: "pointer" }}>
              <option value="132, 0, 255">Purple (132, 0, 255)</option>
              <option value="99, 102, 241">Indigo (99, 102, 241)</option>
              <option value="228, 121, 17">Orange (228, 121, 17)</option>
              <option value="16, 185, 129">Green (16, 185, 129)</option>
              <option value="228, 0, 70">Pink-Red (228, 0, 70)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Renders the MagicBento Grid */}
      <MagicBento
        enableStars={enableStars}
        enableSpotlight={enableSpotlight}
        enableBorderGlow={enableBorderGlow}
        enableTilt={enableTilt}
        enableMagnetism={enableMagnetism}
        textAutoHide={textAutoHide}
        spotlightRadius={spotlightRadius}
        glowColor={glowColor}
      />
    </div>
  )
}
