import Link from 'next/link'

const footerLinks = {
  Intelligence: [
    { label: 'WikiLux',       href: '/wikilux'       },
    { label: 'Salary Guides', href: '/salaries'      },
    { label: 'Interviews',    href: '/interviews'    },
    { label: 'Bloglux',       href: '/bloglux'       },
    { label: 'Travel',        href: '/travel'        },
    { label: 'The Brief',     href: '/the-brief'     },
  ],
  Careers: [
    { label: 'Open Positions',  href: '/jobs'            },
    { label: 'Interview Prep',  href: '/interview-prep'  },
    { label: 'Career Guides',   href: '/careers'         },
    { label: 'Companies',       href: '/companies'       },
  ],
  Members: [
    { label: 'Sign In',         href: '/members'                  },
    { label: 'Request Access',  href: '/join'   },
    { label: 'Candidates',      href: '/members/candidates'       },
    { label: 'Employers',       href: '/members/employers'        },
    { label: 'Influencers',     href: '/members/influencers'      },
  ],
  JOBLUX: [
    { label: 'About',           href: '/about'    },
    { label: 'Contact',         href: '/contact'  },
    { label: 'Privacy Policy',  href: '/privacy'  },
    { label: 'Terms',           href: '/terms'    },
  ],
}

export function Footer() {
  return (
    <footer className="border-t-2 border-[#1a1a1a] mt-16">

      {/* MAIN FOOTER */}
      <div className="jl-container py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="jl-serif text-xl font-light tracking-[0.15em] text-[#1a1a1a] uppercase mb-3">
              JOB<span className="text-[#c8960c]">LUX</span>
            </div>
            <p className="font-sans text-xs text-[#888] leading-relaxed mb-4">
              Luxury Talents Intelligence.<br />
              Est. Paris 2006.
            </p>
            <p className="font-sans text-xs text-[#bbb] leading-relaxed">
              Paris · London · New York<br />
              Dubai · Singapore
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="jl-overline text-[#1a1a1a] mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-[#e8e2d8]">
        <div className="jl-container py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-[#bbb] tracking-wide">
            © {new Date().getFullYear()} JOBLUX &nbsp;·&nbsp; Luxury Talents Intelligence &nbsp;·&nbsp; Est. Paris 2006
          </p>
          <p className="font-sans text-xs text-[#bbb]">
            The private platform for luxury's managers, directors and executives
          </p>
        </div>
      </div>

    </footer>
  )
}
