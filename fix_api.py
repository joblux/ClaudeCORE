content = open('/Users/momo/Documents/GitHub/ClaudeCORE/app/api/members/complete-registration/route.ts').read()
new_valid_tiers = "const VALID_TIERS = ['member', 'senior', 'executive', 'business', 'insider']"
old_valid_tiers = "const VALID_TIERS = ['rising', 'pro', 'professional', 'business', 'executive', 'insider']"
content = content.replace(old_valid_tiers, new_valid_tiers)

old_update = """    // Build update object
    const updateData: any = {
      role: tier,
      registration_completed: true,
      tier_selected: true,
      city: body.city || null,
      country: body.country || null,
      contact_preference: body.contact_preference || 'email_only',
      profile_visibility: body.profile_visibility || 'team_only',
      phone: body.phone || null,
    }

    // Tier-specific fields
    if (tier === 'rising') {
      updateData.university = body.university || null
      updateData.field_of_study = body.field_of_study || null
      updateData.graduation_year = body.graduation_year ? parseInt(body.graduation_year) : null
      updateData.seeking_role = body.seeking_role || null
    } else if (tier === 'pro') {
      updateData.job_title = body.job_title || null
      updateData.maison = body.maison || null
      updateData.department = body.department || null
    } else if (tier === 'professional') {
      updateData.job_title = body.job_title || null
      updateData.maison = body.maison || null
      updateData.seniority = body.seniority || null
      updateData.years_in_luxury = body.years_in_luxury ? parseInt(body.years_in_luxury) : null
    } else if (tier === 'executive') {
      updateData.job_title = body.job_title || null
      updateData.maison = body.maison || null
      updateData.years_in_luxury = body.years_in_luxury ? parseInt(body.years_in_luxury) : null
    } else if (tier === 'business') {
      updateData.maison = body.maison || null
      updateData.company_email = body.company_email || null
      updateData.job_title = body.job_title || null
      updateData.department = body.department || null
      updateData.company_website = body.company_website || null
      updateData.company_size = body.company_size || null
      updateData.how_heard = body.how_heard || null
    } else if (tier === 'insider') {
      updateData.speciality = body.speciality || null
      updateData.consulting_firm = body.consulting_firm || null
      updateData.expertise_tags = body.expertise_tags || null
      updateData.years_in_luxury = body.years_in_luxury ? parseInt(body.years_in_luxury) : null
      updateData.linkedin_url = body.website || null // reuse linkedin_url field for website
      updateData.how_heard = body.how_heard || null
    }"""

new_update = """    const { firstName, lastName, jobTitle, company, contactPref, phone } = body
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || null

    // Build update object
    const updateData: any = {
      role: tier,
      status: 'pending',
      registration_completed: true,
      tier_selected: true,
      full_name: fullName,
      first_name: firstName || null,
      last_name: lastName || null,
      job_title: jobTitle || null,
      maison: company || null,
      contact_preference: contactPref || 'email',
      phone: contactPref === 'phone' ? (phone || null) : null,
    }"""

content = content.replace(old_update, new_update)

old_notif = """    // Business/Insider: send admin notification email
    if (tier === 'business' || tier === 'insider') {
      const memberName = data.full_name || data.email
      const company = body.maison || body.consulting_firm || 'Unknown'
      const { html, text } = adminNewMemberEmail({
        name: memberName,
        email: data.email,
        tier: tier === 'business' ? 'Business' : 'Insider',
        company,
        registrationDate: new Date().toISOString().split('T')[0],
      })
      sendEmail({
        to: ADMIN_ALERT_EMAIL,
        subject: `New access request: ${memberName} (${tier === 'business' ? 'Business' : 'Insider'})`,
        body: text,
        bodyHtml: html,
      }).catch(() => {})
    }

    // Rising/Pro/Pro+/Executive: trigger AI review in background
    if (['rising', 'pro', 'professional', 'executive'].includes(tier)) {
      fetch(`${process.env.NEXTAUTH_URL}/api/admin/members/ai-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env.NEXTAUTH_SECRET || '',
        },
        body: JSON.stringify({ member_id: memberId }),
      }).catch(() => {})
    }"""

new_notif = """    // Send admin notification for all tiers
    const memberName = data.full_name || data.email
    const { html, text } = adminNewMemberEmail({
      name: memberName,
      email: data.email,
      tier: tier.charAt(0).toUpperCase() + tier.slice(1),
      company: company || 'Not provided',
      registrationDate: new Date().toISOString().split('T')[0],
    })
    sendEmail({
      to: ADMIN_ALERT_EMAIL,
      subject: `New access request: ${memberName} (${tier})`,
      body: text,
      bodyHtml: html,
    }).catch(() => {})"""

content = content.replace(old_notif, new_notif)
open('/Users/momo/Documents/GitHub/ClaudeCORE/app/api/members/complete-registration/route.ts', 'w').write(content)
print("Done")
