'use client'

interface ChipRowProps {
  chips: string[]
  variant: 'initial' | 'contextual'
  onSelect: (chip: string) => void
  disabled?: boolean
}

export default function ChipRow({ chips, variant, onSelect, disabled }: ChipRowProps) {
  if (chips.length === 0) return null

  return (
    <div
      className="flex flex-wrap gap-1 sm:gap-2 mt-3"
      role="list"
      aria-label={variant === 'initial' ? 'Suggested questions' : 'Follow-up suggestions'}
    >
      {chips.map((chip) => (
        <button
          key={chip}
          role="listitem"
          onClick={() => onSelect(chip)}
          disabled={disabled}
          className="chip-btn font-mono text-[12px] px-2 sm:px-[10px] py-1 min-h-[44px] sm:min-h-0 flex items-center rounded-full transition-colors"
          style={{
            borderWidth: '0.5px',
            borderStyle: 'solid',
            opacity: disabled ? 0.4 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
