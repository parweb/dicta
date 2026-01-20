/**
 * Animated View Component
 * Handles smooth transitions between different views
 * - Home: stays static, no animation
 * - Statistics/Settings: slide up/down as overlay panels
 */

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { useTheme } from '@/lib/theme-context'

interface AnimatedViewProps {
  children: ReactNode
  viewKey: string
}

// Panel variants for Statistics and Settings (slide up from bottom)
const panelVariants = {
  initial: {
    y: '100%'
  },
  enter: {
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] // Custom easing for smooth feel
    }
  },
  exit: {
    y: '100%',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export default function AnimatedView({ children, viewKey }: AnimatedViewProps) {
  const { theme } = useTheme()

  // Home view: no animation, just stays in place
  if (viewKey === 'home') {
    return (
      <div
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
      </div>
    )
  }

  // Statistics/Settings: slide up/down panel
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={viewKey}
        variants={panelVariants}
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
          bottom: 0,
          zIndex: 10, // Overlay above home
          backgroundColor: theme.colors.background.primary // Opaque background from design system
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
