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

export const analytes: Analyte[] = [
  { id: 'glucose', name: 'Glucose', aliases: ['glu'], molecularWeight: 180.156, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },
  { id: 'creatinine', name: 'Creatinine', aliases: ['cr', 'crea'], molecularWeight: 113.12, defaultFrom: 'mg/dL', defaultTo: 'umol/L' },
  { id: 'uric-acid', name: 'Uric acid', aliases: ['urate'], molecularWeight: 168.11, defaultFrom: 'mg/dL', defaultTo: 'umol/L' },
  { id: 'cholesterol', name: 'Cholesterol', aliases: ['tc'], molecularWeight: 386.65, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },
  { id: 'bilirubin', name: 'Bilirubin', aliases: ['total bilirubin', 't-bil'], molecularWeight: 584.66, defaultFrom: 'mg/dL', defaultTo: 'umol/L', note: 'Applies to bilirubin mass concentration; interpretation depends on the reported measurand.' },
  { id: 'calcium', name: 'Calcium', aliases: ['ca'], molecularWeight: 40.078, charge: 2, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },
  { id: 'magnesium', name: 'Magnesium', aliases: ['mg'], molecularWeight: 24.305, charge: 2, defaultFrom: 'mg/dL', defaultTo: 'mmol/L' },
  { id: 'iron', name: 'Iron', aliases: ['fe'], molecularWeight: 55.845, charge: 2, defaultFrom: 'ug/dL', defaultTo: 'umol/L' },
  { id: 'sodium', name: 'Sodium', aliases: ['na'], molecularWeight: 22.989769, charge: 1, defaultFrom: 'mmol/L', defaultTo: 'meq/L' },
  { id: 'potassium', name: 'Potassium', aliases: ['k'], molecularWeight: 39.0983, charge: 1, defaultFrom: 'mmol/L', defaultTo: 'meq/L' },
  { id: 'chloride', name: 'Chloride', aliases: ['cl'], molecularWeight: 35.45, charge: 1, defaultFrom: 'mmol/L', defaultTo: 'meq/L' }
]

export const unitOptions = [
  'mg/dL','g/dL','g/L','ug/dL','ug/L','ng/mL','mmol/L','umol/L','nmol/L','mol/L','meq/L','U/L','mU/L','%'
]
