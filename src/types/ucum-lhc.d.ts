declare module '@lhncbc/ucum-lhc' {
  export type UcumMessage = string | { message?: string; msg?: string }
  export interface ValidationResult {
    status: 'valid' | 'invalid' | 'error'
    ucumCode: string | null
    msg?: UcumMessage[]
    unit?: { code?: string; name?: string; guidance?: string } | null
  }
  export interface ConversionResult {
    status: 'succeeded' | 'failed' | 'error'
    toVal: number | null
    msg?: UcumMessage[]
  }
  export interface ConvertOptions {
    suggestions?: boolean
    molecularWeight?: number
    charge?: number
  }
  export class UcumLhcUtils {
    static getInstance(): UcumLhcUtils
    validateUnitString(unit: string, suggest?: boolean): ValidationResult
    convertUnitTo(fromUnit: string, value: number, toUnit: string, options?: ConvertOptions): ConversionResult
  }
}
