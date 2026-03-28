import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('cv') as File | null
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const fileName = file.name.toLowerCase()
    const buffer = Buffer.from(await file.arrayBuffer())
    let rawText = ''

    if (fileName.endsWith('.pdf')) {
      const pdfParse = await import('pdf-parse')
      const parseFn = (pdfParse as any).default || pdfParse
      const parsed = await parseFn(buffer)
      rawText = parsed.text
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const mammoth = await import('mammoth')
      const extractFn = (mammoth as any).default?.extractRawText || mammoth.extractRawText
      const result = await extractFn({ buffer })
      rawText = result.value
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or Word document.' }, { status: 400 })
    }

    // Normalize whitespace
    const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

    // --- Extract fields using regex patterns ---

    // Job title detection
    const titlePatterns = [
      /(?:current\s+)?(?:job\s+)?title\s*[:\-–]\s*(.+)/i,
      /(?:position|role)\s*[:\-–]\s*(.+)/i,
    ]
    let currentJobTitle = ''
    for (const p of titlePatterns) {
      for (const line of lines) {
        const m = line.match(p)
        if (m) { currentJobTitle = m[1].trim(); break }
      }
      if (currentJobTitle) break
    }

    // Company detection
    const companyPatterns = [
      /(?:current\s+)?(?:company|employer|organisation|organization)\s*[:\-–]\s*(.+)/i,
      /(?:maison|brand)\s*[:\-–]\s*(.+)/i,
    ]
    let currentCompany = ''
    for (const p of companyPatterns) {
      for (const line of lines) {
        const m = line.match(p)
        if (m) { currentCompany = m[1].trim(); break }
      }
      if (currentCompany) break
    }

    // Experience blocks: "Title at/- Company (dates)" or "Company | Title | dates"
    const experiencePattern = /^(.+?)\s+(?:at|[-–—]|@)\s+(.+?)(?:\s*[|(]\s*(\w+\.?\s*\d{4}\s*[-–—]\s*(?:\w+\.?\s*\d{4}|present|current|ongoing))\s*[|)]?)?$/i
    const dateRangePattern = /(\w+\.?\s*\d{4})\s*[-–—]\s*(\w+\.?\s*\d{4}|present|current|ongoing)/i
    const positions: { title: string; company: string; dates: string }[] = []

    for (const line of lines) {
      const m = line.match(experiencePattern)
      if (m) {
        positions.push({ title: m[1].trim(), company: m[2].trim(), dates: m[3]?.trim() || '' })
      }
    }

    // If no current title/company found, try first position
    if (!currentJobTitle && positions.length > 0) currentJobTitle = positions[0].title
    if (!currentCompany && positions.length > 0) currentCompany = positions[0].company

    // Education
    const educationPattern = /^(.+?)\s*[,|–—-]\s*(.+?)(?:\s*[|(]\s*(\d{4}\s*[-–—]\s*\d{4})\s*[|)]?)?$/
    const educationKeywords = /university|college|school|institute|academy|MBA|bachelor|master|degree|diploma|bsc|msc|phd|bba/i
    const education: { institution: string; degree: string; dates: string }[] = []
    let inEducation = false

    for (const line of lines) {
      if (/^education/i.test(line)) { inEducation = true; continue }
      if (inEducation && /^(experience|skills|certif|language|interest|reference|hobby)/i.test(line)) { inEducation = false; continue }
      if (inEducation || educationKeywords.test(line)) {
        const m = line.match(educationPattern)
        if (m) {
          education.push({ institution: m[1].trim(), degree: m[2].trim(), dates: m[3]?.trim() || '' })
        }
      }
    }

    // Certifications
    const certifications: string[] = []
    let inCerts = false
    for (const line of lines) {
      if (/^certif/i.test(line)) { inCerts = true; continue }
      if (inCerts && /^(education|experience|skills|language|interest|reference|hobby)/i.test(line)) { inCerts = false; continue }
      if (inCerts && line.length > 3 && line.length < 200) {
        certifications.push(line)
      }
    }

    // Languages
    const languages: string[] = []
    let inLangs = false
    const langPattern = /\b(english|french|spanish|german|italian|portuguese|chinese|mandarin|cantonese|japanese|korean|arabic|russian|dutch|swedish|norwegian|danish|finnish|polish|turkish|hindi|bengali|thai|vietnamese|greek|hebrew|czech|hungarian|romanian|indonesian|malay|tagalog|swahili|persian|farsi|urdu)\b/gi
    for (const line of lines) {
      if (/^language/i.test(line)) { inLangs = true; continue }
      if (inLangs && /^(education|experience|skills|certif|interest|reference|hobby)/i.test(line)) { inLangs = false; continue }
      if (inLangs) {
        const found = line.match(langPattern)
        if (found) languages.push(...found.map(l => l.charAt(0).toUpperCase() + l.slice(1).toLowerCase()))
      }
    }
    // Also scan full text for languages if section not found
    if (languages.length === 0) {
      const allLangs = text.match(langPattern)
      if (allLangs) {
        const unique = [...new Set(allLangs.map(l => l.charAt(0).toUpperCase() + l.slice(1).toLowerCase()))]
        languages.push(...unique)
      }
    }

    return NextResponse.json({
      success: true,
      extracted: {
        currentJobTitle,
        currentCompany,
        positions: positions.slice(0, 10),
        education: education.slice(0, 5),
        certifications: certifications.slice(0, 10),
        languages: [...new Set(languages)].slice(0, 10),
      },
      rawTextLength: text.length,
    })
  } catch (err) {
    console.error('CV parse error:', err)
    return NextResponse.json({ error: 'Failed to parse document' }, { status: 500 })
  }
}
