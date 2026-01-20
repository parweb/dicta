/**
 * Animated View Component
 * Handles smooth transitions between different views
 */

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedViewProps {
  children: ReactNode
  viewKey: string
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 10
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] // Custom easing for smooth feel
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export default function AnimatedView({ children, viewKey }: AnimatedViewProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={viewKey}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
