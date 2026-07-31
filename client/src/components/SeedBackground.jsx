import { motion } from 'framer-motion'
import { Sprout, Leaf } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SeedBackground() {
  const [seeds, setSeeds] = useState([])

  useEffect(() => {
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
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: -1,
      overflow: 'hidden',
      backgroundColor: '#f9fafb'
    }}>
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.08) 0%, transparent 70%)'
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
          style={{ 
            position: 'absolute', 
            color: 'rgba(22, 163, 74, 0.7)',
            width: seed.size, 
            height: seed.size,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
          }}
        >
          {seed.type === 'sprout' ? (
            <Sprout size={seed.size} />
          ) : (
            <Leaf size={seed.size} />
          )}
        </motion.div>
      ))}

      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '40%',
        height: '40%',
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        filter: 'blur(120px)',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        filter: 'blur(120px)',
        borderRadius: '50%'
      }} />
    </div>
  )
}
