// ── Phone country codes + auto-detection ──
// Shared across all forms that collect phone numbers.

export const PHONE_CODES = [
  { code: '+1', label: '\u{1F1FA}\u{1F1F8} +1' },
  { code: '+44', label: '\u{1F1EC}\u{1F1E7} +44' },
  { code: '+33', label: '\u{1F1EB}\u{1F1F7} +33' },
  { code: '+49', label: '\u{1F1E9}\u{1F1EA} +49' },
  { code: '+39', label: '\u{1F1EE}\u{1F1F9} +39' },
  { code: '+34', label: '\u{1F1EA}\u{1F1F8} +34' },
  { code: '+41', label: '\u{1F1E8}\u{1F1ED} +41' },
  { code: '+32', label: '\u{1F1E7}\u{1F1EA} +32' },
  { code: '+31', label: '\u{1F1F3}\u{1F1F1} +31' },
  { code: '+46', label: '\u{1F1F8}\u{1F1EA} +46' },
  { code: '+971', label: '\u{1F1E6}\u{1F1EA} +971' },
  { code: '+966', label: '\u{1F1F8}\u{1F1E6} +966' },
  { code: '+212', label: '\u{1F1F2}\u{1F1E6} +212' },
  { code: '+213', label: '\u{1F1E9}\u{1F1FF} +213' },
  { code: '+216', label: '\u{1F1F9}\u{1F1F3} +216' },
  { code: '+20', label: '\u{1F1EA}\u{1F1EC} +20' },
  { code: '+86', label: '\u{1F1E8}\u{1F1F3} +86' },
  { code: '+81', label: '\u{1F1EF}\u{1F1F5} +81' },
  { code: '+91', label: '\u{1F1EE}\u{1F1F3} +91' },
  { code: '+55', label: '\u{1F1E7}\u{1F1F7} +55' },
  { code: '+52', label: '\u{1F1F2}\u{1F1FD} +52' },
  { code: '+61', label: '\u{1F1E6}\u{1F1FA} +61' },
  { code: '+27', label: '\u{1F1FF}\u{1F1E6} +27' },
  { code: '+82', label: '\u{1F1F0}\u{1F1F7} +82' },
  { code: '+65', label: '\u{1F1F8}\u{1F1EC} +65' },
  { code: '+852', label: '\u{1F1ED}\u{1F1F0} +852' },
  { code: '+7', label: '\u{1F1F7}\u{1F1FA} +7' },
  { code: '+90', label: '\u{1F1F9}\u{1F1F7} +90' },
  { code: '+48', label: '\u{1F1F5}\u{1F1F1} +48' },
  { code: '+351', label: '\u{1F1F5}\u{1F1F9} +351' },
  { code: '+30', label: '\u{1F1EC}\u{1F1F7} +30' },
  { code: '+43', label: '\u{1F1E6}\u{1F1F9} +43' },
  { code: '+353', label: '\u{1F1EE}\u{1F1EA} +353' },
  { code: '+45', label: '\u{1F1E9}\u{1F1F0} +45' },
  { code: '+47', label: '\u{1F1F3}\u{1F1F4} +47' },
  { code: '+358', label: '\u{1F1EB}\u{1F1EE} +358' },
  { code: '+974', label: '\u{1F1F6}\u{1F1E6} +974' },
  { code: '+973', label: '\u{1F1E7}\u{1F1ED} +973' },
  { code: '+968', label: '\u{1F1F4}\u{1F1F2} +968' },
  { code: '+965', label: '\u{1F1F0}\u{1F1FC} +965' },
]

/**
 * Detect phone country code from browser timezone.
 * No API call, no permissions, instant.
 * Falls back to +1 if detection fails.
 */
export function detectPhoneCode(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    const map: Record<string, string> = {
      'America/New_York': '+1', 'America/Chicago': '+1', 'America/Denver': '+1',
      'America/Los_Angeles': '+1', 'America/Toronto': '+1', 'America/Vancouver': '+1',
      'Europe/London': '+44', 'Europe/Paris': '+33', 'Europe/Berlin': '+49',
      'Europe/Rome': '+39', 'Europe/Madrid': '+34', 'Europe/Zurich': '+41',
      'Europe/Brussels': '+32', 'Europe/Amsterdam': '+31', 'Europe/Stockholm': '+46',
      'Europe/Lisbon': '+351', 'Europe/Athens': '+30', 'Europe/Vienna': '+43',
      'Europe/Dublin': '+353', 'Europe/Copenhagen': '+45', 'Europe/Oslo': '+47',
      'Europe/Helsinki': '+358', 'Europe/Warsaw': '+48', 'Europe/Istanbul': '+90',
      'Asia/Dubai': '+971', 'Asia/Riyadh': '+966', 'Asia/Qatar': '+974',
      'Asia/Bahrain': '+973', 'Asia/Muscat': '+968', 'Asia/Kuwait': '+965',
      'Africa/Casablanca': '+212', 'Africa/Algiers': '+213', 'Africa/Tunis': '+216',
      'Africa/Cairo': '+20', 'Africa/Johannesburg': '+27',
      'Asia/Shanghai': '+86', 'Asia/Hong_Kong': '+852', 'Asia/Tokyo': '+81',
      'Asia/Seoul': '+82', 'Asia/Singapore': '+65', 'Asia/Kolkata': '+91',
      'America/Sao_Paulo': '+55', 'America/Mexico_City': '+52',
      'Australia/Sydney': '+61', 'Australia/Melbourne': '+61',
      'Europe/Moscow': '+7',
    }
    // Exact match first
    if (map[tz]) return map[tz]
    // Prefix match
    for (const [prefix, code] of Object.entries(map)) {
      if (tz.startsWith(prefix.split('/')[0] + '/') && prefix.startsWith(tz.split('/')[0])) {
        // Same continent — use first match
      }
    }
    // Continent fallback
    if (tz.startsWith('Europe/')) return '+33'
    if (tz.startsWith('America/')) return '+1'
    if (tz.startsWith('Australia/')) return '+61'
    if (tz.startsWith('Asia/')) return '+971'
    if (tz.startsWith('Africa/')) return '+212'
  } catch {}
  return '+1'
}
