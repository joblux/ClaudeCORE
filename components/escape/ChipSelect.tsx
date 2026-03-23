'use client'

interface ChipSelectProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  multi?: boolean
}

export default function ChipSelect({ label, options, selected, onChange, multi = true }: ChipSelectProps) {
  const toggle = (option: string) => {
    if (multi) {
      onChange(
        selected.includes(option)
          ? selected.filter((s) => s !== option)
          : [...selected, option]
      )
    } else {
      onChange(selected.includes(option) ? [] : [option])
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#2B4A3E] mb-3">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                isSelected
                  ? 'bg-[#2B4A3E] text-white border-[#2B4A3E]'
                  : 'bg-white text-[#5C5040] border-[#D4C9B4] hover:border-[#2B4A3E] hover:text-[#2B4A3E]'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
