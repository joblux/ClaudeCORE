import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { ProfiLuxResolved } from '../types'

const GOLD = '#a58e28'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    color: '#111111',
    fontFamily: 'Helvetica',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
    paddingBottom: 14,
    marginBottom: 22,
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: '#111111',
  },
  headline: {
    marginTop: 6,
    fontSize: 11,
    color: '#444444',
  },
  contactRow: {
    marginTop: 8,
    fontSize: 9,
    color: '#666666',
  },
  zone: {
    marginBottom: 20,
  },
  zoneTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: GOLD,
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  block: {
    marginBottom: 10,
  },
  primary: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#111111',
  },
  secondary: {
    fontSize: 10,
    color: '#333333',
    marginTop: 2,
  },
  meta: {
    fontSize: 9,
    color: '#777777',
    marginTop: 2,
  },
  body: {
    fontSize: 10,
    color: '#333333',
    marginTop: 4,
    lineHeight: 1.4,
  },
  inline: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
  },
  bullet: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 3,
  },
})

function nonEmpty(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function joinDefined(parts: Array<string | null | undefined>, sep: string): string {
  return parts.filter(nonEmpty).join(sep)
}

function formatYearRange(start: string | null, end: string | null, isCurrent?: boolean): string {
  const s = nonEmpty(start) ? start.slice(0, 4) : ''
  const e = isCurrent ? 'Present' : nonEmpty(end) ? end.slice(0, 4) : ''
  if (s && e) return `${s} — ${e}`
  if (s) return s
  if (e) return e
  return ''
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null,
): string {
  if (min == null && max == null) return ''
  const cur = nonEmpty(currency) ? currency : ''
  if (min != null && max != null) return `${cur}${min.toLocaleString()} – ${max.toLocaleString()}`.trim()
  if (min != null) return `${cur}${min.toLocaleString()}+`.trim()
  return `up to ${cur}${(max as number).toLocaleString()}`.trim()
}

type Props = { view: ProfiLuxResolved }

export function ProfiLuxPDF({ view }: Props) {
  const fullName = joinDefined([view.first_name, view.last_name], ' ') || 'ProfiLux'
  const locationLine = joinDefined([view.city, view.country], ', ')
  const contact = joinDefined([view.email, view.phone, locationLine], '  ·  ')

  // Current Role
  const hasCurrentRole =
    nonEmpty(view.job_title) ||
    nonEmpty(view.current_employer) ||
    nonEmpty(view.seniority) ||
    view.total_years_experience != null ||
    view.years_in_luxury != null

  // Career Path
  const experiences = view.experiences ?? []
  const hasCareer = experiences.length > 0

  // Education
  const education = view.education ?? []
  const hasEducation = education.length > 0

  // Languages
  const languages = view.languages ?? []
  const hasLanguages = languages.length > 0

  // Expertise
  const expertiseTags = view.expertise_tags ?? []
  const keySkills = view.key_skills ?? []
  const sectors = view.sectors ?? []
  const productCategories = view.product_categories ?? []
  const hasExpertise =
    expertiseTags.length > 0 ||
    keySkills.length > 0 ||
    sectors.length > 0 ||
    productCategories.length > 0

  // Availability
  const availabilityLabel = nonEmpty(view.availability) ? view.availability : ''
  const desiredLocations = view.desired_locations ?? []
  const desiredDepartments = view.desired_departments ?? []
  const desiredContractTypes = view.desired_contract_types ?? []
  const salary = formatSalary(
    view.desired_salary_min,
    view.desired_salary_max,
    view.desired_salary_currency,
  )
  const hasAvailability =
    !!availabilityLabel ||
    desiredLocations.length > 0 ||
    desiredDepartments.length > 0 ||
    desiredContractTypes.length > 0 ||
    !!salary ||
    view.open_to_relocation === true

  // Maisons
  const maisons = view.brands_worked_with ?? []
  const hasMaisons = maisons.length > 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{fullName}</Text>
          {nonEmpty(view.headline) && <Text style={styles.headline}>{view.headline}</Text>}
          {!!contact && <Text style={styles.contactRow}>{contact}</Text>}
        </View>

        {hasCurrentRole && (
          <View style={styles.zone}>
            <Text style={styles.zoneTitle}>Current Role</Text>
            {nonEmpty(view.job_title) && <Text style={styles.primary}>{view.job_title}</Text>}
            {nonEmpty(view.current_employer) && (
              <Text style={styles.secondary}>{view.current_employer}</Text>
            )}
            {nonEmpty(view.seniority) && <Text style={styles.meta}>{view.seniority}</Text>}
            {(view.total_years_experience != null || view.years_in_luxury != null) && (
              <Text style={styles.meta}>
                {joinDefined(
                  [
                    view.total_years_experience != null
                      ? `${view.total_years_experience} yrs total`
                      : null,
                    view.years_in_luxury != null
                      ? `${view.years_in_luxury} yrs in luxury`
                      : null,
                  ],
                  '  ·  ',
                )}
              </Text>
            )}
          </View>
        )}

        {hasCareer && (
          <View style={styles.zone}>
            <Text style={styles.zoneTitle}>Career Path</Text>
            {experiences.map((exp, idx) => {
              const role = joinDefined([exp.job_title, exp.company], ' — ')
              const where = joinDefined([exp.city, exp.country], ', ')
              const dates = formatYearRange(exp.start_date, exp.end_date, exp.is_current)
              const metaLine = joinDefined([dates, where], '  ·  ')
              return (
                <View key={idx} style={styles.block}>
                  {!!role && <Text style={styles.primary}>{role}</Text>}
                  {!!metaLine && <Text style={styles.meta}>{metaLine}</Text>}
                  {nonEmpty(exp.description) && <Text style={styles.body}>{exp.description}</Text>}
                </View>
              )
            })}
          </View>
        )}

        {hasEducation && (
          <View style={styles.zone}>
            <Text style={styles.zoneTitle}>Education</Text>
            {education.map((ed, idx) => {
              const degreeLine = joinDefined([ed.degree_level, ed.field_of_study], ' · ')
              const where = joinDefined([ed.city, ed.country], ', ')
              const years =
                ed.start_year != null && ed.graduation_year != null
                  ? `${ed.start_year} — ${ed.graduation_year}`
                  : ed.graduation_year != null
                    ? `${ed.graduation_year}`
                    : ed.start_year != null
                      ? `${ed.start_year}`
                      : ''
              const metaLine = joinDefined([years, where], '  ·  ')
              return (
                <View key={idx} style={styles.block}>
                  {nonEmpty(ed.institution) && <Text style={styles.primary}>{ed.institution}</Text>}
                  {!!degreeLine && <Text style={styles.secondary}>{degreeLine}</Text>}
                  {!!metaLine && <Text style={styles.meta}>{metaLine}</Text>}
                </View>
              )
            })}
          </View>
        )}

        {hasLanguages && (
          <View style={styles.zone}>
            <Text style={styles.zoneTitle}>Languages</Text>
            <Text style={styles.inline}>
              {languages
                .map((l) =>
                  nonEmpty(l.proficiency) ? `${l.language} (${l.proficiency})` : l.language,
                )
                .join(', ')}
            </Text>
          </View>
        )}

        {hasExpertise && (
          <View style={styles.zone}>
            <Text style={styles.zoneTitle}>Expertise</Text>
            {expertiseTags.length > 0 && (
              <Text style={styles.inline}>{expertiseTags.join(', ')}</Text>
            )}
            {keySkills.length > 0 && (
              <Text style={[styles.inline, { marginTop: 4 }]}>{keySkills.join(', ')}</Text>
            )}
            {sectors.length > 0 && (
              <Text style={[styles.meta, { marginTop: 6 }]}>Sectors: {sectors.join(', ')}</Text>
            )}
            {productCategories.length > 0 && (
              <Text style={styles.meta}>Categories: {productCategories.join(', ')}</Text>
            )}
          </View>
        )}

        {hasAvailability && (
          <View style={styles.zone}>
            <Text style={styles.zoneTitle}>Availability</Text>
            {!!availabilityLabel && <Text style={styles.primary}>{availabilityLabel}</Text>}
            {desiredLocations.length > 0 && (
              <Text style={styles.meta}>Locations: {desiredLocations.join(', ')}</Text>
            )}
            {desiredDepartments.length > 0 && (
              <Text style={styles.meta}>Departments: {desiredDepartments.join(', ')}</Text>
            )}
            {desiredContractTypes.length > 0 && (
              <Text style={styles.meta}>Contract: {desiredContractTypes.join(', ')}</Text>
            )}
            {!!salary && <Text style={styles.meta}>Compensation: {salary}</Text>}
            {view.open_to_relocation === true && (
              <Text style={styles.meta}>Open to relocation</Text>
            )}
          </View>
        )}

        {hasMaisons && (
          <View style={styles.zone}>
            <Text style={styles.zoneTitle}>Maisons</Text>
            <Text style={styles.inline}>{maisons.join(', ')}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}

export default ProfiLuxPDF
