import { UcumLhcUtils } from '@lhncbc/ucum-lhc'
import type { Analyte } from './data'

const ucum = UcumLhcUtils.getInstance()

export type BiologicalSex = 'male' | 'female' | 'unspecified'

export type ReferenceInterval = {
  analyteId: string
  ageMinYears: number
  ageMaxYears: number
  sex: 'male' | 'female' | 'any'
  lower: number
  upper: number
  unit: string
  specimen: string
  loinc?: string
  note?: string
}

export const RCPA_SOURCE = {
  name: 'RCPA — Harmonised reference intervals for chemical pathology',
  url: 'https://www.rcpa.edu.au/Manuals/RCPA-Manual/General-Information/IG/Table-6-Harmonised-reference-intervals-for-chem',
  scope: 'Adult serum/plasma seed dataset. RCPA states these intervals are intended for laboratories using methods traceable to JCTLM-listed reference materials/methods/services, except where noted.',
}

// Adult subset of the current RCPA Table 6. Age upper bounds are exclusive.
// We intentionally do not extrapolate an interval beyond the age/method scope published by RCPA.
export const referenceIntervals: ReferenceInterval[] = [
  { analyteId: 'sodium', ageMinYears: 18, ageMaxYears: 120, sex: 'any', lower: 135, upper: 145, unit: 'mmol/L', specimen: 'Serum or plasma', loinc: '2951-2' },
  { analyteId: 'potassium', ageMinYears: 18, ageMaxYears: 120, sex: 'any', lower: 3.5, upper: 5.2, unit: 'mmol/L', specimen: 'Serum or plasma', loinc: '2823-3', note: 'Laboratories testing only heparin plasma may choose a lower interval.' },
  { analyteId: 'chloride', ageMinYears: 18, ageMaxYears: 120, sex: 'any', lower: 95, upper: 110, unit: 'mmol/L', specimen: 'Serum or plasma', loinc: '2075-0' },
  { analyteId: 'bicarbonate', ageMinYears: 18, ageMaxYears: 120, sex: 'any', lower: 22, upper: 32, unit: 'mmol/L', specimen: 'Serum or plasma', loinc: '1963-8' },

  { analyteId: 'creatinine', ageMinYears: 19, ageMaxYears: 60, sex: 'male', lower: 60, upper: 110, unit: 'umol/L', specimen: 'Serum or plasma', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay. Harmonised adult intervals are published to age <60 y; laboratories may elect to maintain them at older ages.' },
  { analyteId: 'creatinine', ageMinYears: 19, ageMaxYears: 60, sex: 'female', lower: 45, upper: 90, unit: 'umol/L', specimen: 'Serum or plasma', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay. Harmonised adult intervals are published to age <60 y; laboratories may elect to maintain them at older ages.' },

  { analyteId: 'calcium', ageMinYears: 18, ageMaxYears: 120, sex: 'any', lower: 2.10, upper: 2.60, unit: 'mmol/L', specimen: 'Serum or plasma', loinc: '2000-8' },
  { analyteId: 'phosphorus', ageMinYears: 18, ageMaxYears: 20, sex: 'any', lower: 0.75, upper: 1.65, unit: 'mmol/L', specimen: 'Serum or plasma', loinc: '14879-1' },
  { analyteId: 'phosphorus', ageMinYears: 20, ageMaxYears: 120, sex: 'any', lower: 0.75, upper: 1.50, unit: 'mmol/L', specimen: 'Serum or plasma', loinc: '14879-1' },
  { analyteId: 'magnesium', ageMinYears: 18, ageMaxYears: 120, sex: 'any', lower: 0.70, upper: 1.10, unit: 'mmol/L', specimen: 'Serum or plasma', loinc: '2601-3' },

  { analyteId: 'ldh', ageMinYears: 18, ageMaxYears: 120, sex: 'any', lower: 120, upper: 250, unit: 'U/L', specimen: 'Serum or plasma', loinc: '14804-9', note: 'Lactate to pyruvate [L to P], IFCC method.' },
  { analyteId: 'alp', ageMinYears: 18, ageMaxYears: 19, sex: 'male', lower: 50, upper: 220, unit: 'U/L', specimen: 'Serum or plasma', loinc: '6768-6' },
  { analyteId: 'alp', ageMinYears: 19, ageMaxYears: 22, sex: 'male', lower: 45, upper: 150, unit: 'U/L', specimen: 'Serum or plasma', loinc: '6768-6' },
  { analyteId: 'alp', ageMinYears: 18, ageMaxYears: 22, sex: 'female', lower: 35, upper: 140, unit: 'U/L', specimen: 'Serum or plasma', loinc: '6768-6' },
  { analyteId: 'alp', ageMinYears: 22, ageMaxYears: 120, sex: 'any', lower: 30, upper: 110, unit: 'U/L', specimen: 'Serum or plasma', loinc: '6768-6' },

  { analyteId: 'total-protein', ageMinYears: 18, ageMaxYears: 120, sex: 'any', lower: 60, upper: 80, unit: 'g/L', specimen: 'Serum or plasma', loinc: '2885-2' },
  { analyteId: 'bilirubin', ageMinYears: 18, ageMaxYears: 120, sex: 'any', lower: 1, upper: 20, unit: 'umol/L', specimen: 'Serum or plasma', loinc: '14631-6' },

  { analyteId: 'ck', ageMinYears: 18, ageMaxYears: 60, sex: 'male', lower: 45, upper: 250, unit: 'U/L', specimen: 'Serum or plasma', loinc: '2157-6' },
  { analyteId: 'ck', ageMinYears: 60, ageMaxYears: 120, sex: 'male', lower: 40, upper: 200, unit: 'U/L', specimen: 'Serum or plasma', loinc: '2157-6' },
  { analyteId: 'ck', ageMinYears: 18, ageMaxYears: 120, sex: 'female', lower: 30, upper: 150, unit: 'U/L', specimen: 'Serum or plasma', loinc: '2157-6' },

  { analyteId: 'alt', ageMinYears: 18, ageMaxYears: 120, sex: 'male', lower: 5, upper: 40, unit: 'U/L', specimen: 'Serum or plasma', loinc: '1744-2', note: 'No pyridoxal 5-phosphate method.' },
  { analyteId: 'alt', ageMinYears: 18, ageMaxYears: 120, sex: 'female', lower: 5, upper: 35, unit: 'U/L', specimen: 'Serum or plasma', loinc: '1744-2', note: 'No pyridoxal 5-phosphate method.' },
  { analyteId: 'ast', ageMinYears: 18, ageMaxYears: 120, sex: 'male', lower: 5, upper: 35, unit: 'U/L', specimen: 'Serum or plasma', loinc: '1920-8', note: 'No pyridoxal 5-phosphate method.' },
  { analyteId: 'ast', ageMinYears: 18, ageMaxYears: 120, sex: 'female', lower: 5, upper: 30, unit: 'U/L', specimen: 'Serum or plasma', loinc: '1920-8', note: 'No pyridoxal 5-phosphate method.' },
  { analyteId: 'ggt', ageMinYears: 18, ageMaxYears: 120, sex: 'male', lower: 5, upper: 50, unit: 'U/L', specimen: 'Serum or plasma', loinc: '2324-2' },
  { analyteId: 'ggt', ageMinYears: 18, ageMaxYears: 120, sex: 'female', lower: 5, upper: 35, unit: 'U/L', specimen: 'Serum or plasma', loinc: '2324-2' },

  { analyteId: 'lipase', ageMinYears: 18, ageMaxYears: 120, sex: 'any', lower: 10, upper: 60, unit: 'U/L', specimen: 'Serum or plasma', loinc: '3040-3', note: 'RCPA states this adult interval excludes Siemens Dimension and Ortho Clinical Vitros assays.' },
]

export function hasReferenceIntervals(analyteId: string): boolean {
  return referenceIntervals.some((interval) => interval.analyteId === analyteId)
}

export function needsSex(analyteId: string, ageYears: number): boolean {
  const eligible = referenceIntervals.filter((interval) =>
    interval.analyteId === analyteId && ageYears >= interval.ageMinYears && ageYears < interval.ageMaxYears,
  )
  return eligible.some((interval) => interval.sex !== 'any') && !eligible.some((interval) => interval.sex === 'any')
}

export function findReferenceInterval(analyteId: string, ageYears: number, sex: BiologicalSex): ReferenceInterval | null {
  const eligible = referenceIntervals.filter((interval) =>
    interval.analyteId === analyteId && ageYears >= interval.ageMinYears && ageYears < interval.ageMaxYears,
  )

  const anySex = eligible.find((interval) => interval.sex === 'any')
  if (anySex) return anySex
  if (sex === 'unspecified') return null
  return eligible.find((interval) => interval.sex === sex) ?? null
}

export type ConvertedReferenceInterval = ReferenceInterval & {
  displayLower: number
  displayUpper: number
  displayUnit: string
}

export function convertReferenceInterval(
  interval: ReferenceInterval,
  analyte: Analyte,
  targetUnit: string,
): ConvertedReferenceInterval | null {
  if (interval.unit === targetUnit) {
    return { ...interval, displayLower: interval.lower, displayUpper: interval.upper, displayUnit: targetUnit }
  }

  const options = {
    suggestions: false,
    molecularWeight: analyte.molecularWeight,
    charge: analyte.charge,
  }
  const low = ucum.convertUnitTo(interval.unit, interval.lower, targetUnit, options)
  const high = ucum.convertUnitTo(interval.unit, interval.upper, targetUnit, options)
  if (low.status !== 'succeeded' || high.status !== 'succeeded' || low.toVal === null || high.toVal === null) return null

  return {
    ...interval,
    displayLower: low.toVal,
    displayUpper: high.toVal,
    displayUnit: targetUnit,
  }
}

export type RangeStatus = 'low' | 'within' | 'high'

export function classifyAgainstRange(value: number, lower: number, upper: number): RangeStatus {
  if (value < lower) return 'low'
  if (value > upper) return 'high'
  return 'within'
}
