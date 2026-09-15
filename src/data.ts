export type UnitOption = {
  code: string
  label: string
}

export type Analyte = {
  id: string
  name: string
  category: string
  aliases: string[]
  molecularWeight?: number
  charge?: number
  defaultFrom: string
  defaultTo: string
  commonUnits: UnitOption[]
  note?: string
}

const units = (...items: Array<[string, string?]>): UnitOption[] =>
  items.map(([code, label]) => ({ code, label: label ?? code }))

// Molecular weights are used only to bridge mass concentration and amount-of-substance
// concentration. Mixtures and convention-based measurands are intentionally excluded.
export const analytes: Analyte[] = [
  // General chemistry
  {
    id: 'glucose', name: 'Glucose', category: 'General chemistry', aliases: ['glu'],
    molecularWeight: 180.156, defaultFrom: 'mg/dL', defaultTo: 'mmol/L',
    commonUnits: units(['mg/dL'], ['mmol/L'], ['mg/L'], ['g/L'])
  },
  {
    id: 'creatinine', name: 'Creatinine', category: 'General chemistry', aliases: ['cr', 'crea'],
    molecularWeight: 113.12, defaultFrom: 'mg/dL', defaultTo: 'umol/L',
    commonUnits: units(['mg/dL'], ['umol/L', 'µmol/L'], ['mmol/L'], ['mg/L'])
  },
  {
    id: 'urea', name: 'Urea', category: 'General chemistry', aliases: ['blood urea'],
    molecularWeight: 60.055, defaultFrom: 'mg/dL', defaultTo: 'mmol/L',
    commonUnits: units(['mg/dL'], ['mmol/L'], ['mg/L']),
    note: 'This preset is for urea concentration, not BUN. BUN uses a different conventional conversion.'
  },
  {
    id: 'uric-acid', name: 'Uric acid', category: 'General chemistry', aliases: ['urate'],
    molecularWeight: 168.11, defaultFrom: 'mg/dL', defaultTo: 'umol/L',
    commonUnits: units(['mg/dL'], ['umol/L', 'µmol/L'], ['mmol/L'])
  },
  {
    id: 'lactate', name: 'Lactate', category: 'General chemistry', aliases: ['lactic acid'],
    molecularWeight: 90.078, defaultFrom: 'mg/dL', defaultTo: 'mmol/L',
    commonUnits: units(['mg/dL'], ['mmol/L'], ['umol/L', 'µmol/L'])
  },
  {
    id: 'ammonia', name: 'Ammonia', category: 'General chemistry', aliases: ['nh3'],
    molecularWeight: 17.031, defaultFrom: 'ug/dL', defaultTo: 'umol/L',
    commonUnits: units(['ug/dL', 'µg/dL'], ['umol/L', 'µmol/L'], ['ug/L', 'µg/L'])
  },
  {
    id: 'bilirubin', name: 'Bilirubin', category: 'General chemistry', aliases: ['total bilirubin', 't-bil'],
    molecularWeight: 584.66, defaultFrom: 'mg/dL', defaultTo: 'umol/L',
    commonUnits: units(['mg/dL'], ['umol/L', 'µmol/L'], ['mg/L']),
    note: 'Applies to bilirubin mass concentration; interpretation depends on the reported measurand.'
  },
  {
    id: 'phosphorus', name: 'Phosphorus (as P)', category: 'General chemistry', aliases: ['phosphate', 'phos', 'p'],
    molecularWeight: 30.973762, defaultFrom: 'mg/dL', defaultTo: 'mmol/L',
    commonUnits: units(['mg/dL'], ['mmol/L'], ['mg/L']),
    note: 'The mass unit is treated as elemental phosphorus (P), the usual clinical chemistry convention.'
  },
  {
    id: 'albumin', name: 'Albumin', category: 'General chemistry', aliases: ['alb'],
    defaultFrom: 'g/dL', defaultTo: 'g/L',
    commonUnits: units(['g/dL'], ['g/L'], ['mg/dL']),
    note: 'Only mass-concentration scaling is offered; no molecular conversion is used for albumin.'
  },
  {
    id: 'total-protein', name: 'Total protein', category: 'General chemistry', aliases: ['tp'],
    defaultFrom: 'g/dL', defaultTo: 'g/L',
    commonUnits: units(['g/dL'], ['g/L'], ['mg/dL'])
  },
  {
    id: 'crp', name: 'C-reactive protein (CRP)', category: 'General chemistry', aliases: ['crp'],
    defaultFrom: 'mg/L', defaultTo: 'mg/dL',
    commonUnits: units(['mg/L'], ['mg/dL'], ['ug/mL', 'µg/mL'])
  },
  {
    id: 'ferritin', name: 'Ferritin', category: 'General chemistry', aliases: ['ferritin'],
    defaultFrom: 'ng/mL', defaultTo: 'ug/L',
    commonUnits: units(['ng/mL'], ['ug/L', 'µg/L'])
  },

  // Electrolytes / minerals
  {
    id: 'calcium', name: 'Calcium', category: 'Electrolytes & minerals', aliases: ['ca'],
    molecularWeight: 40.078, charge: 2, defaultFrom: 'mg/dL', defaultTo: 'mmol/L',
    commonUnits: units(['mg/dL'], ['mmol/L'], ['meq/L', 'mEq/L'], ['mg/L'])
  },
  {
    id: 'magnesium', name: 'Magnesium', category: 'Electrolytes & minerals', aliases: ['mg'],
    molecularWeight: 24.305, charge: 2, defaultFrom: 'mg/dL', defaultTo: 'mmol/L',
    commonUnits: units(['mg/dL'], ['mmol/L'], ['meq/L', 'mEq/L'], ['mg/L'])
  },
  {
    id: 'iron', name: 'Iron', category: 'Electrolytes & minerals', aliases: ['fe'],
    molecularWeight: 55.845, charge: 2, defaultFrom: 'ug/dL', defaultTo: 'umol/L',
    commonUnits: units(['ug/dL', 'µg/dL'], ['umol/L', 'µmol/L'], ['ug/L', 'µg/L'])
  },
  {
    id: 'sodium', name: 'Sodium', category: 'Electrolytes & minerals', aliases: ['na'],
    molecularWeight: 22.989769, charge: 1, defaultFrom: 'mmol/L', defaultTo: 'meq/L',
    commonUnits: units(['mmol/L'], ['meq/L', 'mEq/L'])
  },
  {
    id: 'potassium', name: 'Potassium', category: 'Electrolytes & minerals', aliases: ['k'],
    molecularWeight: 39.0983, charge: 1, defaultFrom: 'mmol/L', defaultTo: 'meq/L',
    commonUnits: units(['mmol/L'], ['meq/L', 'mEq/L'])
  },
  {
    id: 'chloride', name: 'Chloride', category: 'Electrolytes & minerals', aliases: ['cl'],
    molecularWeight: 35.45, charge: 1, defaultFrom: 'mmol/L', defaultTo: 'meq/L',
    commonUnits: units(['mmol/L'], ['meq/L', 'mEq/L'])
  },
  {
    id: 'bicarbonate', name: 'Bicarbonate / total CO₂', category: 'Electrolytes & minerals', aliases: ['hco3', 'tco2'],
    charge: 1, defaultFrom: 'mmol/L', defaultTo: 'meq/L',
    commonUnits: units(['mmol/L'], ['meq/L', 'mEq/L'])
  },

  // Lipids
  {
    id: 'cholesterol', name: 'Cholesterol, total', category: 'Lipids', aliases: ['cholesterol', 'tc'],
    molecularWeight: 386.65, defaultFrom: 'mg/dL', defaultTo: 'mmol/L',
    commonUnits: units(['mg/dL'], ['mmol/L'], ['mg/L'])
  },
  {
    id: 'hdl-cholesterol', name: 'HDL cholesterol', category: 'Lipids', aliases: ['hdl', 'hdl-c'],
    molecularWeight: 386.65, defaultFrom: 'mg/dL', defaultTo: 'mmol/L',
    commonUnits: units(['mg/dL'], ['mmol/L'])
  },
  {
    id: 'ldl-cholesterol', name: 'LDL cholesterol', category: 'Lipids', aliases: ['ldl', 'ldl-c'],
    molecularWeight: 386.65, defaultFrom: 'mg/dL', defaultTo: 'mmol/L',
    commonUnits: units(['mg/dL'], ['mmol/L'])
  },

  // Enzymes
  ...['AST', 'ALT', 'ALP', 'GGT', 'LDH', 'CK', 'Amylase', 'Lipase'].map((name) => ({
    id: name.toLowerCase(), name, category: 'Enzymes', aliases: [name.toLowerCase()],
    defaultFrom: 'U/L', defaultTo: 'ukat/L',
    commonUnits: units(['U/L'], ['ukat/L', 'µkat/L'])
  })),

  // Hematology
  {
    id: 'wbc', name: 'WBC count', category: 'Hematology', aliases: ['wbc', 'leukocyte'],
    defaultFrom: '10*9/L', defaultTo: '10*3/uL',
    commonUnits: units(['10*9/L', '10⁹/L'], ['10*3/uL', '10³/µL'], ['/uL', '/µL'])
  },
  {
    id: 'platelet', name: 'Platelet count', category: 'Hematology', aliases: ['plt', 'platelet'],
    defaultFrom: '10*9/L', defaultTo: '10*3/uL',
    commonUnits: units(['10*9/L', '10⁹/L'], ['10*3/uL', '10³/µL'], ['/uL', '/µL'])
  },
  {
    id: 'rbc', name: 'RBC count', category: 'Hematology', aliases: ['rbc', 'erythrocyte'],
    defaultFrom: '10*12/L', defaultTo: '10*6/uL',
    commonUnits: units(['10*12/L', '10¹²/L'], ['10*6/uL', '10⁶/µL'])
  },
  {
    id: 'hemoglobin', name: 'Hemoglobin', category: 'Hematology', aliases: ['hgb', 'hb'],
    defaultFrom: 'g/dL', defaultTo: 'g/L',
    commonUnits: units(['g/dL'], ['g/L'])
  },
  {
    id: 'hematocrit', name: 'Hematocrit', category: 'Hematology', aliases: ['hct'],
    defaultFrom: '%', defaultTo: '1',
    commonUnits: units(['%', '%'], ['1', 'L/L (ratio)'])
  },
  {
    id: 'mcv', name: 'MCV', category: 'Hematology', aliases: ['mcv'],
    defaultFrom: 'fL', defaultTo: 'fL', commonUnits: units(['fL'])
  },
  {
    id: 'mch', name: 'MCH', category: 'Hematology', aliases: ['mch'],
    defaultFrom: 'pg', defaultTo: 'pg', commonUnits: units(['pg'])
  },
  {
    id: 'mchc', name: 'MCHC', category: 'Hematology', aliases: ['mchc'],
    defaultFrom: 'g/dL', defaultTo: 'g/L', commonUnits: units(['g/dL'], ['g/L'])
  },

  // Coagulation
  {
    id: 'fibrinogen', name: 'Fibrinogen', category: 'Coagulation', aliases: ['fib', 'fibrinogen'],
    defaultFrom: 'mg/dL', defaultTo: 'g/L', commonUnits: units(['mg/dL'], ['g/L'], ['mg/L'])
  },
  {
    id: 'pt', name: 'Prothrombin time (PT)', category: 'Coagulation', aliases: ['pt'],
    defaultFrom: 's', defaultTo: 's', commonUnits: units(['s', 'seconds'])
  },

  // Blood gas
  {
    id: 'pco2', name: 'pCO₂', category: 'Blood gas', aliases: ['pco2'],
    defaultFrom: 'mm[Hg]', defaultTo: 'kPa', commonUnits: units(['mm[Hg]', 'mmHg'], ['kPa'])
  },
  {
    id: 'po2', name: 'pO₂', category: 'Blood gas', aliases: ['po2'],
    defaultFrom: 'mm[Hg]', defaultTo: 'kPa', commonUnits: units(['mm[Hg]', 'mmHg'], ['kPa'])
  },

  // Osmolality
  {
    id: 'osmolality', name: 'Osmolality', category: 'Osmolality', aliases: ['osmolality'],
    defaultFrom: 'mosm/kg', defaultTo: 'osm/kg', commonUnits: units(['mosm/kg', 'mOsm/kg'], ['osm/kg', 'Osm/kg'])
  },

  // Steroid hormones
  {
    id: 'testosterone', name: 'Testosterone', category: 'Hormones', aliases: ['testo'],
    molecularWeight: 288.42, defaultFrom: 'ng/dL', defaultTo: 'nmol/L',
    commonUnits: units(['ng/dL'], ['ng/mL'], ['nmol/L'])
  },
  {
    id: 'estradiol', name: 'Estradiol (E2)', category: 'Hormones', aliases: ['estradiol', 'e2'],
    molecularWeight: 272.38, defaultFrom: 'pg/mL', defaultTo: 'pmol/L',
    commonUnits: units(['pg/mL'], ['pmol/L'], ['ng/L'])
  },
  {
    id: 'progesterone', name: 'Progesterone', category: 'Hormones', aliases: ['p4'],
    molecularWeight: 314.46, defaultFrom: 'ng/mL', defaultTo: 'nmol/L',
    commonUnits: units(['ng/mL'], ['nmol/L'], ['ug/L', 'µg/L'])
  },
  {
    id: 'cortisol', name: 'Cortisol', category: 'Hormones', aliases: ['hydrocortisone'],
    molecularWeight: 362.46, defaultFrom: 'ug/dL', defaultTo: 'nmol/L',
    commonUnits: units(['ug/dL', 'µg/dL'], ['nmol/L'], ['ug/L', 'µg/L'])
  },
  {
    id: 'tsh', name: 'TSH', category: 'Hormones', aliases: ['tsh'],
    defaultFrom: 'm[iU]/L', defaultTo: 'u[iU]/mL',
    commonUnits: units(['m[iU]/L', 'mIU/L'], ['u[iU]/mL', 'µIU/mL']),
    note: 'Activity units are converted by UCUM scaling only; no mass conversion is attempted.'
  },

  // Thyroid hormones
  {
    id: 't3', name: 'Triiodothyronine (T3), total', category: 'Thyroid', aliases: ['t3', 'total t3'],
    molecularWeight: 650.97, defaultFrom: 'ng/dL', defaultTo: 'nmol/L',
    commonUnits: units(['ng/dL'], ['nmol/L']),
    note: 'Use for total T3. Free-T3 usually uses pg/mL or pmol/L.'
  },
  {
    id: 'free-t3', name: 'Free T3', category: 'Thyroid', aliases: ['ft3', 'free t3'],
    molecularWeight: 650.97, defaultFrom: 'pg/mL', defaultTo: 'pmol/L',
    commonUnits: units(['pg/mL'], ['pmol/L'])
  },
  {
    id: 't4', name: 'Thyroxine (T4), total', category: 'Thyroid', aliases: ['t4', 'total t4'],
    molecularWeight: 776.87, defaultFrom: 'ug/dL', defaultTo: 'nmol/L',
    commonUnits: units(['ug/dL', 'µg/dL'], ['nmol/L'])
  },
  {
    id: 'free-t4', name: 'Free T4', category: 'Thyroid', aliases: ['ft4', 'free t4'],
    molecularWeight: 776.87, defaultFrom: 'ng/dL', defaultTo: 'pmol/L',
    commonUnits: units(['ng/dL'], ['pmol/L'])
  }
]

export const analyteCategories = Array.from(new Set(analytes.map((item) => item.category)))
