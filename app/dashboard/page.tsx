import { requireApproved } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";

const TIER_LABELS: Record<string, string> = {
  rising: 'Rising Member',
  pro: 'Pro Member',
  professional: 'Pro+ Member',
  executive: 'Executive Member',
  business: 'Business Member',
  insider: 'Insider Member',
  admin: 'Administrator',
}

interface DashCard {
  num: string
  title: string
  desc: string
  href: string
  gold?: boolean
}

export default async function DashboardPage() {
  const member = await requireApproved();
  if (member.isAdmin) redirect("/admin/dashboard");
  const role = member.role || 'professional'
  const tierLabel = TIER_LABELS[role] || 'Member'
  const isAdmin = member.isAdmin
  const isSenior = ['professional', 'executive', 'insider'].includes(role)
  const isBusiness = role === 'business'
  const hasDirectoryAccess = ['business', 'insider', 'executive'].includes(role)

  // Base cards for all members
  const cards: DashCard[] = [
    { num: '01', title: 'Opportunities', desc: 'Browse open positions in luxury. Manager to Executive level.', href: '/opportunities' },
    { num: '02', title: 'WikiLux', desc: '500+ luxury brand encyclopedias. History, culture, hiring insights.', href: '/wikilux' },
    { num: '03', title: 'Interview Intelligence', desc: 'Real interview experiences from luxury professionals across 150+ maisons.', href: '/interviews' },
    { num: '04', title: 'Contribute', desc: 'Share your intelligence, earn points for the community.', href: '/contribute' },
    { num: '05', title: 'Messages', desc: 'View messages from the JOBLUX recruitment team.', href: '/dashboard/messages' },
    { num: '06', title: 'My Profile', desc: 'Edit your profile and settings.', href: '/profile' },
    { num: '07', title: 'Invite Colleagues', desc: 'Grow the JOBLUX community with your referral link.', href: '/invite' },
  ]

  // Directory access — hidden until launch
  // if (hasDirectoryAccess) {
  //   cards.push(
  //     { num: String(cards.length + 1).padStart(2, '0'), title: 'Member Directory', desc: 'Browse and connect with luxury professionals across the network.', href: '/directory' },
  //   )
  // }

  // Senior tiers get extra cards
  if (isSenior) {
    cards.push(
      { num: '08', title: 'Confidential Opportunities', desc: 'Executive-level positions handled with full discretion.', href: '/opportunities?confidential=true' },
      { num: '09', title: 'Salary Intelligence', desc: 'Compensation benchmarks across markets and roles.', href: '/salaries' },
    )
  }

  // Business gets post brief
  if (isBusiness) {
    cards.push(
      { num: '07', title: 'Post a Brief', desc: 'Create a new hiring assignment on the JOBLUX platform.', href: '/admin/briefs/new' },
    )
  }

  // Admin cards
  const adminCards: DashCard[] = isAdmin ? [
    { num: 'A1', title: 'Admin Panel', desc: 'Command centre — stats, notifications, overview.', href: '/admin/dashboard', gold: true },
    { num: 'A2', title: 'Post a Brief', desc: 'Create a new hiring assignment.', href: '/admin/briefs/new', gold: true },
    { num: 'A3', title: 'Review Contributions', desc: 'Approve member contributions.', href: '/admin/contributions', gold: true },
    { num: 'A4', title: 'Manage Articles', desc: 'Bloglux editorial and publishing.', href: '/admin/articles', gold: true },
  ] : []

  return (
    <div>
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Member Dashboard</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-2">
            Welcome back, {member.firstName || member.name || "Member"}
          </h1>
          <p className="font-sans text-sm text-[#888]">
            {tierLabel} &middot; JOBLUX Intelligence Platform
          </p>
        </div>
      </div>

      <div className="jl-container py-10">

        {/* Member cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {cards.map((card) => (
            <Link key={card.num} href={card.href} className="jl-card group">
              <div className="jl-serif text-3xl font-light text-[#e8e2d8] mb-4">{card.num}</div>
              <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors">{card.title}</h3>
              <p className="font-sans text-xs text-[#888] leading-relaxed">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Admin section */}
        {adminCards.length > 0 && (
          <>
            <div className="jl-section-label"><span>Administration</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {adminCards.map((card) => (
                <Link key={card.num} href={card.href} className="jl-card group border-[#a58e28]">
                  <div className="jl-serif text-2xl font-light text-[#a58e28] mb-3">{card.num}</div>
                  <h3 className="font-sans text-sm font-semibold text-[#a58e28] mb-2">{card.title}</h3>
                  <p className="font-sans text-xs text-[#888] leading-relaxed">{card.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
