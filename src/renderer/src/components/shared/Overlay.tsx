import { useThemeStore } from '@/hooks/useThemeStore';

interface OverlayProps {
  onClose: () => void;
}

const Overlay = ({ onClose }: OverlayProps) => {
  const { theme } = useThemeStore();
  const { colors } = theme;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background.overlay,
        zIndex: 0,
        WebkitAppRegion: 'no-drag'
      }}
    />
  );
};

export default Overlay;
