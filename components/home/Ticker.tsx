const tickerItems = [
  { type: 'News', text: 'LVMH reports record revenue of \u20ac84.7 billion in 2024' },
  { type: 'News', text: 'Kering announces strategic restructuring across key maisons' },
  { type: 'News', text: 'Herm\u00e8s opens largest flagship in Tokyo Ginza district' },
  { type: 'News', text: 'Richemont acquires majority stake in emerging jewellery brand' },
  { type: 'News', text: 'Chanel confirms appointment of new Global Creative Director' },
  { type: 'News', text: 'LVMH Fashion Group expands presence in Southeast Asia' },
  { type: 'News', text: 'Swatch Group reports 14% decline in annual net profit' },
  { type: 'News', text: 'Burberry returns to profit under new creative direction' },
]

export function Ticker() {
  // Duplicate for seamless loop
  const items = [...tickerItems, ...tickerItems]

  return (
    <div className="jl-ticker">
      <div className="jl-ticker-inner">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-3">
            <em>{item.type}</em>
            <span>{item.text}</span>
            <span className="text-[#333]">&middot;</span>
          </span>
        ))}
      </div>
    </div>
  )
}
