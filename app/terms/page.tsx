import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | JOBLUX',
  description: 'Terms of service for JOBLUX, the luxury careers intelligence gateway.',
}

export default function TermsOfServicePage() {
  return (
    <main className="bg-[#1a1a1a] min-h-screen">
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
    <div className="bg-[#222] rounded-lg p-8 md:p-12 border border-[#333]">
      <p className="jl-overline-gold tracking-widest uppercase text-sm mb-4">Legal</p>
      <h1 className="jl-serif text-4xl md:text-5xl font-bold mb-4 text-white">Terms of Service</h1>
      <p className="text-[#999] mb-12">Last updated: March 2026</p>

      <div className="space-y-12 text-[#ccc] leading-relaxed text-[15px]">
        {/* ── 1. Introduction & Acceptance ── */}
        <section id="introduction">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">1. Introduction &amp; Acceptance</h2>
          <p>
            Welcome to JOBLUX, the luxury careers intelligence gateway. JOBLUX is a digital platform operated by
            Mohammed M&apos;zaour, based in Paris, France. These Terms of Service (&ldquo;Terms&rdquo;) govern your
            access to and use of the JOBLUX website, applications, and all related services
            (collectively, the &ldquo;Platform&rdquo;).
          </p>
          <p className="mt-3">
            By creating an account, accessing, or using any part of the Platform, you acknowledge that
            you have read, understood, and agree to be bound by these Terms in their entirety. If you
            do not agree to these Terms, you must not access or use the Platform.
          </p>
          <p className="mt-3">
            These Terms constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;)
            and JOBLUX (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). We reserve the right to update or modify these Terms at
            any time, and your continued use of the Platform following any such changes constitutes
            your acceptance of the revised Terms.
          </p>
          <p className="mt-3">
            JOBLUX is designed as a confidential intelligence gateway connecting exceptional talent with
            premier opportunities in the luxury sector. By joining, you agree to uphold the standards
            of professionalism and discretion that define our ecosystem.
          </p>
        </section>

        {/* ── 2. Definitions ── */}
        <section id="definitions">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">2. Definitions</h2>
          <p>
            Throughout these Terms, the following definitions apply:
          </p>
          <p className="mt-3">
            <strong className="text-white">&ldquo;Platform&rdquo;</strong> refers to the JOBLUX website, web application, mobile
            applications (if any), APIs, and all associated services, tools, and features made
            available by JOBLUX. This includes, without limitation, the careers intelligence, WikiLux,
            salary data, and all content hosted therein.
          </p>
          <p className="mt-3">
            <strong className="text-white">&ldquo;Opportunity&rdquo;</strong> refers to any career listing or
            professional engagement posted on the Platform, whether by JOBLUX, a verified employer, or
            a recruitment partner. Opportunities may include full-time positions, freelance
            engagements, consulting roles, and other professional arrangements.
          </p>
          <p className="mt-3">
            <strong className="text-white">&ldquo;Search Assignment&rdquo;</strong> refers to a recruitment engagement entrusted to JOBLUX
            by a luxury Maison or employer, in which JOBLUX acts as an intermediary to identify and
            present qualified candidates.
          </p>
          <p className="mt-3">
            <strong className="text-white">&ldquo;Contribution&rdquo;</strong> refers to any content, data, text, images, reviews,
            salary information, interview experiences, or other material submitted by a user to the
            Platform, including but not limited to WikiLux articles, BlogLux posts, salary reports,
            and interview feedback.
          </p>
          <p className="mt-3">
            <strong className="text-white">&ldquo;WikiLux&rdquo;</strong> refers to the collaborative knowledge base within JOBLUX where
            users contribute and access curated information about luxury Maisons, industry insights,
            and career intelligence.
          </p>
          <p className="mt-3">
            <strong className="text-white">&ldquo;BlogLux&rdquo;</strong> refers to the editorial and intelligence blog section of the
            Platform where users and the JOBLUX team publish articles, thought pieces, and industry
            commentary.
          </p>
          <p className="mt-3">
            <strong className="text-white">&ldquo;The Brief&rdquo;</strong> refers to the JOBLUX newsletter and curated content digest
            delivered to users, containing industry news, new opportunities, and platform updates.
          </p>
        </section>

        {/* ── 3. Registration & Access ── */}
        <section id="registration">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">3. Registration &amp; Access</h2>
          <p>
            JOBLUX operates on an application basis. Access to the Platform is not
            automatic; prospective users must submit an application that is reviewed and approved by the JOBLUX team. We maintain strict
            quality standards to ensure the integrity and exclusivity of the platform.
          </p>
          <p className="mt-3">
            You must be at least eighteen (18) years of age to register for and use the Platform. By
            creating an account, you represent and warrant that you are at least 18 years old and have
            the legal capacity to enter into these Terms. JOBLUX does not knowingly accept users
            under the age of 18.
          </p>
          <p className="mt-3">
            Each individual may hold only one (1) account on the Platform. Creating multiple accounts
            is strictly prohibited and may result in the immediate termination of all associated
            accounts. You are responsible for maintaining the confidentiality of your login credentials
            and for all activities that occur under your account.
          </p>
          <p className="mt-3">
            JOBLUX reserves the absolute right to reject any application at
            its sole discretion, without obligation to provide a reason. This right extends to
            applications that are incomplete, fraudulent, or that do not meet our standards.
          </p>
          <p className="mt-3">
            Users registering under the Business tier may be subject to
            additional verification procedures. This may include verification of corporate email
            addresses, professional profiles, employment history, or other professional credentials.
            JOBLUX reserves the right to request supporting documentation at any time to verify the
            accuracy of information provided during registration.
          </p>
        </section>

        {/* ── 4. The Platform | Free Against Contribution ── */}
        <section id="free-against-contribution">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">4. The Platform | Free Against Contribution</h2>
          <p>
            JOBLUX is offered free of charge to individual users. There are no subscription fees,
            recurring fees, or hidden costs for accessing the core features of the Platform. Our
            model is built on the principle of reciprocity: the Platform thrives because users
            contribute their knowledge, experiences, and insights back to the ecosystem.
          </p>
          <p className="mt-3">
            In exchange for free access, users are encouraged to actively contribute to the
            Platform. Contributions may take many forms, including but not limited to: sharing salary
            data, submitting interview experiences, writing WikiLux articles, publishing BlogLux
            posts, participating in discussions, and providing feedback on employers and opportunities.
          </p>
          <p className="mt-3">
            While contributions are encouraged rather than strictly mandatory, users who
            consistently benefit from the Platform without contributing may see their access to certain
            features adjusted. JOBLUX reserves the right to implement contribution thresholds or
            incentive systems to maintain a healthy balance of give and take within the platform.
          </p>
          <p className="mt-3">
            The free-against-contribution model ensures that JOBLUX remains accessible to all
            qualified luxury professionals, regardless of their financial situation. It also ensures
            that the data and insights on the Platform remain fresh, relevant, and uniquely valuable to
            the ecosystem.
          </p>
        </section>

        {/* ── 5. Content & Contributions ── */}
        <section id="content-contributions">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">5. Content &amp; Contributions</h2>
          <p>
            You retain ownership of all original content you submit to the Platform. By submitting a
            Contribution, you grant JOBLUX a worldwide, non-exclusive, royalty-free, perpetual, and
            irrevocable licence to use, reproduce, modify, adapt, publish, display, distribute, and
            create derivative works from your Contribution in connection with the operation and
            promotion of the Platform.
          </p>
          <p className="mt-3">
            Certain Contributions, particularly salary data and interview experiences, are
            automatically anonymized before being made visible to other users. JOBLUX employs
            technical and editorial measures to strip personally identifying information from such
            Contributions. However, you are responsible for ensuring that your submissions do not
            inadvertently reveal confidential or proprietary information belonging to third parties.
          </p>
          <p className="mt-3">
            All Contributions are subject to moderation. JOBLUX reserves the right to review, edit,
            refuse, or remove any Contribution at its sole discretion, including but not limited to
            content that is inaccurate, misleading, defamatory, offensive, or in violation of these
            Terms. Moderation may be performed by human reviewers, automated systems, or a combination
            of both.
          </p>
          <p className="mt-3">
            Contributions generated with the assistance of artificial intelligence (AI) tools are
            permitted, provided they are clearly identified as AI-assisted and meet the same quality
            and accuracy standards as human-authored content. JOBLUX reserves the right to label,
            flag, or remove AI-generated content that does not meet standards or that may
            mislead other users.
          </p>
          <p className="mt-3">
            You represent and warrant that you have all necessary rights, permissions, and consents to
            submit your Contributions and to grant the licence described above. You agree not to submit
            content that infringes the intellectual property rights, privacy rights, or any other
            rights of any third party.
          </p>
        </section>

        {/* ── 6. Recruitment Services ── */}
        <section id="recruitment-services">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">6. Recruitment Services</h2>
          <p>
            JOBLUX acts as a gatekeeper between luxury talent and employers. When you apply to an
            Opportunity or are identified as a potential candidate for a Search Assignment, JOBLUX
            serves as the intermediary. Your application materials, profile information, and
            candidature are presented to employers through JOBLUX, not directly.
          </p>
          <p className="mt-3">
            Users must not attempt to contact employers directly in connection with Opportunities
            listed on the Platform, unless explicitly authorized by JOBLUX. Similarly, employers and
            recruiters accessing the Platform must not contact users directly outside the channels
            provided by JOBLUX. This gatekeeper model exists to protect both parties and to ensure a
            curated, professional recruitment experience.
          </p>
          <p className="mt-3">
            JOBLUX does not guarantee employment, placement, or any specific outcome from using the
            Platform or applying to Opportunities. While we strive to match exceptional talent with
            exceptional roles, the hiring decision ultimately rests with the employer. JOBLUX shall not
            be held liable for any decisions made by employers or for the outcome of any recruitment
            process.
          </p>
          <p className="mt-3">
            Recruitment fees, where applicable, are charged exclusively to the employer or the party
            commissioning the Search Assignment. Users are never charged for applying to
            Opportunities, being presented to employers, or participating in the recruitment process.
            If any third party attempts to charge you a fee in connection with a JOBLUX Opportunity,
            please report it to us immediately at hello@joblux.com.
          </p>
        </section>

        {/* ── 7. Internship Listings ── */}
        <section id="internship-listings">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">7. Internship Listings</h2>
          <p>
            Internship listings on the Platform are available exclusively to users registered under
            the Business tier. Employers may post internship opportunities free of charge, subject to
            review and approval by the JOBLUX team. We reserve the right to reject or remove any
            internship listing that does not meet our quality or ethical standards.
          </p>
          <p className="mt-3">
            All internship listings are reviewed by JOBLUX before publication. This review process
            ensures that listings are complete, accurate, professionally presented, and in compliance
            with applicable laws and regulations. JOBLUX may request modifications to a listing before
            approving it for publication.
          </p>
          <p className="mt-3">
            Internship listings remain active on the Platform for a maximum period of ninety (90) days
            from the date of publication. After this period, listings are automatically archived unless
            the employer requests a renewal, subject to a fresh review. Employers are encouraged to
            update or remove listings promptly once a position has been filled.
          </p>
          <p className="mt-3">
            All internship listings must comply with applicable labour law, including but not limited
            to French labour law (Code du travail) regarding internship conventions (conventions de
            stage), minimum gratification, maximum duration, and working conditions. JOBLUX does not
            permit unpaid internship listings where local law requires compensation. Employers are
            solely responsible for ensuring that their internship programs comply with all applicable
            legal and regulatory requirements.
          </p>
        </section>

        {/* ── 8. Intellectual Property ── */}
        <section id="intellectual-property">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">8. Intellectual Property</h2>
          <p>
            The JOBLUX name, logo, brand identity, visual design, software, algorithms, databases,
            and all other intellectual property associated with the Platform are the exclusive property
            of JOBLUX and Mohammed M&apos;zaour. These are protected by applicable intellectual property
            laws, including copyright, trademark, and trade secret laws.
          </p>
          <p className="mt-3">
            You may not reproduce, distribute, modify, create derivative works of, publicly display,
            publicly perform, republish, download, store, or transmit any material from the Platform,
            except as expressly permitted by these Terms or with the prior written consent of JOBLUX.
          </p>
          <p className="mt-3">
            The aggregated data, curated insights, and structured information on the Platform,
            including salary benchmarks, interview intelligence, and employer profiles, represent
            significant intellectual property of JOBLUX. Systematic extraction, reproduction, or
            redistribution of this data is strictly prohibited.
          </p>
          <p className="mt-3">
            Any feedback, suggestions, or ideas you provide to JOBLUX regarding the Platform may be
            used by JOBLUX without restriction and without compensation to you. By submitting such
            feedback, you grant JOBLUX an unrestricted, perpetual, irrevocable, royalty-free licence
            to use and incorporate your feedback in any manner.
          </p>
        </section>

        {/* ── 9. Prohibited Conduct ── */}
        <section id="prohibited-conduct">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">9. Prohibited Conduct</h2>
          <p>
            Users and all visitors of the Platform agree not to engage in any of the following
            prohibited activities. Violation of these rules may result in immediate account
            termination, legal action, or both.
          </p>
          <p className="mt-3">
            <strong className="text-white">Scraping and automated access:</strong> You may not use bots, crawlers, scrapers,
            or any automated means to access, collect, or extract data from the Platform. This
            includes scraping user profiles, salary data, interview experiences, career listings, or
            any other content. All access must be through the interfaces provided by JOBLUX.
          </p>
          <p className="mt-3">
            <strong className="text-white">Sharing credentials:</strong> You may not share your login credentials, access
            tokens, or any other authentication information with any third party. Each account is
            personal and non-transferable. Sharing access to the Platform undermines its integrity and is grounds for immediate termination.
          </p>
          <p className="mt-3">
            <strong className="text-white">Harassment and misconduct:</strong> You may not harass, abuse, threaten, stalk,
            intimidate, or otherwise engage in harmful behavior towards other users, JOBLUX staff,
            or any third party through the Platform. This includes but is not limited to discriminatory
            language, unwanted solicitation, doxxing, and any form of bullying.
          </p>
          <p className="mt-3">
            <strong className="text-white">Circumventing the gatekeeper:</strong> You may not attempt to bypass, circumvent,
            or undermine the JOBLUX gatekeeper model. This includes contacting employers directly
            about Platform-listed Opportunities, sharing employer contact details obtained through the
            Platform with third parties, or facilitating direct connections that bypass JOBLUX
            intermediation. The gatekeeper model is fundamental to the trust and value of the platform.
          </p>
        </section>

        {/* ── 10. Account Termination ── */}
        <section id="account-termination">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">10. Account Termination</h2>
          <p>
            You may terminate your account at any time by contacting us at hello@joblux.com or
            through the account settings on the Platform. Upon termination, your access to the
            Platform will cease, and your personal data will be handled in accordance with our{' '}
            <Link href="/privacy" className="text-[#a58e28] hover:text-[#c4a830] transition-colors underline">Privacy Policy</Link>.
          </p>
          <p className="mt-3">
            JOBLUX reserves the right to suspend or terminate your account at any time, with or
            without notice, for any reason, including but not limited to: violation of these Terms,
            fraudulent activity, inactivity, conduct detrimental to the platform, or at the request of
            law enforcement or regulatory authorities.
          </p>
          <p className="mt-3">
            Upon termination, whether initiated by you or by JOBLUX, certain provisions of these
            Terms shall survive, including but not limited to: intellectual property rights, licence
            grants for Contributions, disclaimers, limitations of liability, and governing law
            provisions. Anonymized Contributions may be retained in accordance with our data retention
            policies.
          </p>
          <p className="mt-3">
            JOBLUX shall not be liable to you or any third party for any termination of your account
            or access to the Platform. If you believe your account has been terminated in error, you
            may contact us at hello@joblux.com to request a review.
          </p>
        </section>

        {/* ── 11. Disclaimers & Limitation of Liability ── */}
        <section id="disclaimers">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">11. Disclaimers &amp; Limitation of Liability</h2>
          <p>
            The Platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis, without warranties of any
            kind, whether express, implied, or statutory. JOBLUX disclaims all warranties, including
            but not limited to implied warranties of merchantability, fitness for a particular purpose,
            non-infringement, and accuracy of information.
          </p>
          <p className="mt-3">
            JOBLUX does not warrant that the Platform will be uninterrupted, secure, error-free, or
            free of viruses or other harmful components. We do not warrant the accuracy, completeness,
            or reliability of any content on the Platform, including user-submitted Contributions,
            salary data, interview experiences, and employer information.
          </p>
          <p className="mt-3">
            To the maximum extent permitted by applicable law, JOBLUX, its operator Mohammed M&apos;zaour,
            and their respective officers, directors, employees, agents, and affiliates shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages, including
            but not limited to loss of profits, data, use, goodwill, or other intangible losses,
            arising out of or in connection with your use of or inability to use the Platform.
          </p>
          <p className="mt-3">
            In no event shall the total liability of JOBLUX for all claims arising out of or relating
            to these Terms or the Platform exceed the amount of one hundred euros (EUR 100). This
            limitation applies regardless of the form of action, whether in contract, tort, strict
            liability, or otherwise.
          </p>
        </section>

        {/* ── 12. Governing Law ── */}
        <section id="governing-law">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of France,
            without regard to its conflict of law provisions. The application of the United Nations
            Convention on Contracts for the International Sale of Goods is expressly excluded.
          </p>
          <p className="mt-3">
            Any dispute arising out of or in connection with these Terms, including any question
            regarding their existence, validity, or termination, shall be submitted to the exclusive
            jurisdiction of the courts of Paris, France. By using the Platform, you consent to the
            personal and exclusive jurisdiction of the courts located in Paris, France.
          </p>
          <p className="mt-3">
            If any provision of these Terms is found to be invalid, illegal, or unenforceable by a
            court of competent jurisdiction, such invalidity, illegality, or unenforceability shall not
            affect the remaining provisions, which shall continue in full force and effect. The invalid
            provision shall be modified to the minimum extent necessary to make it valid and
            enforceable while preserving its original intent.
          </p>
        </section>

        {/* ── 13. Changes to Terms ── */}
        <section id="changes">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">13. Changes to Terms</h2>
          <p>
            JOBLUX reserves the right to modify, amend, or replace these Terms at any time at its sole
            discretion. When we make material changes, we will notify users through the Platform,
            via email, or through The Brief newsletter. The &ldquo;Last updated&rdquo; date at the top of these
            Terms will be revised accordingly.
          </p>
          <p className="mt-3">
            Your continued use of the Platform following the posting of revised Terms constitutes your
            acceptance of and agreement to the changes. If you do not agree with the revised Terms,
            you must stop using the Platform and terminate your account. It is your responsibility to
            review these Terms periodically for updates.
          </p>
          <p className="mt-3">
            For significant changes that materially affect your rights or obligations, JOBLUX will
            endeavor to provide at least thirty (30) days&apos; advance notice before the changes take
            effect. During this notice period, you may contact us with questions or concerns about
            the proposed changes.
          </p>
        </section>

        {/* ── 14. Travel Advisory Services ── */}
        <section id="travel-advisory">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">14. Travel Advisory Services</h2>
          <p>
            Travel advisory services featured on JOBLUX Escape are provided by independent advisors
            affiliated with Fora Travel, Inc. Joblux US LLC, registered in Delaware, is a media partner and does not provide, arrange,
            or guarantee any travel services.
          </p>
          <p className="mt-3">
            All bookings, itineraries, and travel arrangements are between the client and their Fora
            Travel advisor. JOBLUX facilitates the introduction and provides the platform for
            consultation requests, but bears no responsibility for the quality, outcome, or delivery
            of any travel services.
          </p>
          <p className="mt-3">
            Each advisor is independently licensed and insured through Fora Travel, Inc. For questions
            about travel services, clients should contact their assigned advisor directly.
          </p>
        </section>

        {/* ── 15. Contact ── */}
        <section id="contact">
          <h2 className="jl-serif text-2xl font-semibold mb-4 text-white">15. Contact</h2>
          <p>
            If you have any questions, concerns, or feedback regarding these Terms of Service or the
            Platform, please contact us:
          </p>
          <p className="mt-3">
            <strong className="text-white">JOBLUX</strong><br />
            Operated by Mohammed M&apos;zaour<br />
            Paris, France<br />
            Email:{' '}
            <a href="mailto:hello@joblux.com" className="text-[#a58e28] hover:text-[#c4a830] transition-colors underline">
              hello@joblux.com
            </a>
          </p>
          <p className="mt-3">
            We aim to respond to all enquiries within a reasonable timeframe. For urgent matters
            related to account security or abuse, please include &ldquo;URGENT&rdquo; in your email subject line.
          </p>
        </section>
      </div>

      {/* ── Footer Links ── */}
      <div className="mt-16 pt-8 border-t border-[#333] flex gap-6 text-sm text-[#777]">
        <Link href="/privacy" className="underline hover:text-[#a58e28] transition-colors">
          Privacy Policy
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
