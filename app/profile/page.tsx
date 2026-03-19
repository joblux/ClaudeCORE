import { requireApproved } from "@/lib/auth-server";
import Link from "next/link";

export default async function ProfilePage() {
  const member = await requireApproved();

  return (
    <div>
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Your Profile</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a]">
            {member.firstName} {member.lastName}
          </h1>
          <p className="font-sans text-sm text-[#888] mt-1">
            {member.isAdmin ? "Administrator" : "Member"} · {member.email}
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="max-w-2xl">
          <div className="jl-section-label"><span>Account Details</span></div>
          <div className="space-y-4 mb-10">
            <div className="flex justify-between py-3 border-b border-[#f0ece4]">
              <span className="font-sans text-xs text-[#888] uppercase tracking-wider">Name</span>
              <span className="font-sans text-sm text-[#1a1a1a]">{member.firstName} {member.lastName}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#f0ece4]">
              <span className="font-sans text-xs text-[#888] uppercase tracking-wider">Email</span>
              <span className="font-sans text-sm text-[#1a1a1a]">{member.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#f0ece4]">
              <span className="font-sans text-xs text-[#888] uppercase tracking-wider">Role</span>
              <span className="jl-badge-gold text-[0.55rem]">{member.role}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#f0ece4]">
              <span className="font-sans text-xs text-[#888] uppercase tracking-wider">Status</span>
              <span className="font-sans text-sm text-[#1a1a1a]">{member.status}</span>
            </div>
          </div>

          <div className="jl-section-label"><span>Quick Links</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard" className="jl-card group">
              <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">Dashboard</h3>
              <p className="font-sans text-xs text-[#888] mt-1">Back to your dashboard</p>
            </Link>
            <Link href="/jobs" className="jl-card group">
              <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">Job Briefs</h3>
              <p className="font-sans text-xs text-[#888] mt-1">Browse confidential assignments</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
