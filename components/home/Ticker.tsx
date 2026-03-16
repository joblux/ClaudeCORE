const tickerItems = [
  { type: 'Moves',   text: 'Store Director · Hermès Dubai'                },
  { type: 'Salary',  text: 'Luxury Buyer Paris avg. €72K +8% YoY'         },
  { type: 'Moves',   text: 'Regional Director · Richemont Asia Pacific'    },
  { type: 'Hiring',  text: 'LVMH Group +12% hiring Q1 2026'               },
  { type: 'Moves',   text: 'HR Director · Chanel London'                   },
  { type: 'Salary',  text: 'Client Advisor Dubai avg. AED 18K/month'      },
  { type: 'WikiLux', text: 'Ferrari · Automotive · Est. 1947 · Italy'     },
  { type: 'Moves',   text: 'Buying Director · Kering Paris'               },
  { type: 'Salary',  text: 'Store Director Singapore avg. SGD 180K'       },
  { type: 'Hiring',  text: 'Richemont Asia Pacific — 40 new positions'    },
  { type: 'WikiLux', text: 'Aman Resorts · Hospitality · Est. 1988'       },
  { type: 'Moves',   text: 'Country Manager · Bulgari Middle East'        },
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
            <span className="text-[#333]">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
