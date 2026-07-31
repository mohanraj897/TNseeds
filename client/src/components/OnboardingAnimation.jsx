"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import './OnboardingAnimation.css'

export default function OnboardingAnimation({ onComplete }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
      // We don't hide it here if we want it to be a standalone demo, 
      // but usually splash screens hide after completion.
    }, 5000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="onboarding-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="animation-container">
            {/* Sunlight Glow */}
            <motion.div 
              className="sunlight-glow"
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating Particles */}
            <div className="particles">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="particle"
                  initial={{ 
                    x: Math.random() * 400 - 200, 
                    y: Math.random() * 400 - 200,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: [0, -100], 
                    opacity: [0, 0.8, 0],
                    x: (Math.random() * 400 - 200) + (Math.random() * 50)
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2, 
                    repeat: Infinity, 
                    delay: Math.random() * 2 
                  }}
                />
              ))}
            </div>

            <svg viewBox="0 0 200 200" className="agri-svg">
              {/* Soil Base */}
              <motion.path
                d="M20 160 Q100 140 180 160 L180 200 L20 200 Z"
                fill="#3d2b1f"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
              />
              <motion.path
                d="M30 165 Q100 150 170 165"
                stroke="#5c4033"
                strokeWidth="2"
                fill="none"
                animate={{ 
                  d: ["M30 165 Q100 150 170 165", "M30 165 Q100 155 170 165", "M30 165 Q100 150 170 165"]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />

              {/* Seed */}
              <motion.ellipse
                cx="100"
                cy="40"
                rx="4"
                ry="6"
                fill="#8b4513"
                initial={{ y: -50, opacity: 0 }}
                animate={{ 
                  y: 115, 
                  opacity: [0, 1, 1],
                  scale: [1, 1, 0] 
                }}
                transition={{ 
                  duration: 1.5, 
                  times: [0, 0.2, 1],
                  ease: "circIn" 
                }}
              />

              {/* Water Drops */}
              {[90, 100, 110].map((x, i) => (
                <motion.path
                  key={i}
                  d={`M${x} 20 Q${x+2} 25 ${x} 30 Q${x-2} 25 ${x} 20`}
                  fill="#60a5fa"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 130, opacity: [0, 1, 0] }}
                  transition={{ 
                    duration: 1, 
                    delay: 1.5 + (i * 0.2),
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
              ))}

              {/* Sprouting Plant */}
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
                {/* Stem */}
                <motion.path
                  d="M100 155 L100 155"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  animate={{ d: "M100 155 L100 130" }}
                  transition={{ delay: 2.2, duration: 0.8 }}
                />
                
                {/* Left Leaf */}
                <motion.path
                  d="M100 135 Q85 125 75 135 Q85 145 100 135"
                  fill="#4ade80"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ 
                    scale: 1,
                    rotate: [-20, -25, -20]
                  }}
                  transition={{ 
                    scale: { delay: 2.8, duration: 0.5 },
                    rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                />

                {/* Right Leaf */}
                <motion.path
                  d="M100 135 Q115 125 125 135 Q115 145 100 135"
                  fill="#22c55e"
                  initial={{ scale: 0, rotate: 20 }}
                  animate={{ 
                    scale: 1,
                    rotate: [20, 25, 20]
                  }}
                  transition={{ 
                    scale: { delay: 3, duration: 0.5 },
                    rotate: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                  }}
                />
              </motion.g>
            </svg>

            <motion.div 
              className="onboarding-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.5, duration: 0.5 }}
            >
              <h1 className="app-name">AgriCart</h1>
              <p className="app-tagline">Growing Together</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
