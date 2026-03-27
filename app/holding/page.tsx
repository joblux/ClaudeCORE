import Image from 'next/image'

const tags = [
  'Salary intelligence',
  'Brand encyclopedia',
  'Confidential search',
  'Market signals',
  'Career intelligence',
]

export default function HoldingPage() {
  return (
    <div className="bg-[#1a1a1a] min-h-screen flex flex-col items-center justify-center relative px-6">
      <Image
        src="/logos/joblux-header.png"
        alt="JOBLUX"
        width={182}
        height={46}
        className="h-[42px] w-auto mb-3"
      />

      <p className="text-[11px] tracking-[0.18em] uppercase text-[#444] mb-14">
        Luxury, decoded.
      </p>

      <h1
        className="text-[40px] font-light text-white text-center mb-5 max-w-[520px] leading-tight"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Luxury Talent{' '}
        <em className="text-[#a58e28]">Intelligence.</em>
      </h1>

      <p className="text-[14px] text-[#555] text-center mb-9">
        Relaunching soon.
      </p>

      <div className="flex gap-2 flex-wrap justify-center">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] tracking-[0.12em] uppercase text-[#444] border border-[#2a2a2a] px-3 py-1.5 rounded-[2px]"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#2a2a2a] tracking-[0.1em]">
        &copy; JOBLUX 2026
      </p>
    </div>
  )
}
