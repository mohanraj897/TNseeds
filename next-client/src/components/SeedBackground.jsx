"use client"

import { motion } from 'framer-motion'
import { Sprout, Leaf } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SeedBackground() {
  const [seeds, setSeeds] = useState([])

  useEffect(() => {
    // Generate random seed positions and properties
    const newSeeds = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 10 + Math.random() * 20,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 5,
      type: Math.random() > 0.5 ? 'sprout' : 'leaf'
    }))
    setSeeds(newSeeds)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#0a0f0a]">
      {/* Radial Gradient for depth */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 70%)'
        }}
      />
      
      {seeds.map((seed) => (
        <motion.div
          key={seed.id}
          initial={{ 
            x: `${seed.x}vw`, 
            y: '110vh', 
            rotate: 0,
            opacity: 0 
          }}
          animate={{ 
            y: '-10vh',
            rotate: 360,
            opacity: [0, 0.4, 0.4, 0],
            x: [`${seed.x}vw`, `${seed.x + (Math.random() * 10 - 5)}vw`]
          }}
          transition={{
            duration: seed.duration,
            repeat: Infinity,
            delay: seed.delay,
            ease: "linear"
          }}
          className="absolute text-green-500/20"
          style={{ width: seed.size, height: seed.size }}
        >
          {seed.type === 'sprout' ? (
            <Sprout size={seed.size} />
          ) : (
            <Leaf size={seed.size} />
          )}
        </motion.div>
      ))}

      {/* Atmospheric Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
    </div>
  )
}
