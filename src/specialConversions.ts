import type { Analyte } from './data'

export type SpecialConversionResult = {
  value: number
  formula: string
  sourceName: string
  sourceUrl: string
  note?: string
}

type SpecialRule = {
  analyteId: string
  from: string
  to: string
  forward: (value: number) => number
  reverse: (value: number) => number
  forwardFormula: string
  reverseFormula: string
  sourceName: string
  sourceUrl: string
  note?: string
}

const unit = (code: string, label = code) => ({ code, label })

export const specialAnalytes: Analyte[] = [
  {
    id: 'bun',
    name: 'Blood urea nitrogen (BUN)',
    category: 'General chemistry',
    aliases: ['bun', 'urea nitrogen'],
    defaultFrom: 'mg/dL',
    defaultTo: 'mmol/L',
    commonUnits: [unit('mg/dL'), unit('mmol/L', 'mmol/L (urea)')],
    note: 'Convention-based BUN conversion. The mmol/L result represents urea concentration, not nitrogen mass concentration.'
  },
  {
    id: 'triglycerides',
    name: 'Triglycerides',
    category: 'Lipids',
    aliases: ['tg', 'triglyceride'],
    defaultFrom: 'mg/dL',
    defaultTo: 'mmol/L',
    commonUnits: [unit('mg/dL'), unit('mmol/L')],
    note: 'Uses the conventional clinical triglyceride conversion factor rather than a single molecular weight.'
  },
  {
    id: 'hba1c',
    name: 'HbA1c (NGSP ↔ IFCC)',
    category: 'Diabetes',
    aliases: ['a1c', 'hba1c', 'glycated hemoglobin'],
    defaultFrom: '%',
    defaultTo: 'mmol/mol',
    commonUnits: [unit('%', 'NGSP %'), unit('mmol/mol', 'IFCC mmol/mol')],
    note: 'NGSP and IFCC values are linked by the published master equation; this is not a dimensional UCUM conversion.'
  },
  {
    id: 'uacr',
    name: 'Urine albumin/creatinine ratio (uACR)',
    category: 'Urine',
    aliases: ['uacr', 'acr', 'albumin creatinine ratio'],
    defaultFrom: 'mg/g',
    defaultTo: 'mg/mmol',
    commonUnits: [unit('mg/g', 'mg/g creatinine'), unit('mg/mmol', 'mg/mmol creatinine')],
    note: 'The unit conversion uses the creatinine denominator conversion. Clinical albuminuria categories should still follow the reporting guideline used by the laboratory.'
  },
  {
    id: 'upcr',
    name: 'Urine protein/creatinine ratio (uPCR)',
    category: 'Urine',
    aliases: ['upcr', 'pcr', 'protein creatinine ratio'],
    defaultFrom: 'mg/g',
    defaultTo: 'mg/mmol',
    commonUnits: [unit('mg/g', 'mg/g creatinine'), unit('mg/mmol', 'mg/mmol creatinine')],
    note: 'KDIGO gives 0.113 as the exact mg/g creatinine to mg/mmol creatinine conversion factor.'
  }
]

const rules: SpecialRule[] = [
  {
    analyteId: 'bun',
    from: 'mg/dL',
    to: 'mmol/L',
    forward: (value) => value * 0.357,
    reverse: (value) => value / 0.357,
    forwardFormula: 'mmol/L urea = BUN mg/dL × 0.357',
    reverseFormula: 'BUN mg/dL = mmol/L urea ÷ 0.357',
    sourceName: 'CDC NHANES Biochemistry Profile',
    sourceUrl: 'https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/BIOPRO_L.htm'
  },
  {
    analyteId: 'triglycerides',
    from: 'mg/dL',
    to: 'mmol/L',
    forward: (value) => value * 0.01129,
    reverse: (value) => value / 0.01129,
    forwardFormula: 'mmol/L = mg/dL × 0.01129',
    reverseFormula: 'mg/dL = mmol/L ÷ 0.01129',
    sourceName: 'CDC NHANES Triglycerides',
    sourceUrl: 'https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2011/DataFiles/TRIGLY_G.htm'
  },
  {
    analyteId: 'hba1c',
    from: '%',
    to: 'mmol/mol',
    forward: (value) => (value - 2.152) / 0.09148,
    reverse: (value) => (0.09148 * value) + 2.152,
    forwardFormula: 'IFCC mmol/mol = (NGSP % − 2.152) ÷ 0.09148',
    reverseFormula: 'NGSP % = (0.09148 × IFCC mmol/mol) + 2.152',
    sourceName: 'NGSP IFCC Standardization',
    sourceUrl: 'https://ngsp.org/ifcc.asp'
  },
  {
    analyteId: 'uacr',
    from: 'mg/g',
    to: 'mg/mmol',
    forward: (value) => value * 0.113,
    reverse: (value) => value / 0.113,
    forwardFormula: 'mg/mmol = mg/g × 0.113',
    reverseFormula: 'mg/g = mg/mmol ÷ 0.113',
    sourceName: 'KDIGO 2024',
    sourceUrl: 'https://kdigo.org/wp-content/uploads/2024/01/KDIGO-2024-CKD-Guideline.pdf'
  },
  {
    analyteId: 'upcr',
    from: 'mg/g',
    to: 'mg/mmol',
    forward: (value) => value * 0.113,
    reverse: (value) => value / 0.113,
    forwardFormula: 'mg/mmol = mg/g × 0.113',
    reverseFormula: 'mg/g = mg/mmol ÷ 0.113',
    sourceName: 'KDIGO 2024',
    sourceUrl: 'https://kdigo.org/wp-content/uploads/2024/01/KDIGO-2024-CKD-Guideline.pdf'
  }
]

export function hasSpecialConversion(analyteId: string): boolean {
  return rules.some((rule) => rule.analyteId === analyteId)
}

export function convertSpecial(
  analyteId: string,
  value: number,
  fromUnit: string,
  toUnit: string,
): SpecialConversionResult | null {
  if (fromUnit === toUnit && hasSpecialConversion(analyteId)) {
    const rule = rules.find((item) => item.analyteId === analyteId)!
    return {
      value,
      formula: 'Same reporting unit; value unchanged.',
      sourceName: rule.sourceName,
      sourceUrl: rule.sourceUrl,
      note: rule.note,
    }
  }

  const rule = rules.find((item) => item.analyteId === analyteId && (
    (item.from === fromUnit && item.to === toUnit) ||
    (item.from === toUnit && item.to === fromUnit)
  ))

  if (!rule) return null

  const forward = rule.from === fromUnit && rule.to === toUnit
  return {
    value: forward ? rule.forward(value) : rule.reverse(value),
    formula: forward ? rule.forwardFormula : rule.reverseFormula,
    sourceName: rule.sourceName,
    sourceUrl: rule.sourceUrl,
    note: rule.note,
  }
}
