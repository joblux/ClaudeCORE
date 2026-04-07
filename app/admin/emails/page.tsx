'use client'

import { useState, useEffect } from 'react'
import { Mail, Eye, Send, Check, X, Loader2 } from 'lucide-react'

interface Template {
  key: string
  subject: string
}

const TEMPLATE_GROUPS: { label: string; templates: string[] }[] = [
  {
    label: 'Auth',
    templates: ['magic_link', 'email_verification'],
  },
  {
    label: 'Onboarding',
    templates: ['welcome_approval', 'registration_declined'],
  },
  {
    label: 'Contributions',
    templates: ['contribution_submitted', 'contribution_approved', 'contribution_rejected'],
  },
  {
    label: 'Recruitment',
    templates: ['application_confirmation', 'recruitment_update'],
  },
  {
    label: 'Escape',
    templates: ['escape_consultation'],
  },
  {
    label: 'Support',
    templates: ['contact_confirmation'],
  },
  {
    label: 'Admin Alerts',
    templates: ['admin_new_member', 'admin_new_contribution', 'admin_new_application', 'admin_new_escape', 'admin_new_contact'],
  },
  {
    label: 'Newsletter',
    templates: ['the_brief'],
  },
]

const TEMPLATE_LABELS: Record<string, string> = {
  magic_link: '1. Magic Link Sign-In',
  email_verification: '2. Email Verification',
  welcome_approval: '3. Welcome on Approval',
  registration_declined: '4. Registration Declined',
  contribution_submitted: '5. Contribution Submitted',
  contribution_approved: '6. Contribution Approved',
  contribution_rejected: '7. Contribution Rejected',
  application_confirmation: '8. Application Confirmation',
  recruitment_update: '9. Recruitment Update',
  escape_consultation: '10. Escape Consultation',
  contact_confirmation: '11. Contact Confirmation',
  admin_new_member: '12. New Member Alert',
  admin_new_contribution: '13. New Contribution Alert',
  admin_new_application: '14. New Application Alert',
  admin_new_escape: '15. New Escape Alert',
  admin_new_contact: '16. New Contact Alert',
  the_brief: '17. The Brief (Newsletter)',
}

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [sending, setSending] = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<Record<string, 'success' | 'error'>>({})

  useEffect(() => {
    fetch('/api/admin/emails')
      .then(r => r.json())
      .then(data => setTemplates(data.templates || []))
      .catch(() => {})
  }, [])

  const handlePreview = async (key: string) => {
    setSelectedTemplate(key)
    setPreviewHtml('')
    const res = await fetch(`/api/admin/emails?template=${key}`)
    const html = await res.text()
    setPreviewHtml(html)
  }

  const handleSendTest = async (key: string) => {
    setSending(key)
    setSendResult(prev => { const n = { ...prev }; delete n[key]; return n })
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: key }),
      })
      if (res.ok) {
        setSendResult(prev => ({ ...prev, [key]: 'success' }))
      } else {
        setSendResult(prev => ({ ...prev, [key]: 'error' }))
      }
    } catch {
      setSendResult(prev => ({ ...prev, [key]: 'error' }))
    }
    setSending(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Mail size={20} className="text-[#B8975C]" />
        <h1 className="text-xl font-semibold text-[#1a1a1a]">Email Templates</h1>
        <span className="text-xs text-[#999] bg-gray-100 px-2 py-0.5 rounded">
          {templates.length} templates
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template list */}
        <div className="space-y-4">
          {TEMPLATE_GROUPS.map(group => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.templates.map(key => {
                  const template = templates.find(t => t.key === key)
                  const isActive = selectedTemplate === key
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isActive
                          ? 'border-[#B8975C] bg-[#B8975C]/5'
                          : 'border-[#e8e8e8] hover:border-gray-300 bg-[#f5f5f5]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#1a1a1a] truncate">
                          {TEMPLATE_LABELS[key] || key}
                        </div>
                        {template && (
                          <div className="text-xs text-[#999] truncate mt-0.5">
                            {template.subject}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                        <button
                          onClick={() => handlePreview(key)}
                          className="p-1.5 text-[#999] hover:text-[#1a1a1a] hover:bg-[#fafafa] rounded transition-colors"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleSendTest(key)}
                          disabled={sending === key}
                          className="p-1.5 text-[#999] hover:text-[#B8975C] hover:bg-[#B8975C]/10 rounded transition-colors disabled:opacity-50"
                          title="Send test to alex@joblux.com"
                        >
                          {sending === key ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : sendResult[key] === 'success' ? (
                            <Check size={14} className="text-green-500" />
                          ) : sendResult[key] === 'error' ? (
                            <X size={14} className="text-red-500" />
                          ) : (
                            <Send size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Preview panel */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {selectedTemplate ? (
            <div className="border border-[#e8e8e8] rounded-lg overflow-hidden bg-[#f5f5f5]">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-[#e8e8e8]">
                <span className="text-xs font-medium text-[#999]">
                  Preview: {TEMPLATE_LABELS[selectedTemplate] || selectedTemplate}
                </span>
                <button
                  onClick={() => handleSendTest(selectedTemplate)}
                  disabled={sending === selectedTemplate}
                  className="text-xs text-[#B8975C] hover:text-[#96753e] font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  {sending === selectedTemplate ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  Send test
                </button>
              </div>
              <div className="relative" style={{ height: '70vh' }}>
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  title="Email preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center text-[#999]">
              <Eye size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Click Preview on any template to see it here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
