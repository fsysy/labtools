import { UcumLhcUtils } from '@lhncbc/ucum-lhc'
import type { Analyte } from './data'

const ucum = UcumLhcUtils.getInstance()

export type BiologicalSex = 'male' | 'female' | 'unspecified'
export type SpecimenChoice = 'serum' | 'plasma' | 'unspecified'
export type SpecimenCode = 'serum' | 'plasma' | 'both'

export type ReferenceInterval = {
  analyteId: string
  ageMinDays: number
  ageMaxDays: number
  ageLabel: string
  sex: 'male' | 'female' | 'any'
  lower: number
  upper: number
  unit: string
  specimen: string
  specimenCode: SpecimenCode
  loinc?: string
  note?: string
}

export const RCPA_SOURCE = {
  name: 'RCPA — Harmonised reference intervals for chemical pathology',
  url: 'https://www.rcpa.edu.au/Manuals/RCPA-Manual/General-Information/IG/Table-6-Harmonised-reference-intervals-for-chem',
  scope: 'Paediatric and adult serum/plasma harmonised intervals from RCPA Table 6. RCPA states these intervals are intended for laboratories using methods traceable to JCTLM-listed reference materials/methods/services, except where noted.',
}

// RCPA Table 6 publishes age interpretation in days. Upper bounds here are exclusive.
// 18 y = day 6574, 19 y = day 6939, 20 y = day 7305, 22 y = day 8035, 60 y = day 21915.
// We preserve the published age/sex/specimen partitions and do not extrapolate across gaps.
export const referenceIntervals: ReferenceInterval[] = [
  // Sodium
  { analyteId: 'sodium', ageMinDays: 0, ageMaxDays: 7, ageLabel: '0 d to <1 w', sex: 'any', lower: 132, upper: 147, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2951-2' },
  { analyteId: 'sodium', ageMinDays: 7, ageMaxDays: 6574, ageLabel: '1 w to <18 y', sex: 'any', lower: 133, upper: 144, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2951-2' },
  { analyteId: 'sodium', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'any', lower: 135, upper: 145, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2951-2' },

  // Potassium — paediatric serum and plasma intervals are explicitly different in RCPA Table 6.
  { analyteId: 'potassium', ageMinDays: 0, ageMaxDays: 7, ageLabel: '0 d to <1 w', sex: 'any', lower: 3.8, upper: 6.5, unit: 'mmol/L', specimen: 'Serum', specimenCode: 'serum', loinc: '2823-3', note: 'Paediatric serum interval.' },
  { analyteId: 'potassium', ageMinDays: 7, ageMaxDays: 182, ageLabel: '1 w to <26 w', sex: 'any', lower: 4.2, upper: 6.7, unit: 'mmol/L', specimen: 'Serum', specimenCode: 'serum', loinc: '2823-3', note: 'Paediatric serum interval.' },
  { analyteId: 'potassium', ageMinDays: 182, ageMaxDays: 730, ageLabel: '26 w to <2 y', sex: 'any', lower: 3.9, upper: 5.6, unit: 'mmol/L', specimen: 'Serum', specimenCode: 'serum', loinc: '2823-3', note: 'Paediatric serum interval.' },
  { analyteId: 'potassium', ageMinDays: 730, ageMaxDays: 6574, ageLabel: '2 y to <18 y', sex: 'any', lower: 3.6, upper: 5.3, unit: 'mmol/L', specimen: 'Serum', specimenCode: 'serum', loinc: '2823-3', note: 'Paediatric serum interval.' },
  { analyteId: 'potassium', ageMinDays: 0, ageMaxDays: 7, ageLabel: '0 d to <1 w', sex: 'any', lower: 3.5, upper: 6.2, unit: 'mmol/L', specimen: 'Plasma', specimenCode: 'plasma', loinc: '2823-3', note: 'Paediatric plasma interval.' },
  { analyteId: 'potassium', ageMinDays: 7, ageMaxDays: 182, ageLabel: '1 w to <26 w', sex: 'any', lower: 3.8, upper: 6.4, unit: 'mmol/L', specimen: 'Plasma', specimenCode: 'plasma', loinc: '2823-3', note: 'Paediatric plasma interval.' },
  { analyteId: 'potassium', ageMinDays: 182, ageMaxDays: 730, ageLabel: '26 w to <2 y', sex: 'any', lower: 3.5, upper: 5.4, unit: 'mmol/L', specimen: 'Plasma', specimenCode: 'plasma', loinc: '2823-3', note: 'Paediatric plasma interval.' },
  { analyteId: 'potassium', ageMinDays: 730, ageMaxDays: 6574, ageLabel: '2 y to <18 y', sex: 'any', lower: 3.3, upper: 4.9, unit: 'mmol/L', specimen: 'Plasma', specimenCode: 'plasma', loinc: '2823-3', note: 'Paediatric plasma interval.' },
  { analyteId: 'potassium', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'any', lower: 3.5, upper: 5.2, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2823-3', note: 'Laboratories testing only heparin plasma may choose a lower adult interval.' },

  // Chloride
  { analyteId: 'chloride', ageMinDays: 0, ageMaxDays: 7, ageLabel: '0 d to <1 w', sex: 'any', lower: 98, upper: 115, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2075-0' },
  { analyteId: 'chloride', ageMinDays: 7, ageMaxDays: 6574, ageLabel: '1 w to <18 y', sex: 'any', lower: 97, upper: 110, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2075-0' },
  { analyteId: 'chloride', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'any', lower: 95, upper: 110, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2075-0' },

  // Bicarbonate
  { analyteId: 'bicarbonate', ageMinDays: 0, ageMaxDays: 7, ageLabel: '0 d to <1 w', sex: 'any', lower: 15, upper: 28, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '1963-8' },
  { analyteId: 'bicarbonate', ageMinDays: 7, ageMaxDays: 730, ageLabel: '1 w to <2 y', sex: 'any', lower: 16, upper: 29, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '1963-8' },
  { analyteId: 'bicarbonate', ageMinDays: 730, ageMaxDays: 3652, ageLabel: '2 y to <10 y', sex: 'any', lower: 17, upper: 30, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '1963-8' },
  { analyteId: 'bicarbonate', ageMinDays: 3652, ageMaxDays: 6574, ageLabel: '10 y to <18 y', sex: 'any', lower: 20, upper: 32, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '1963-8' },
  { analyteId: 'bicarbonate', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'any', lower: 22, upper: 32, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '1963-8' },

  // Creatinine
  { analyteId: 'creatinine', ageMinDays: 0, ageMaxDays: 7, ageLabel: '0 d to <1 w', sex: 'any', lower: 22, upper: 93, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay.' },
  { analyteId: 'creatinine', ageMinDays: 7, ageMaxDays: 28, ageLabel: '1 w to <4 w', sex: 'any', lower: 17, upper: 50, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay.' },
  { analyteId: 'creatinine', ageMinDays: 28, ageMaxDays: 730, ageLabel: '4 w to <2 y', sex: 'any', lower: 11, upper: 36, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay.' },
  { analyteId: 'creatinine', ageMinDays: 730, ageMaxDays: 2191, ageLabel: '2 y to <6 y', sex: 'any', lower: 20, upper: 44, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay.' },
  { analyteId: 'creatinine', ageMinDays: 2191, ageMaxDays: 4383, ageLabel: '6 y to <12 y', sex: 'any', lower: 27, upper: 58, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay.' },
  { analyteId: 'creatinine', ageMinDays: 4383, ageMaxDays: 5478, ageLabel: '12 y to <15 y', sex: 'male', lower: 35, upper: 83, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay.' },
  { analyteId: 'creatinine', ageMinDays: 4383, ageMaxDays: 5478, ageLabel: '12 y to <15 y', sex: 'female', lower: 35, upper: 74, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay.' },
  { analyteId: 'creatinine', ageMinDays: 5478, ageMaxDays: 6939, ageLabel: '15 y to <19 y', sex: 'male', lower: 50, upper: 100, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay.' },
  { analyteId: 'creatinine', ageMinDays: 5478, ageMaxDays: 6939, ageLabel: '15 y to <19 y', sex: 'female', lower: 38, upper: 82, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay.' },
  { analyteId: 'creatinine', ageMinDays: 6939, ageMaxDays: 21915, ageLabel: '19 y to <60 y', sex: 'male', lower: 60, upper: 110, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay. Harmonised intervals are published to age <60 y; laboratories may elect to maintain them at older ages.' },
  { analyteId: 'creatinine', ageMinDays: 6939, ageMaxDays: 21915, ageLabel: '19 y to <60 y', sex: 'female', lower: 45, upper: 90, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14682-9', note: 'RCPA Table 6 specifies the Vitros enzymatic assay. Harmonised intervals are published to age <60 y; laboratories may elect to maintain them at older ages.' },

  // Calcium
  { analyteId: 'calcium', ageMinDays: 0, ageMaxDays: 7, ageLabel: '0 d to <1 w', sex: 'any', lower: 1.85, upper: 2.80, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2000-8' },
  { analyteId: 'calcium', ageMinDays: 7, ageMaxDays: 182, ageLabel: '1 w to <26 w', sex: 'any', lower: 2.20, upper: 2.80, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2000-8' },
  { analyteId: 'calcium', ageMinDays: 182, ageMaxDays: 730, ageLabel: '26 w to <2 y', sex: 'any', lower: 2.20, upper: 2.70, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2000-8' },
  { analyteId: 'calcium', ageMinDays: 730, ageMaxDays: 6574, ageLabel: '2 y to <18 y', sex: 'any', lower: 2.20, upper: 2.65, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2000-8' },
  { analyteId: 'calcium', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'any', lower: 2.10, upper: 2.60, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2000-8' },

  // Phosphate / phosphorus as P analyte preset uses mmol/L for amount concentration.
  { analyteId: 'phosphorus', ageMinDays: 0, ageMaxDays: 7, ageLabel: '0 d to <1 w', sex: 'any', lower: 1.25, upper: 2.85, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14879-1' },
  { analyteId: 'phosphorus', ageMinDays: 7, ageMaxDays: 28, ageLabel: '1 w to <4 w', sex: 'any', lower: 1.50, upper: 2.75, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14879-1' },
  { analyteId: 'phosphorus', ageMinDays: 28, ageMaxDays: 182, ageLabel: '4 w to <26 w', sex: 'any', lower: 1.45, upper: 2.50, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14879-1' },
  { analyteId: 'phosphorus', ageMinDays: 182, ageMaxDays: 365, ageLabel: '26 w to <1 y', sex: 'any', lower: 1.30, upper: 2.30, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14879-1' },
  { analyteId: 'phosphorus', ageMinDays: 365, ageMaxDays: 1461, ageLabel: '1 y to <4 y', sex: 'any', lower: 1.10, upper: 2.20, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14879-1' },
  { analyteId: 'phosphorus', ageMinDays: 1461, ageMaxDays: 5478, ageLabel: '4 y to <15 y', sex: 'any', lower: 0.90, upper: 2.00, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14879-1' },
  { analyteId: 'phosphorus', ageMinDays: 5478, ageMaxDays: 6574, ageLabel: '15 y to <18 y', sex: 'any', lower: 0.80, upper: 1.85, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14879-1' },
  { analyteId: 'phosphorus', ageMinDays: 6574, ageMaxDays: 7305, ageLabel: '18 y to <20 y', sex: 'any', lower: 0.75, upper: 1.65, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14879-1' },
  { analyteId: 'phosphorus', ageMinDays: 7305, ageMaxDays: 43830, ageLabel: '20 y to <120 y', sex: 'any', lower: 0.75, upper: 1.50, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14879-1' },

  // Magnesium
  { analyteId: 'magnesium', ageMinDays: 0, ageMaxDays: 7, ageLabel: '0 d to <1 w', sex: 'any', lower: 0.60, upper: 1.00, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2601-3' },
  { analyteId: 'magnesium', ageMinDays: 7, ageMaxDays: 6574, ageLabel: '1 w to <18 y', sex: 'any', lower: 0.65, upper: 1.10, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2601-3' },
  { analyteId: 'magnesium', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'any', lower: 0.70, upper: 1.10, unit: 'mmol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2601-3' },

  // Alkaline phosphatase
  { analyteId: 'alp', ageMinDays: 0, ageMaxDays: 7, ageLabel: '0 d to <1 w', sex: 'any', lower: 80, upper: 380, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 7, ageMaxDays: 28, ageLabel: '1 w to <4 w', sex: 'any', lower: 120, upper: 550, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 28, ageMaxDays: 182, ageLabel: '4 w to <26 w', sex: 'any', lower: 120, upper: 650, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 182, ageMaxDays: 730, ageLabel: '26 w to <2 y', sex: 'any', lower: 120, upper: 450, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 730, ageMaxDays: 2191, ageLabel: '2 y to <6 y', sex: 'any', lower: 120, upper: 370, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 2191, ageMaxDays: 3652, ageLabel: '6 y to <10 y', sex: 'any', lower: 120, upper: 440, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 3652, ageMaxDays: 5113, ageLabel: '10 y to <14 y', sex: 'male', lower: 130, upper: 530, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 5113, ageMaxDays: 5478, ageLabel: '14 y to <15 y', sex: 'male', lower: 105, upper: 480, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 5478, ageMaxDays: 6209, ageLabel: '15 y to <17 y', sex: 'male', lower: 80, upper: 380, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 6209, ageMaxDays: 6939, ageLabel: '17 y to <19 y', sex: 'male', lower: 50, upper: 220, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 6939, ageMaxDays: 8035, ageLabel: '19 y to <22 y', sex: 'male', lower: 45, upper: 150, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 3652, ageMaxDays: 4748, ageLabel: '10 y to <13 y', sex: 'female', lower: 100, upper: 460, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 4748, ageMaxDays: 5113, ageLabel: '13 y to <14 y', sex: 'female', lower: 70, upper: 330, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 5113, ageMaxDays: 5478, ageLabel: '14 y to <15 y', sex: 'female', lower: 50, upper: 280, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 5478, ageMaxDays: 5844, ageLabel: '15 y to <16 y', sex: 'female', lower: 45, upper: 170, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 5844, ageMaxDays: 8035, ageLabel: '16 y to <22 y', sex: 'female', lower: 35, upper: 140, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },
  { analyteId: 'alp', ageMinDays: 8035, ageMaxDays: 43830, ageLabel: '22 y to <120 y', sex: 'any', lower: 30, upper: 110, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '6768-6' },

  // Adult-only intervals retained from Table 6 where a paediatric harmonised interval is not encoded here.
  { analyteId: 'ldh', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'any', lower: 120, upper: 250, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14804-9', note: 'Lactate to pyruvate [L to P], IFCC method.' },
  { analyteId: 'total-protein', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'any', lower: 60, upper: 80, unit: 'g/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2885-2' },
  { analyteId: 'bilirubin', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'any', lower: 1, upper: 20, unit: 'umol/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '14631-6' },
  { analyteId: 'ck', ageMinDays: 6574, ageMaxDays: 21915, ageLabel: '18 y to <60 y', sex: 'male', lower: 45, upper: 250, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2157-6' },
  { analyteId: 'ck', ageMinDays: 21915, ageMaxDays: 43830, ageLabel: '60 y to <120 y', sex: 'male', lower: 40, upper: 200, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2157-6' },
  { analyteId: 'ck', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'female', lower: 30, upper: 150, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2157-6' },
  { analyteId: 'alt', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'male', lower: 5, upper: 40, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '1744-2', note: 'No pyridoxal 5-phosphate method.' },
  { analyteId: 'alt', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'female', lower: 5, upper: 35, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '1744-2', note: 'No pyridoxal 5-phosphate method.' },
  { analyteId: 'ast', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'male', lower: 5, upper: 35, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '1920-8', note: 'No pyridoxal 5-phosphate method.' },
  { analyteId: 'ast', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'female', lower: 5, upper: 30, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '1920-8', note: 'No pyridoxal 5-phosphate method.' },
  { analyteId: 'ggt', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'male', lower: 5, upper: 50, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2324-2' },
  { analyteId: 'ggt', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'female', lower: 5, upper: 35, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '2324-2' },
  { analyteId: 'lipase', ageMinDays: 6574, ageMaxDays: 43830, ageLabel: '18 y to <120 y', sex: 'any', lower: 10, upper: 60, unit: 'U/L', specimen: 'Serum or plasma', specimenCode: 'both', loinc: '3040-3', note: 'RCPA states this adult interval excludes Siemens Dimension and Ortho Clinical Vitros assays.' },
]

export function hasReferenceIntervals(analyteId: string): boolean {
  return referenceIntervals.some((interval) => interval.analyteId === analyteId)
}

function ageEligible(analyteId: string, ageDays: number): ReferenceInterval[] {
  return referenceIntervals.filter((interval) =>
    interval.analyteId === analyteId && ageDays >= interval.ageMinDays && ageDays < interval.ageMaxDays,
  )
}

export function needsSex(analyteId: string, ageDays: number): boolean {
  const eligible = ageEligible(analyteId, ageDays)
  return eligible.some((interval) => interval.sex !== 'any') && !eligible.some((interval) => interval.sex === 'any')
}

export function needsSpecimen(analyteId: string, ageDays: number): boolean {
  const eligible = ageEligible(analyteId, ageDays)
  if (eligible.some((interval) => interval.specimenCode === 'both')) return false
  const specific = new Set(eligible.map((interval) => interval.specimenCode))
  return specific.size > 1
}

export function findReferenceInterval(
  analyteId: string,
  ageDays: number,
  sex: BiologicalSex,
  specimen: SpecimenChoice,
): ReferenceInterval | null {
  let eligible = ageEligible(analyteId, ageDays)
  if (eligible.length === 0) return null

  const bothSpecimen = eligible.filter((interval) => interval.specimenCode === 'both')
  if (bothSpecimen.length > 0) {
    eligible = bothSpecimen
  } else {
    if (specimen === 'unspecified') return null
    eligible = eligible.filter((interval) => interval.specimenCode === specimen)
  }

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
