/**
 * Animated View Component
 * Handles smooth transitions between different views
 * - Home: stays static, no animation
 * - Statistics/Settings: slide up/down as overlay panels
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useThemeStore } from '@/hooks/useThemeStore';

interface AnimatedViewProps {
  children: ReactNode;
  viewKey: string;
}

const panelVariants = {
  initial: {
    y: '100%'
  },
  enter: {
    y: 0,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    y: '100%',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export default function AnimatedView({ children, viewKey }: AnimatedViewProps) {
  if (viewKey === 'home') {
    return children;
  }

  return null;
}

interface OverlayPanelsProps {
  currentView: 'home' | 'statistics' | 'settings';
  children: ReactNode;
}

export function OverlayPanels({ currentView, children }: OverlayPanelsProps) {
  const { theme } = useThemeStore();
  const showPanel = currentView !== 'home';

  return (
    <AnimatePresence mode="wait" initial={false}>
      {showPanel && (
        <motion.div
          key={currentView}
          variants={panelVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          style={{
            position: 'absolute',
            top: '66px',
            left: theme.spacing.sm,
            right: theme.spacing.sm,
            bottom: '-' + theme.spacing.sm,
            zIndex: 10,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border.primary}`
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
