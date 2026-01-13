import { useState } from 'react';

import { useTheme } from '../../lib/theme-context';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export default function ColorPicker({
  label,
  value,
  onChange,
  description
}: ColorPickerProps) {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(value);

  // Normalize color value for color input (convert rgba to hex if needed)
  const normalizeForColorInput = (color: string): string => {
    if (color.startsWith('rgba')) {
      // Extract RGB from rgba(r, g, b, a) format
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      }
    }
    return color;
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Only call onChange if it's a valid format
    if (newValue.match(/^#[0-9A-Fa-f]{6}$/) || newValue.match(/^rgba?\(/)) {
      onChange(newValue);
    }
  };

  const handleTextInputBlur = () => {
    // Revert to original value if invalid
    if (
      !inputValue.match(/^#[0-9A-Fa-f]{6}$/) &&
      !inputValue.match(/^rgba?\(/)
    ) {
      setInputValue(value);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.sm
      }}
    >
      <label
        style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.secondary
        }}
      >
        {label}
      </label>

      {description && (
        <p
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.text.tertiary,
            marginTop: `-${theme.spacing.xs}`,
            marginBottom: theme.spacing.xs
          }}
        >
          {description}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md
        }}
      >
        {/* Color input */}
        <input
          type="color"
          value={normalizeForColorInput(value)}
          onChange={handleColorInputChange}
          style={{
            width: '48px',
            height: '36px',
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius.sm,
            cursor: 'pointer',
            backgroundColor: 'transparent'
          }}
        />

        {/* Text input for hex value */}
        <input
          type="text"
          value={inputValue}
          onChange={handleTextInputChange}
          onBlur={handleTextInputBlur}
          placeholder="#000000"
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.background.tertiary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.sm,
            fontFamily: 'monospace',
            outline: 'none'
          }}
          onFocus={e => {
            e.target.style.borderColor = theme.colors.border.accent;
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = theme.colors.border.primary;
          }}
        />

        {/* Color preview square */}
        <div
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: value,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius.sm,
            flexShrink: 0
          }}
          title={value}
        />
      </div>
    </div>
  );
}
