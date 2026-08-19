import { motion, useScroll, useTransform } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import CinematicAnimation from '../components/CinematicAnimation'
import AgriLogo from '../components/AgriLogo'
import { ChevronDown, ArrowRight, ShieldCheck, Zap, Globe, Users } from 'lucide-react'
import './LandingPage.css'
//homepage
export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(true)
  const { scrollYProgress } = useScroll()
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])

  if (showIntro) {
    return <CinematicAnimation onComplete={() => setShowIntro(false)} />
  }

  return (
    <div className="landing-page">
      {/* Cinematic Hero Section */}
      <section className="hero-viewport">
        <div className="hero-bg-elements">
          <div className="farmland-horizon" />
          <div className="clouds-layer">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                className="cloud-item"
                animate={{ x: [-100, 100], opacity: [0, 0.3, 0] }}
                transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
              />
            ))}
          </div>
          <div className="pollen-field">
            {[...Array(20)].map((_, i) => (
              <motion.div 
                key={i}
                className="pollen"
                animate={{ 
                  y: [-20, 20], 
                  x: [-10, 10],
                  opacity: [0, 0.4, 0] 
                }}
                transition={{ duration: 3 + i % 2, repeat: Infinity }}
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%` 
                }}
              />
            ))}
          </div>
        </div>

        <motion.div 
          className="hero-content container"
          style={{ opacity, scale }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="hero-logo-wrap">
              <AgriLogo size="lg" />
            </div>
            <h1 className="hero-headline">
              Fresh Farm Products <br /> <span>Delivered Smartly</span>
            </h1>
            <p className="hero-tagline">
              The world's most intelligent marketplace connecting verified <br /> 
              farmers with global buyers in real-time.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg shine-effect">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Explore Products
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="scroll-indicator"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>Scroll to Explore</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header-centered">
            <h2 className="section-title">Seamless <span>Seed Trading</span></h2>
            <p className="section-desc">Four simple steps to digitize your agricultural trade</p>
          </div>
          <div className="steps-grid">
            {[
              { title: 'Register Entity', desc: 'Sign up as a verified dealer or a local farmer in seconds.', icon: '01' },
              { title: 'List or Browse', desc: 'Dealers list their seed stock with real-time availability.', icon: '02' },
              { title: 'Connect Directly', desc: 'Securely message or call to negotiate and finalize orders.', icon: '03' },
              { title: 'Track Progress', desc: 'Monitor your delivery journey with real-time GPS tracking.', icon: '04' }
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{step.icon}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Stats Section */}
      <section className="market-stats">
        <div className="container stats-inner">
          <div className="stat-box">
            <h3>50k+</h3>
            <p>Verified Farmers</p>
          </div>
          <div className="stat-box">
            <h3>1.2k</h3>
            <p>Certified Dealers</p>
          </div>
          <div className="stat-box">
            <h3>500+</h3>
            <p>Seed Varieties</p>
          </div>
          <div className="stat-box">
            <h3>₹10Cr+</h3>
            <p>Trade Volume</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section container">
        <div className="trust-content">
          <div className="trust-text">
            <h2>Building Trust in <span>Every Grain</span></h2>
            <p>AgriCart is more than just a marketplace. We provide the digital infrastructure to ensure every transaction is secure, every seed is quality-checked, and every farmer gets a fair price.</p>
            <ul className="trust-list">
              <li><ShieldCheck size={18} /> Government Certified Listings</li>
              <li><Zap size={18} /> Instant Order Synchronization</li>
              <li><Globe size={18} /> Multi-state Logistics Support</li>
            </ul>
          </div>
          <div className="trust-visual">
            <div className="visual-card">
              <div className="card-pulse" />
              <AgriLogo size="md" />
              <p>Network Secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="cta-footer">
        <div className="container">
          <h2>Ready to transform your <span>Agri-Business?</span></h2>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Join the Network</Link>
          </div>
        </div>
      </section>

      <footer className="footer-simple container">
        <p>&copy; 2026 AgriCart Intelligence Systems. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Help</a>
        </div>
      </footer>
    </div>
  )
}
