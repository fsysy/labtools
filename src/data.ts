export type Analyte = {
  id: string
  name: string
  aliases: string[]
  molecularWeight?: number
  charge?: number
  defaultFrom: string
  defaultTo: string
  note?: string
}

// Molecular weights are used only to bridge mass concentration and amount-of-substance
// concentration. Mixtures and convention-based measurands are intentionally excluded.
export const analytes: Analyte[] = [
  // General chemistry
  { id: 'glucose', name: 'Glucose', aliases: ['glu'], molecularWeight: 180.156, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },
  { id: 'creatinine', name: 'Creatinine', aliases: ['cr', 'crea'], molecularWeight: 113.12, defaultFrom: 'mg/dL', defaultTo: 'umol/L' },
  { id: 'urea', name: 'Urea', aliases: ['blood urea'], molecularWeight: 60.055, defaultFrom: 'mg/dL', defaultTo: 'mmol/L', note: 'This preset is for urea concentration, not BUN. BUN uses a different conventional conversion.' },
  { id: 'uric-acid', name: 'Uric acid', aliases: ['urate'], molecularWeight: 168.11, defaultFrom: 'mg/dL', defaultTo: 'umol/L' },
  { id: 'lactate', name: 'Lactate', aliases: ['lactic acid'], molecularWeight: 90.078, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },
  { id: 'ammonia', name: 'Ammonia', aliases: ['nh3'], molecularWeight: 17.031, defaultFrom: 'ug/dL', defaultTo: 'umol/L' },
  { id: 'bilirubin', name: 'Bilirubin', aliases: ['total bilirubin', 't-bil'], molecularWeight: 584.66, defaultFrom: 'mg/dL', defaultTo: 'umol/L', note: 'Applies to bilirubin mass concentration; interpretation depends on the reported measurand.' },
  { id: 'phosphorus', name: 'Phosphorus (as P)', aliases: ['phosphate', 'phos', 'p'], molecularWeight: 30.973762, defaultFrom: 'mg/dL', defaultTo: 'mmol/L', note: 'This preset treats the reported mass as elemental phosphorus (P), which is the common clinical chemistry convention.' },

  // Electrolytes / minerals
  { id: 'calcium', name: 'Calcium', aliases: ['ca'], molecularWeight: 40.078, charge: 2, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },
  { id: 'magnesium', name: 'Magnesium', aliases: ['mg'], molecularWeight: 24.305, charge: 2, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },
  { id: 'iron', name: 'Iron', aliases: ['fe'], molecularWeight: 55.845, charge: 2, defaultFrom: 'ug/dL', defaultTo: 'umol/L' },
  { id: 'sodium', name: 'Sodium', aliases: ['na'], molecularWeight: 22.989769, charge: 1, defaultFrom: 'mmol/L', defaultTo: 'meq/L' },
  { id: 'potassium', name: 'Potassium', aliases: ['k'], molecularWeight: 39.0983, charge: 1, defaultFrom: 'mmol/L', defaultTo: 'meq/L' },
  { id: 'chloride', name: 'Chloride', aliases: ['cl'], molecularWeight: 35.45, charge: 1, defaultFrom: 'mmol/L', defaultTo: 'meq/L' },

  // Lipids
  { id: 'cholesterol', name: 'Cholesterol, total', aliases: ['cholesterol', 'tc'], molecularWeight: 386.65, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },
  { id: 'hdl-cholesterol', name: 'HDL cholesterol', aliases: ['hdl', 'hdl-c'], molecularWeight: 386.65, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },
  { id: 'ldl-cholesterol', name: 'LDL cholesterol', aliases: ['ldl', 'ldl-c'], molecularWeight: 386.65, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },

  // Steroid hormones
  { id: 'testosterone', name: 'Testosterone', aliases: ['testo'], molecularWeight: 288.42, defaultFrom: 'ng/dL', defaultTo: 'nmol/L' },
  { id: 'estradiol', name: 'Estradiol (E2)', aliases: ['estradiol', 'e2'], molecularWeight: 272.38, defaultFrom: 'pg/mL', defaultTo: 'pmol/L' },
  { id: 'progesterone', name: 'Progesterone', aliases: ['p4'], molecularWeight: 314.46, defaultFrom: 'ng/mL', defaultTo: 'nmol/L' },
  { id: 'cortisol', name: 'Cortisol', aliases: ['hydrocortisone'], molecularWeight: 362.46, defaultFrom: 'ug/dL', defaultTo: 'nmol/L' },

  // Thyroid hormones
  { id: 't3', name: 'Triiodothyronine (T3)', aliases: ['t3', 'total t3'], molecularWeight: 650.97, defaultFrom: 'ng/dL', defaultTo: 'nmol/L', note: 'Use only when the reported measurand is T3 mass concentration; free-T3 assays are usually reported in different concentration units.' },
  { id: 't4', name: 'Thyroxine (T4)', aliases: ['t4', 'total t4'], molecularWeight: 776.87, defaultFrom: 'ug/dL', defaultTo: 'nmol/L', note: 'Use only when the reported measurand is T4 mass concentration; free-T4 assays are usually reported in different concentration units.' }
]

export const unitOptions = [
  'mg/dL', 'g/dL', 'g/L', 'mg/L',
  'ug/dL', 'ug/L', 'ug/mL',
  'ng/dL', 'ng/mL', 'ng/L',
  'pg/mL',
  'mol/L', 'mmol/L', 'umol/L', 'nmol/L', 'pmol/L',
  'meq/L', 'U/L', 'mU/L', '%'
]
