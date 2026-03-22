import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | JOBLUX',
  description: 'Privacy policy and GDPR compliance for JOBLUX. Your data is never sold.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#f5f4f0] min-h-screen">
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
    <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
      <p className="jl-overline-gold tracking-widest uppercase text-sm mb-4">Legal</p>
      <h1 className="jl-serif text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-12">Last updated: March 2026 — GDPR compliant</p>

      <div className="jl-prose space-y-12">
        {/* ── 1. Introduction ── */}
        <section id="introduction">
          <h2 className="jl-serif text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            This Privacy Policy explains how JOBLUX collects, uses, stores, and protects your
            personal data when you use our Platform. JOBLUX is committed to safeguarding the privacy
            of its Members and ensuring full compliance with the General Data Protection Regulation
            (GDPR — Regulation (EU) 2016/679) and all applicable French data protection legislation.
          </p>
          <p className="mt-3">
            The data controller responsible for the processing of your personal data is:
          </p>
          <p className="mt-3">
            <strong>Mohammed M'zaour</strong><br />
            JOBLUX<br />
            Paris, France<br />
            Email:{' '}
            <a href="mailto:hello@joblux.com" className="underline">
              hello@joblux.com
            </a>
          </p>
          <p className="mt-3">
            By accessing or using the Platform, you acknowledge that you have read and understood this
            Privacy Policy. If you do not agree with our data practices as described herein, you
            should not use the Platform. This Privacy Policy should be read in conjunction with our{' '}
            <Link href="/terms" className="underline">Terms of Service</Link>.
          </p>
        </section>

        {/* ── 2. What We Collect ── */}
        <section id="what-we-collect">
          <h2 className="jl-serif text-2xl font-semibold mb-4">2. What We Collect</h2>
          <p>
            We collect and process the following categories of personal data in connection with your
            use of the Platform:
          </p>
          <p className="mt-3">
            <strong>Account data:</strong> Information provided during registration, including your
            full name, email address, and account tier. This data is necessary to create and
            maintain your account on the Platform.
          </p>
          <p className="mt-3">
            <strong>Profile data:</strong> Professional information you choose to provide, such as
            your current and past employers, job title, years of experience, skills, languages spoken,
            location, biography, and profile photograph. This data enriches your presence within the
            Society and enables relevant opportunity matching.
          </p>
          <p className="mt-3">
            <strong>Contribution data:</strong> Content you submit to the Platform, including salary
            reports, interview experiences, WikiLux articles, BlogLux posts, employer reviews, and any
            other user-generated content. While Contributions are anonymised before publication, we
            retain the association with your account for moderation and quality purposes.
          </p>
          <p className="mt-3">
            <strong>Preference data:</strong> Your settings, notification preferences, saved
            opportunities, followed Maisons, and other personalisation choices you make on the
            Platform.
          </p>
          <p className="mt-3">
            <strong>Usage data:</strong> Information about how you interact with the Platform,
            including pages visited, features used, time spent, search queries, click patterns, and
            navigation paths. This data is collected to improve the user experience and Platform
            performance.
          </p>
          <p className="mt-3">
            <strong>Authentication data:</strong> Data related to your sign-in method, including
            OAuth tokens from third-party providers (such as Google or LinkedIn), session identifiers,
            and device information. We do not store passwords directly.
          </p>
          <p className="mt-3">
            <strong>Communication data:</strong> Messages sent through the Platform, support requests,
            feedback, and any correspondence with JOBLUX. This includes data exchanged during the
            recruitment process when JOBLUX acts as gatekeeper between Members and employers.
          </p>
        </section>

        {/* ── 3. How We Use Your Data ── */}
        <section id="how-we-use">
          <h2 className="jl-serif text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
          <p>
            We process your personal data for the following purposes:
          </p>
          <p className="mt-3">
            To create and manage your account, authenticate your identity, and provide you with access
            to the Platform and its features. This includes personalising your experience, displaying
            relevant opportunities, and maintaining the security and integrity of your account.
          </p>
          <p className="mt-3">
            To facilitate recruitment services, including matching your profile with suitable
            Opportunities, presenting your candidature to employers through our gatekeeper model,
            managing Search Assignments, and communicating with you about the status of your
            applications.
          </p>
          <p className="mt-3">
            To operate and improve the Platform, including analysing usage patterns, conducting
            research and analytics, fixing bugs, developing new features, and ensuring the Platform
            performs optimally. We use aggregated and anonymised data wherever possible for these
            purposes.
          </p>
          <p className="mt-3">
            To communicate with you, including sending service-related notifications, The Brief
            newsletter, updates about new features or Opportunities, and responding to your support
            requests. You can manage your communication preferences in your account settings.
          </p>
          <p className="mt-3">
            To enforce our Terms of Service, prevent fraud and abuse, moderate content, comply with
            legal obligations, and protect the rights, safety, and property of JOBLUX, its Members,
            and third parties.
          </p>
        </section>

        {/* ── 4. Legal Basis ── */}
        <section id="legal-basis">
          <h2 className="jl-serif text-2xl font-semibold mb-4">4. Legal Basis</h2>
          <p>
            Under GDPR Article 6, we process your personal data on the following legal bases:
          </p>
          <p className="mt-3">
            <strong>Consent (Article 6(1)(a)):</strong> Where you have given clear, informed, and
            freely given consent to the processing of your personal data for specific purposes. This
            includes optional data collection such as analytics cookies (when configured), marketing
            communications, and certain profile enrichment features. You may withdraw your consent at
            any time by contacting us or adjusting your account settings.
          </p>
          <p className="mt-3">
            <strong>Legitimate interest (Article 6(1)(f)):</strong> Where processing is necessary
            for the legitimate interests pursued by JOBLUX, provided those interests are not
            overridden by your fundamental rights and freedoms. Our legitimate interests include
            improving the Platform, ensuring security, preventing fraud, conducting analytics on
            aggregated data, and promoting our services.
          </p>
          <p className="mt-3">
            <strong>Contractual necessity (Article 6(1)(b)):</strong> Where processing is necessary
            for the performance of the contract between you and JOBLUX (i.e., these Terms of Service),
            or to take steps at your request prior to entering into such a contract. This includes
            account creation, service delivery, recruitment intermediation, and core Platform
            functionality.
          </p>
          <p className="mt-3">
            <strong>Legal obligation (Article 6(1)(c)):</strong> Where processing is necessary for
            compliance with a legal obligation to which JOBLUX is subject. This includes retaining
            certain data for tax, accounting, or regulatory purposes, responding to lawful requests
            from authorities, and complying with French and EU data protection regulations.
          </p>
        </section>

        {/* ── 5. Data Sharing ── */}
        <section id="data-sharing">
          <h2 className="jl-serif text-2xl font-semibold mb-4">5. Data Sharing</h2>
          <p>
            JOBLUX will never sell your personal data to third parties. The privacy and trust of our
            Members is fundamental to the Society, and we treat your data with the utmost
            confidentiality.
          </p>
          <p className="mt-3">
            Under our gatekeeper recruitment model, JOBLUX may share relevant profile information and
            application materials with employers in connection with specific Opportunities or Search
            Assignments. This sharing occurs only when you apply to an Opportunity or are selected as
            a candidate, and only the information necessary for the recruitment process is disclosed.
            Your data is never shared with employers for unsolicited contact or marketing purposes.
          </p>
          <p className="mt-3">
            We may share aggregated, anonymised data that cannot reasonably be used to identify any
            individual. This includes industry benchmarks, salary statistics, and trend reports that
            provide value to the luxury sector without compromising individual privacy.
          </p>
          <p className="mt-3">
            JOBLUX works with trusted third-party service providers who assist in operating the
            Platform. These providers process data on our behalf and under our instructions, subject
            to appropriate data processing agreements. Our current service providers include:
          </p>
          <ul className="mt-3 list-disc list-inside space-y-1">
            <li><strong>Supabase</strong> — database hosting and authentication services</li>
            <li><strong>Vercel</strong> — application hosting and deployment</li>
            <li><strong>Google</strong> — authentication (OAuth), analytics (when configured)</li>
            <li><strong>LinkedIn</strong> — authentication (OAuth), profile verification</li>
          </ul>
          <p className="mt-3">
            We may also disclose your data where required by law, regulation, legal process, or
            governmental request, or where we believe disclosure is necessary to protect the rights,
            safety, or property of JOBLUX, its Members, or the public.
          </p>
        </section>

        {/* ── 6. Data Retention ── */}
        <section id="data-retention">
          <h2 className="jl-serif text-2xl font-semibold mb-4">6. Data Retention</h2>
          <p>
            Your personal data is retained for as long as your account remains active on the Platform.
            We retain your data to provide you with our services, to comply with our legal
            obligations, to resolve disputes, and to enforce our agreements.
          </p>
          <p className="mt-3">
            Upon account deletion, your personal data will be removed from our active systems within
            thirty (30) days. During this period, your data may be retained to process the deletion
            request, handle any outstanding matters, and ensure the integrity of our systems.
          </p>
          <p className="mt-3">
            Anonymised Contributions (such as salary data and interview experiences that have been
            stripped of personally identifying information) will be retained indefinitely, as they form
            part of the collective knowledge base of the Society and cannot be attributed to any
            individual.
          </p>
          <p className="mt-3">
            Backup copies of data may be retained for up to ninety (90) days following deletion to
            ensure system resilience and disaster recovery. After this period, all backup copies
            containing your personal data will be securely destroyed.
          </p>
          <p className="mt-3">
            Messages and communications exchanged through the Platform, including recruitment-related
            correspondence, are retained for a period of two (2) years from the date of the
            communication. This retention period ensures continuity in recruitment processes and
            compliance with applicable regulations.
          </p>
        </section>

        {/* ── 7. Your Rights (GDPR) ── */}
        <section id="your-rights">
          <h2 className="jl-serif text-2xl font-semibold mb-4">7. Your Rights (GDPR)</h2>
          <p>
            Under the General Data Protection Regulation, you have the following rights regarding
            your personal data:
          </p>
          <p className="mt-3">
            <strong>Right of access:</strong> You have the right to request a copy of the personal
            data we hold about you. We will provide this information in a structured, commonly used,
            and machine-readable format.
          </p>
          <p className="mt-3">
            <strong>Right to rectification:</strong> You have the right to request correction of any
            inaccurate or incomplete personal data we hold about you. You can update most of your
            profile information directly through your account settings.
          </p>
          <p className="mt-3">
            <strong>Right to erasure:</strong> You have the right to request the deletion of your
            personal data, subject to certain exceptions (such as data we are required to retain by
            law). This is also known as the "right to be forgotten."
          </p>
          <p className="mt-3">
            <strong>Right to restriction:</strong> You have the right to request that we restrict the
            processing of your personal data in certain circumstances, such as when you contest the
            accuracy of the data or object to our processing.
          </p>
          <p className="mt-3">
            <strong>Right to data portability:</strong> You have the right to receive the personal
            data you have provided to us in a structured, commonly used, and machine-readable format,
            and to transmit that data to another controller without hindrance.
          </p>
          <p className="mt-3">
            <strong>Right to object:</strong> You have the right to object to the processing of your
            personal data where we rely on legitimate interest as the legal basis, including profiling
            based on legitimate interest.
          </p>
          <p className="mt-3">
            <strong>Right to withdraw consent:</strong> Where processing is based on your consent,
            you have the right to withdraw that consent at any time, without affecting the lawfulness
            of processing based on consent before its withdrawal.
          </p>
          <p className="mt-3">
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:hello@joblux.com" className="underline">
              hello@joblux.com
            </a>
            . We will respond to your request within thirty (30) days. If your request is complex or
            we receive a high volume of requests, we may extend this period by an additional sixty
            (60) days, in which case we will inform you of the extension and the reasons for it.
          </p>
        </section>

        {/* ── 8. Data Security ── */}
        <section id="data-security">
          <h2 className="jl-serif text-2xl font-semibold mb-4">8. Data Security</h2>
          <p>
            JOBLUX implements appropriate technical and organisational measures to protect your
            personal data against unauthorised access, alteration, disclosure, or destruction. We take
            the security of your data seriously and continuously review and improve our security
            practices.
          </p>
          <p className="mt-3">
            All data transmitted between your device and the Platform is encrypted using HTTPS
            (TLS/SSL). This ensures that your data is protected in transit and cannot be intercepted
            by third parties.
          </p>
          <p className="mt-3">
            We employ Row Level Security (RLS) policies on our database to ensure that users can only
            access data they are authorised to view. Access controls are enforced at the database
            level, providing a robust and reliable security layer independent of application logic.
          </p>
          <p className="mt-3">
            Access to personal data within JOBLUX is restricted to authorised personnel on a
            need-to-know basis. Administrative access is protected by multi-factor authentication and
            regularly audited.
          </p>
          <p className="mt-3">
            JOBLUX does not store passwords directly. Authentication is handled through secure OAuth
            providers (Google, LinkedIn) or through hashed and salted credentials managed by our
            authentication service provider (Supabase). We never have access to your plaintext
            passwords.
          </p>
        </section>

        {/* ── 9. Cookies & Tracking ── */}
        <section id="cookies">
          <h2 className="jl-serif text-2xl font-semibold mb-4">9. Cookies &amp; Tracking</h2>
          <p>
            JOBLUX uses only essential cookies that are strictly necessary for the operation of the
            Platform. These cookies enable core functionality such as authentication, session
            management, and security features. They cannot be disabled without affecting the
            functionality of the Platform.
          </p>
          <p className="mt-3">
            When configured, we may use Google Analytics 4 (GA4) to collect anonymised usage data for
            the purpose of understanding how Members interact with the Platform and improving the user
            experience. GA4 data is aggregated and does not identify individual users. If GA4 is
            enabled, appropriate consent mechanisms will be implemented in accordance with GDPR and
            ePrivacy requirements.
          </p>
          <p className="mt-3">
            JOBLUX does not use advertising cookies, tracking pixels, or any third-party marketing
            trackers. We do not engage in cross-site tracking, behavioural advertising, or retargeting.
            Your browsing activity on the Platform is not shared with advertisers or ad networks.
          </p>
          <p className="mt-3">
            You can manage cookie preferences through your browser settings. Please note that
            disabling essential cookies may prevent certain features of the Platform from functioning
            correctly.
          </p>
        </section>

        {/* ── 10. International Transfers ── */}
        <section id="international-transfers">
          <h2 className="jl-serif text-2xl font-semibold mb-4">10. International Transfers</h2>
          <p>
            As JOBLUX uses service providers based in various jurisdictions, your personal data may
            be transferred to and processed in countries outside the European Economic Area (EEA).
            Where such transfers occur, we ensure that appropriate safeguards are in place to protect
            your data in accordance with GDPR requirements.
          </p>
          <p className="mt-3">
            International data transfers are governed by Standard Contractual Clauses (SCCs) approved
            by the European Commission, which provide contractual guarantees that your data receives
            an adequate level of protection regardless of where it is processed.
          </p>
          <p className="mt-3">
            Where available, we rely on adequacy decisions issued by the European Commission, which
            recognise that certain countries provide an adequate level of data protection comparable
            to that within the EEA. We regularly review and update our transfer mechanisms to ensure
            compliance with the latest regulatory guidance.
          </p>
          <p className="mt-3">
            You may request further information about the specific safeguards applied to international
            transfers of your personal data by contacting us at hello@joblux.com.
          </p>
        </section>

        {/* ── 11. Children ── */}
        <section id="children">
          <h2 className="jl-serif text-2xl font-semibold mb-4">11. Children</h2>
          <p>
            The Platform is intended exclusively for individuals who are at least eighteen (18) years
            of age. JOBLUX does not knowingly collect, process, or store personal data from children
            under the age of 18.
          </p>
          <p className="mt-3">
            If we become aware that we have inadvertently collected personal data from a person under
            18, we will take immediate steps to delete that data from our systems. If you believe that
            a minor has provided personal data to JOBLUX, please contact us immediately at
            hello@joblux.com so that we can take appropriate action.
          </p>
          <p className="mt-3">
            Parents and guardians are encouraged to monitor the online activities of minors in their
            care and to contact us if they have any concerns about data that may have been submitted
            by a minor.
          </p>
        </section>

        {/* ── 12. Changes to This Policy ── */}
        <section id="changes">
          <h2 className="jl-serif text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
          <p>
            JOBLUX reserves the right to update or modify this Privacy Policy at any time. When we
            make material changes, we will notify Members through the Platform, via email, or through
            The Brief newsletter. The "Last updated" date at the top of this Policy will be revised to
            reflect the date of the most recent changes.
          </p>
          <p className="mt-3">
            Your continued use of the Platform following the posting of an updated Privacy Policy
            constitutes your acceptance of the changes. If you do not agree with the revised Policy,
            you should stop using the Platform and may request deletion of your account and personal
            data.
          </p>
          <p className="mt-3">
            We encourage you to review this Privacy Policy periodically to stay informed about how we
            collect, use, and protect your personal data. For significant changes that affect the way
            we process your data, we will endeavour to provide advance notice and, where required by
            law, seek your renewed consent.
          </p>
        </section>

        {/* ── 13. Contact & Complaints ── */}
        <section id="contact">
          <h2 className="jl-serif text-2xl font-semibold mb-4">13. Contact &amp; Complaints</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or the
            processing of your personal data, please contact our data controller:
          </p>
          <p className="mt-3">
            <strong>Mohammed M'zaour</strong><br />
            JOBLUX — Data Controller<br />
            Paris, France<br />
            Email:{' '}
            <a href="mailto:hello@joblux.com" className="underline">
              hello@joblux.com
            </a>
          </p>
          <p className="mt-3">
            We are committed to resolving any complaints or concerns you may have about our data
            practices. We will respond to your enquiry within thirty (30) days and work with you to
            reach a satisfactory resolution.
          </p>
          <p className="mt-3">
            If you are not satisfied with our response, or if you believe that your data protection
            rights have been violated, you have the right to lodge a complaint with a supervisory
            authority. In France, the competent supervisory authority is the Commission Nationale de
            l'Informatique et des Libertés (CNIL):
          </p>
          <p className="mt-3">
            <strong>CNIL</strong><br />
            3 Place de Fontenoy, TSA 80715<br />
            75334 Paris Cedex 07, France<br />
            Website:{' '}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              www.cnil.fr
            </a>
          </p>
          <p className="mt-3">
            While we encourage you to contact us first so that we can address your concerns directly,
            you may exercise your right to lodge a complaint with the CNIL at any time.
          </p>
        </section>
      </div>

      {/* ── Footer Links ── */}
      <div className="mt-16 pt-8 border-t border-[#e8e2d8] flex gap-6 text-sm text-[#888]">
        <Link href="/terms" className="underline hover:text-[#a58e28] transition-colors">
          Terms of Service
        </Link>
        <Link href="/faq" className="underline hover:text-[#a58e28] transition-colors">
          FAQ
        </Link>
      </div>
    </div>
    </div>
    </main>
  )
}
