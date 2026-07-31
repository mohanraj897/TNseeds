import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import AgriLogo from './AgriLogo'
import { Cloud, Sprout, Sun, Droplets } from 'lucide-react'

export default function CinematicAnimation({ onComplete }) {
  const [phase, setPhase] = useState('falling') // falling, landing, watering, sprouting, logo

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('landing'), 1500),
      setTimeout(() => setPhase('watering'), 2500),
      setTimeout(() => setPhase('sprouting'), 4000),
      setTimeout(() => setPhase('logo'), 6000),
      setTimeout(() => onComplete && onComplete(), 8000)
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="cinematic-container">
      {/* Background Atmosphere */}
      <motion.div 
        className="atmosphere"
        animate={{ 
          background: phase === 'logo' 
            ? 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(253, 224, 71, 0.1) 0%, transparent 60%)'
        }}
      />

      {/* Sunlight Glow */}
      <AnimatePresence>
        {(phase === 'sprouting' || phase === 'logo') && (
          <motion.div 
            className="sunrise-glow"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <Sun size={200} strokeWidth={0.5} className="sun-icon" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Animation Area */}
      <div className="animation-stage">
        {/* Soil */}
        <div className="soil-layer">
          <motion.div 
            className="soil-surface"
            animate={phase === 'landing' ? {
              scaleY: [1, 0.9, 1.05, 1],
              y: [0, 5, -2, 0]
            } : {}}
            transition={{ duration: 0.5 }}
          />
          {phase === 'landing' && (
            <div className="dust-particles">
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="dust"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], y: -20, x: (i - 4) * 10 }}
                  transition={{ duration: 0.8 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rain */}
        {phase === 'watering' && (
          <div className="rain-layer">
            {[...Array(10)].map((_, i) => (
              <motion.div 
                key={i}
                className="raindrop"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 200, opacity: [0, 1, 0] }}
                transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
              />
            ))}
          </div>
        )}

        {/* Seed to Plant to Logo Transformation */}
        <div className="transform-center">
          <AnimatePresence mode="wait">
            {phase === 'falling' || phase === 'landing' ? (
              <motion.div
                key="seed"
                className="seed-object"
                initial={{ y: -300, rotate: 0 }}
                animate={{ 
                  y: phase === 'landing' ? 180 : 0,
                  rotate: phase === 'landing' ? 0 : 360
                }}
                exit={{ scale: 0 }}
                transition={{ duration: 1.5, ease: "circIn" }}
              />
            ) : phase === 'watering' || phase === 'sprouting' ? (
              <motion.div
                key="sprout"
                className="sprout-object"
                initial={{ scale: 0, y: 180 }}
                animate={{ 
                  scale: phase === 'sprouting' ? 1.5 : 0.8,
                  y: phase === 'sprouting' ? 140 : 180
                }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 1.5 }}
              >
                <Sprout size={48} className="sprout-icon" />
                <motion.div 
                  className="leaf-wave"
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                className="final-logo"
                initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1, type: "spring" }}
              >
                <AgriLogo size="lg" animated={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
