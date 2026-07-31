"use client"

import { motion } from 'framer-motion'
import { Sprout, CheckCircle2, Truck, Package, Factory } from 'lucide-react'
import './TrackingAnimation.css'

const steps = [
  { id: 1, label: 'Processing', icon: Factory },
  { id: 2, label: 'Quality Check', icon: CheckCircle2 },
  { id: 3, label: 'Packaging', icon: Package },
  { id: 4, label: 'Dispatched', icon: Truck },
  { id: 5, label: 'Delivered', icon: Sprout },
]

export default function TrackingAnimation({ currentStep = 3 }) {
  return (
    <div className="tracking-container">
      <div className="tracking-track">
        {/* Background Line */}
        <div className="track-line-bg" />
        
        {/* Animated Progress Line */}
        <motion.div 
          className="track-line-progress"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep - 1) * 25}%` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        <div className="steps-wrapper">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = step.id <= currentStep
            const isPending = step.id === currentStep + 1

            return (
              <div key={step.id} className={`step-item ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}>
                <motion.div 
                  className="step-icon-outer"
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    boxShadow: isActive ? '0 0 20px var(--primary-glow)' : 'none'
                  }}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
                  
                  {isActive && (
                    <motion.div 
                      className="step-pulse"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                
                <span className="step-label">{step.label}</span>
                
                {/* Growth Animation if it's the current/active step */}
                {step.id === currentStep && (
                  <motion.div 
                    className="growth-indicator"
                    initial={{ height: 0 }}
                    animate={{ height: 40 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Sprout size={12} className="growth-icon" />
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
