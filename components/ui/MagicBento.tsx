import React, { useRef, useEffect, useState, ReactNode } from "react"
import { gsap } from "gsap"
import "./MagicBento.css"

export interface MagicBentoItemProps {
  id?: string
  title: string
  subtitle: string
  spanClass?: string
  icon?: ReactNode
  glowColor?: string
  children?: ReactNode
}

export interface MagicBentoProps {
  textAutoHide?: boolean
  enableStars?: boolean
  enableSpotlight?: boolean
  enableBorderGlow?: boolean
  enableTilt?: boolean
  enableMagnetism?: boolean
  clickEffect?: boolean
  spotlightRadius?: number
  particleCount?: number
  glowColor?: string
  disableAnimations?: boolean
  items?: MagicBentoItemProps[]
  children?: ReactNode
}

export default function MagicBento({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = "132, 0, 255",
  disableAnimations = false,
  items,
  children,
}: MagicBentoProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Spotlight mouse track
  useEffect(() => {
    if (disableAnimations || !enableSpotlight) return

    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll(".magic-bento-card")
      cards.forEach((card: any) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Update CSS variables for spotlights
        card.style.setProperty("--glow-x", `${x}px`)
        card.style.setProperty("--glow-y", `${y}px`)
        card.style.setProperty("--spotlight-radius", `${spotlightRadius}px`)
        card.style.setProperty("--glow-color", glowColor)
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [disableAnimations, enableSpotlight, spotlightRadius, glowColor])

  // Default features grid if no children or items are passed
  const defaultItems: MagicBentoItemProps[] = [
    {
      id: "analytics",
      title: "Real-Time Insights",
      subtitle: "Track & analyze marketplace redirection clicks",
      spanClass: "md:col-span-2 md:row-span-1",
      glowColor: "228, 121, 17", // Amazon Orange
      children: (
        <div className="bento-analytics-preview">
          <div className="bento-preview-bar-row">
            <span className="bento-bar-label">AMZ</span>
            <div className="bento-bar-wrapper"><div className="bento-bar-fill amz-fill" style={{ width: "70%" }} /></div>
            <span className="bento-bar-val">70%</span>
          </div>
          <div className="bento-preview-bar-row">
            <span className="bento-bar-label">WMT</span>
            <div className="bento-bar-wrapper"><div className="bento-bar-fill wmt-fill" style={{ width: "45%" }} /></div>
            <span className="bento-bar-val">45%</span>
          </div>
          <div className="bento-preview-bar-row">
            <span className="bento-bar-label">FK</span>
            <div className="bento-bar-wrapper"><div className="bento-bar-fill fk-fill" style={{ width: "90%" }} /></div>
            <span className="bento-bar-val">90%</span>
          </div>
        </div>
      ),
    },
    {
      id: "quad-grid",
      title: "Quad-Grid Comparator",
      subtitle: "Side-by-side deal analysis across 4 marketplaces",
      spanClass: "md:col-span-1 md:row-span-2",
      glowColor: "0, 113, 220", // Walmart Blue
      children: (
        <div className="bento-quad-grid-preview">
          <div className="quad-logo-box amazon">A</div>
          <div className="quad-logo-box walmart">W</div>
          <div className="quad-logo-box flipkart">F</div>
          <div className="quad-logo-box snapdeal">S</div>
        </div>
      ),
    },
    {
      id: "wishlist",
      title: "Persisted Wishlist",
      subtitle: "Bookmark electronics with SQLite persistence",
      spanClass: "md:col-span-1 md:row-span-1",
      glowColor: "228, 0, 70", // Snapdeal Pink
      children: (
        <div className="bento-wishlist-preview">
          <span className="bento-heart animate-pulse">❤️</span>
          <span className="bento-wishlist-count">14 Products</span>
        </div>
      ),
    },
    {
      id: "aggregator",
      title: "Concurrent Aggregator",
      subtitle: "Multi-market scraper executes in milliseconds",
      spanClass: "md:col-span-2 md:row-span-1",
      glowColor: "99, 102, 241", // Multimarket Indigo
      children: (
        <div className="bento-aggregator-preview">
          <div className="bento-gauge">
            <div className="bento-gauge-ring" />
            <div className="bento-gauge-value">340ms</div>
          </div>
          <p className="bento-subtext">Direct API Tunnel Channels Active</p>
        </div>
      ),
    },
    {
      id: "theme",
      title: "Glassmorphic Theme",
      subtitle: "Harmonious dark neon-glow user interface",
      spanClass: "md:col-span-1 md:row-span-1",
      glowColor: "168, 85, 247", // Purple
      children: (
        <div className="bento-theme-preview">
          <div className="neon-circle-glow" />
        </div>
      ),
    },
    {
      id: "auth",
      title: "Secure Relational Auth",
      subtitle: "Seeded credentials access protection database",
      spanClass: "md:col-span-1 md:row-span-1",
      glowColor: "16, 185, 129", // Emerald Green
      children: (
        <div className="bento-auth-preview">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="bento-shield-icon">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="bento-status-badge">ADMIN ACTIVE</span>
        </div>
      ),
    },
  ]

  const itemsToRender = items || (children ? null : defaultItems)

  return (
    <div className="magic-bento-container" ref={containerRef}>
      <div className="magic-bento-grid">
        {children
          ? children
          : itemsToRender?.map((item, index) => (
              <MagicBentoCard
                key={item.id || index}
                title={item.title}
                subtitle={item.subtitle}
                spanClass={item.spanClass}
                icon={item.icon}
                customGlow={item.glowColor || glowColor}
                textAutoHide={textAutoHide}
                enableStars={enableStars}
                enableBorderGlow={enableBorderGlow}
                enableTilt={enableTilt}
                enableMagnetism={enableMagnetism}
                clickEffect={clickEffect}
                disableAnimations={disableAnimations}
                particleCount={particleCount}
              >
                {item.children}
              </MagicBentoCard>
            ))}
      </div>
    </div>
  )
}

interface MagicBentoCardProps {
  title: string
  subtitle: string
  spanClass?: string
  icon?: ReactNode
  customGlow?: string
  textAutoHide?: boolean
  enableStars?: boolean
  enableBorderGlow?: boolean
  enableTilt?: boolean
  enableMagnetism?: boolean
  clickEffect?: boolean
  disableAnimations?: boolean
  particleCount?: number
  children?: ReactNode
}

function MagicBentoCard({
  title,
  subtitle,
  spanClass = "",
  icon,
  customGlow = "132, 0, 255",
  textAutoHide = true,
  enableStars = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  disableAnimations = false,
  particleCount = 12,
  children,
}: MagicBentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const starTimerRef = useRef<any>(null)

  // Star spawning function
  const spawnStar = () => {
    const card = cardRef.current
    if (!card) return

    const star = document.createElement("div")
    star.className = "magic-bento-star"
    
    // Random placement along bottom portion of card
    const x = Math.random() * 80 + 10
    const y = Math.random() * 30 + 60
    star.style.left = `${x}%`
    star.style.top = `${y}%`
    
    // Custom neon glow theme
    star.style.background = `rgba(${customGlow}, 0.8)`
    star.style.boxShadow = `0 0 10px rgba(${customGlow}, 0.9)`
    
    card.appendChild(star)

    // GSAP drift upwards and fade out
    gsap.fromTo(
      star,
      { y: 0, scale: 0, opacity: 0, rotation: 0 },
      {
        y: -120 - Math.random() * 80,
        scale: Math.random() * 1.5 + 0.5,
        opacity: 0.8,
        rotation: Math.random() * 360,
        duration: 1.5 + Math.random() * 1.5,
        ease: "power1.out",
        onComplete: () => {
          gsap.to(star, {
            opacity: 0,
            duration: 0.4,
            onComplete: () => star.remove(),
          })
        },
      }
    )
  }

  const handleMouseEnter = () => {
    if (disableAnimations) return
    
    // Star particles interval
    if (enableStars) {
      if (starTimerRef.current) clearInterval(starTimerRef.current)
      starTimerRef.current = setInterval(spawnStar, 200)
    }

    // Glow intensity
    const card = cardRef.current
    if (card) {
      card.style.setProperty("--glow-intensity", "1")
    }
  }

  const handleMouseLeave = () => {
    if (starTimerRef.current) {
      clearInterval(starTimerRef.current)
      starTimerRef.current = null
    }

    const card = cardRef.current
    const inner = innerRef.current

    if (card) {
      card.style.setProperty("--glow-intensity", "0")
    }

    // Reset 3D Tilt / Magnetism smoothly
    if (!disableAnimations) {
      if (card) {
        gsap.to(card, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          duration: 0.5,
          ease: "power2.out",
        })
      }
      if (inner) {
        gsap.to(inner, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disableAnimations) return

    const card = cardRef.current
    const inner = innerRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Center offset ratios
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateY = ((x - centerX) / centerX) * 8 // Rotates around Y-axis based on horizontal cursor shift
    const rotateX = -((y - centerY) / centerY) * 8 // Rotates around X-axis based on vertical cursor shift

    if (enableTilt) {
      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 800,
        duration: 0.2,
        ease: "power1.out",
      })
    }

    if (enableMagnetism && inner) {
      const magnetX = ((x - centerX) / centerX) * 12
      const magnetY = ((y - centerY) / centerY) * 12
      gsap.to(inner, {
        x: magnetX,
        y: magnetY,
        duration: 0.2,
        ease: "power1.out",
      })
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!clickEffect || disableAnimations) return

    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Create click ripple element
    const ripple = document.createElement("div")
    ripple.className = "magic-bento-ripple"
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.background = `radial-gradient(circle, rgba(${customGlow}, 0.4) 0%, rgba(${customGlow}, 0) 70%)`
    card.appendChild(ripple)

    gsap.fromTo(
      ripple,
      { scale: 0, opacity: 1 },
      {
        scale: 4,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => ripple.remove(),
      }
    )
  }

  useEffect(() => {
    return () => {
      if (starTimerRef.current) clearInterval(starTimerRef.current)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={`magic-bento-card ${spanClass} ${textAutoHide ? "auto-hide-text" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        "--glow-color": customGlow,
      } as React.CSSProperties}
    >
      {/* Background spot glow */}
      <div className="bento-glow-spot" />
      
      {/* Dynamic Border Mask Overlay */}
      {enableBorderGlow && <div className="bento-border-glow" />}
      
      {/* Card Content container */}
      <div className="bento-card-inner" ref={innerRef}>
        <div className="bento-header-info">
          {icon && <div className="bento-icon-container">{icon}</div>}
          <h3 className="bento-card-title">{title}</h3>
          <p className="bento-card-subtitle">{subtitle}</p>
        </div>
        
        {children && <div className="bento-custom-content">{children}</div>}
      </div>
    </div>
  )
}
