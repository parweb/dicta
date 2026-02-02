/**
 * Scrollbar Track Component
 * Vertical track line for scrollbar
 */

import { memo } from 'react';
import { useThemeStore } from '@/hooks/useThemeStore';

const ScrollbarTrack = memo(function ScrollbarTrack() {
  const {
    theme: { colors }
  } = useThemeStore();

  return (
    <div
      style={{
        transform: 'translateX(-50%)',
        backgroundColor: colors.accent.primary.primary + '40',
        borderRadius: '2px'
      }}
    />
  );
});

export default ScrollbarTrack;
