import { requireApproved } from "@/lib/auth-server";
import Link from "next/link";

export default async function DashboardPage() {
  const member = await requireApproved();

  return (
    <div>
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Member Dashboard</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-2">
            Welcome back, {member.firstName || member.name || "Member"}
          </h1>
          <p className="font-sans text-sm text-[#888]">
            {member.isAdmin ? "Administrator" : "Approved Member"} · JOBLUX Intelligence Platform
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/jobs" className="jl-card group">
            <div className="jl-serif text-3xl font-light text-[#e8e2d8] mb-4">01</div>
            <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors">Confidential Positions</h3>
            <p className="font-sans text-xs text-[#888] leading-relaxed">Browse executive search mandates. Manager to Executive level.</p>
          </Link>

          <Link href="/wikilux" className="jl-card group">
            <div className="jl-serif text-3xl font-light text-[#e8e2d8] mb-4">02</div>
            <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors">WikiLux Intelligence</h3>
            <p className="font-sans text-xs text-[#888] leading-relaxed">500+ luxury brand encyclopedias. History, culture, hiring insights.</p>
          </Link>

          <Link href="/salaries" className="jl-card group">
            <div className="jl-serif text-3xl font-light text-[#e8e2d8] mb-4">03</div>
            <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors">Salary Intelligence</h3>
            <p className="font-sans text-xs text-[#888] leading-relaxed">Compensation benchmarks across markets, roles and maisons.</p>
          </Link>

          {member.isAdmin && (
            <Link href="/admin" className="jl-card group border-[#a58e28]">
              <div className="jl-serif text-3xl font-light text-[#a58e28] mb-4">A</div>
              <h3 className="font-sans text-sm font-semibold text-[#a58e28] mb-2">Admin Panel</h3>
              <p className="font-sans text-xs text-[#888] leading-relaxed">Review pending members, manage mandates, platform settings.</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
