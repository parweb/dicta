import { useTheme } from '@/lib/theme-context'
import type { HourlyCell } from './HeatmapGrid'

interface DetailModalProps {
  cell: HourlyCell
  onClose: () => void
}

export default function DetailModal({ cell, onClose }: DetailModalProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography, borderRadius } = theme

  return (
    <>
      {/* Backdrop with blur */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal content */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: colors.background.secondary,
          borderRadius: borderRadius.md,
          padding: spacing.xl,
          border: 'none',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '70vh',
          overflowY: 'auto',
          zIndex: 2001,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          animation: 'scaleIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg
          }}
        >
          <div
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary
            }}
          >
            {cell.dayLabel} · {String(cell.hour).padStart(2, '0')}h · {cell.count}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.text.tertiary,
              cursor: 'pointer',
              padding: 0,
              fontSize: typography.fontSize.xl
            }}
          >
            ×
          </button>
        </div>

        {/* Timeline visualization */}
        <div
          style={{
            marginBottom: spacing.lg,
            padding: spacing.md,
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius.sm
          }}
        >
          <div
            style={{
              position: 'relative',
              height: '50px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* Timeline axis */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: colors.border.secondary
              }}
            />

            {/* Timeline markers */}
            {cell.transcriptions.map((t, idx) => {
              const date = new Date(t.timestamp)
              const minute = date.getMinutes()
              const position = (minute / 60) * 100
              const duration = t.durationMs || 0
              const maxDuration = Math.max(
                ...cell.transcriptions.map((t) => t.durationMs || 0),
                1
              )
              const size = Math.max(8, (duration / maxDuration) * 20 + 8)

              return (
                <div
                  key={t.id}
                  title={`${minute}min ${date.getSeconds()}s`}
                  style={{
                    position: 'absolute',
                    left: `${position}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: colors.accent.blue.primary,
                    borderRadius: '50%',
                    border: `1px solid ${colors.background.primary}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    zIndex: cell.transcriptions.length - idx
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.2)'
                    e.currentTarget.style.zIndex = '1000'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                    e.currentTarget.style.zIndex = String(cell.transcriptions.length - idx)
                  }}
                />
              )
            })}

            {/* Time labels */}
            <div
              style={{
                position: 'absolute',
                bottom: '-18px',
                left: 0,
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary
              }}
            >
              0
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-18px',
                right: 0,
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary
              }}
            >
              60
            </div>
          </div>
        </div>

        {/* Transcriptions list */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.xs
          }}
        >
          {cell.transcriptions
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((t) => {
              const date = new Date(t.timestamp)
              const preview = t.text.slice(0, 60) + (t.text.length > 60 ? '...' : '')

              return (
                <div
                  key={t.id}
                  style={{
                    padding: spacing.sm,
                    backgroundColor: colors.background.primary,
                    borderRadius: borderRadius.sm
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: spacing.xs
                    }}
                  >
                    <span
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary
                      }}
                    >
                      {String(date.getHours()).padStart(2, '0')}:
                      {String(date.getMinutes()).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary
                      }}
                    >
                      {t.durationMs ? `${(t.durationMs / 1000).toFixed(0)}s` : '—'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.secondary,
                      lineHeight: typography.lineHeight.normal
                    }}
                  >
                    {preview}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </>
  )
}
