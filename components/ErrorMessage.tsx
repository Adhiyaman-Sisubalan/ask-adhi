interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
      <p
        style={{
          color: '#E24B4A',
          fontFamily: 'monospace',
          fontSize: 12,
          margin: 0,
        }}
      >
        ✗ {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#555',
            fontSize: 11,
            fontFamily: 'monospace',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left',
          }}
        >
          [dismiss]
        </button>
      )}
    </div>
  )
}
