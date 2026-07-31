import { motion } from 'framer-motion'
import { Sprout } from 'lucide-react'

export default function AgriLogo({ size = "md", animated = true }) {
  const isLarge = size === "lg"
  const iconSize = isLarge ? 32 : 22

  return (
    <div className={`agri-logo-wrapper ${size}`}>
      <motion.div 
        className="logo-icon-container"
        animate={animated ? {
          rotateY: [0, 15, 0],
          scale: [1, 1.05, 1]
        } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="logo-icon-glow" />
        <Sprout size={iconSize} className="logo-icon-main" />
      </motion.div>
      <div className="logo-text-stack">
        <span className="logo-main-text">Agri<span>Cart</span></span>
        {isLarge && <span className="logo-tagline">Seed Intelligence</span>}
      </div>
    </div>
  )
}
