import { Search, X } from 'lucide-react';

import {
  colors,
  spacing,
  typography,
  borderRadius
} from '../../lib/design-system';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Rechercher...',
  style
}: SearchInputProps) => {
  return (
    <div
      style={{
        position: 'relative',
        marginBottom: spacing.lg,
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: spacing.md,
          top: '50%',
          transform: 'translateY(-50%)',
          color: colors.text.tertiary,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Search size={16} />
      </div>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: `${spacing.sm} ${spacing.lg} ${spacing.sm} ${spacing['3xl']}`,
          backgroundColor: colors.background.tertiary,
          border: `1px solid ${colors.border.primary}`,
          borderRadius: borderRadius.md,
          color: colors.text.primary,
          fontSize: typography.fontSize.sm,
          outline: 'none',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = colors.accent.blue.primary;
          e.currentTarget.style.backgroundColor = colors.background.secondary;
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = colors.border.primary;
          e.currentTarget.style.backgroundColor = colors.background.tertiary;
        }}
      />

      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: spacing.sm,
            top: '50%',
            transform: 'translateY(-50%)',
            padding: spacing.xs,
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.text.tertiary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderRadius: borderRadius.sm,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = colors.background.primary;
            e.currentTarget.style.color = colors.text.primary;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.text.tertiary;
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
