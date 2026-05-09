'use client'

interface ChipRowProps {
  chips: string[]
  variant: 'initial' | 'contextual'
  onSelect: (chip: string) => void
}

export default function ChipRow({ chips, variant, onSelect }: ChipRowProps) {
  if (chips.length === 0) return null

  return (
    <div
      className="flex flex-wrap gap-2 mt-3"
      role="list"
      aria-label={variant === 'initial' ? 'Suggested questions' : 'Follow-up suggestions'}
    >
      {chips.map((chip) => (
        <button
          key={chip}
          role="listitem"
          onClick={() => onSelect(chip)}
          className="chip-btn font-mono text-[11px] px-[9px] py-[3px] rounded-[3px] transition-colors cursor-pointer"
          style={{ borderWidth: '0.5px', borderStyle: 'solid' }}
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
