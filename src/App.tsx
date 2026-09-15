import { useMemo, useState } from 'react'
import { UcumLhcUtils, type UcumMessage } from '@lhncbc/ucum-lhc'
import { analyteCategories, analytes, type Analyte, type UnitOption } from './data'
import { convertSpecial, hasSpecialConversion, specialAnalytes } from './specialConversions'
import './styles.css'
import './special.css'

const ucum = UcumLhcUtils.getInstance()
const CUSTOM_UNIT = '__custom__'
const allAnalytes: Analyte[] = [...analytes, ...specialAnalytes]
const allCategories = Array.from(new Set([...analyteCategories, ...specialAnalytes.map((item) => item.category)]))

function msgText(message: UcumMessage): string {
  const text = typeof message === 'string' ? message : (message.message ?? message.msg ?? '')
  return text.replace(/<[^>]*>/g, '')
}

function pretty(value: number): string {
  const a = Math.abs(value)
  if ((a > 0 && a < 0.001) || a >= 1_000_000) return value.toExponential(6)
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 }).format(value)
}

function unitLabel(analyte: Analyte, code: string): string {
  return analyte.commonUnits.find((unit) => unit.code === code)?.label ?? code
}

type UnitPickerProps = {
  label: string
  units: UnitOption[]
  value: string
  custom: boolean
  allowCustom: boolean
  onValue: (value: string) => void
  onCustom: (custom: boolean) => void
}

function UnitPicker({ label, units, value, custom, allowCustom, onValue, onCustom }: UnitPickerProps) {
  return (
    <label className="input-group unit-picker">
      <span>{label}</span>
      <select
        className="field"
        value={custom ? CUSTOM_UNIT : value}
        onChange={(event) => {
          if (event.target.value === CUSTOM_UNIT) {
            onCustom(true)
            return
          }
          onCustom(false)
          onValue(event.target.value)
        }}
      >
        {units.map((unit) => (
          <option key={unit.code} value={unit.code}>{unit.label}</option>
        ))}
        {allowCustom ? <option value={CUSTOM_UNIT}>Custom UCUM…</option> : null}
      </select>
      {allowCustom && custom ? (
        <input
          className="field custom-unit"
          value={value}
          onChange={(event) => onValue(event.target.value)}
          placeholder="e.g. mg/(kg.d)"
          autoFocus
        />
      ) : null}
    </label>
  )
}

export default function App() {
  const [analyteId, setAnalyteId] = useState('glucose')
  const analyte = allAnalytes.find((x) => x.id === analyteId) ?? allAnalytes[0]
  const isSpecial = hasSpecialConversion(analyte.id)
  const [value, setValue] = useState('100')
  const [fromUnit, setFromUnit] = useState(analyte.defaultFrom)
  const [toUnit, setToUnit] = useState(analyte.defaultTo)
  const [fromCustom, setFromCustom] = useState(false)
  const [toCustom, setToCustom] = useState(false)

  const result = useMemo(() => {
    const number = Number(value)
    if (!Number.isFinite(number)) return { kind: 'empty' as const }
    if (!fromUnit.trim() || !toUnit.trim()) return { kind: 'empty' as const }

    if (hasSpecialConversion(analyte.id)) {
      const converted = convertSpecial(analyte.id, number, fromUnit.trim(), toUnit.trim())
      if (!converted) {
        return {
          kind: 'error' as const,
          message: 'This analyte uses an explicit clinical conversion rule. Choose one of the listed reporting units.',
        }
      }
      return {
        kind: 'success' as const,
        mode: 'special' as const,
        value: converted.value,
        fromCode: fromUnit,
        toCode: toUnit,
        formula: converted.formula,
        sourceName: converted.sourceName,
        sourceUrl: converted.sourceUrl,
        note: converted.note,
      }
    }

    const from = ucum.validateUnitString(fromUnit.trim(), true)
    const to = ucum.validateUnitString(toUnit.trim(), true)
    if (from.status !== 'valid' || to.status !== 'valid') {
      const messages = [...(from.msg ?? []), ...(to.msg ?? [])].map(msgText).filter(Boolean)
      return { kind: 'error' as const, message: messages.join(' ') || 'Check the UCUM unit expressions.' }
    }

    const converted = ucum.convertUnitTo(fromUnit.trim(), number, toUnit.trim(), {
      suggestions: true,
      molecularWeight: analyte.molecularWeight,
      charge: analyte.charge,
    })

    if (converted.status !== 'succeeded' || converted.toVal === null) {
      return {
        kind: 'error' as const,
        message: (converted.msg ?? []).map(msgText).filter(Boolean).join(' ') || 'These units are not convertible for the selected analyte.',
      }
    }

    return {
      kind: 'success' as const,
      mode: 'ucum' as const,
      value: converted.toVal,
      fromCode: from.ucumCode ?? fromUnit,
      toCode: to.ucumCode ?? toUnit,
    }
  }, [analyte, value, fromUnit, toUnit])

  const chooseAnalyte = (id: string) => {
    const next = allAnalytes.find((x) => x.id === id)
    if (!next) return
    setAnalyteId(id)
    setFromUnit(next.defaultFrom)
    setToUnit(next.defaultTo)
    setFromCustom(false)
    setToCustom(false)
  }

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setFromCustom(toCustom)
    setToCustom(fromCustom)
    if (result.kind === 'success') setValue(String(result.value))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark">L</div>
        <div>
          <div className="brand-title">LabTools</div>
          <div className="brand-subtitle">Clinical laboratory utilities</div>
        </div>
        <a className="github-link" href="https://github.com/fsysy/labtools" target="_blank" rel="noreferrer">GitHub ↗</a>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">UCUM-powered · explicit special rules</div>
          <h1>Laboratory unit conversion with clinically relevant unit choices.</h1>
          <p>
            Standard conversions use UCUM. Convention-based conversions such as BUN, triglycerides,
            HbA1c and urine creatinine ratios use separate published formulas instead of pretending
            they are ordinary dimensional conversions.
          </p>
        </section>

        <section className="workspace">
          <div className="panel converter-panel">
            <div className="section-heading">
              <div><span className="step">1</span><h2>Select analyte</h2></div>
              <span className={`badge ${isSpecial ? 'special-badge' : ''}`}>{isSpecial ? 'Published formula' : analyte.category}</span>
            </div>

            <select className="field analyte-select" value={analyteId} onChange={(e) => chooseAnalyte(e.target.value)}>
              {allCategories.map((category) => (
                <optgroup key={category} label={category}>
                  {allAnalytes.filter((item) => item.category === category).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="analyte-meta">
              {isSpecial ? <span>Explicit conversion rule</span> : analyte.molecularWeight ? <span>MW {analyte.molecularWeight} g/mol</span> : <span>No molecular conversion</span>}
              {analyte.charge ? <span>|charge| {analyte.charge}</span> : null}
            </div>

            <div className="common-unit-strip" aria-label="Common units for selected analyte">
              <strong>Common units</strong>
              <div>
                {analyte.commonUnits.map((unit) => <span key={unit.code}>{unit.label}</span>)}
              </div>
            </div>

            <div className="section-heading value-heading"><div><span className="step">2</span><h2>Enter value & units</h2></div></div>
            <div className="conversion-grid">
              <label className="input-group value-input">
                <span>Value</span>
                <input className="field numeric" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
              </label>

              <UnitPicker
                label="From"
                units={analyte.commonUnits}
                value={fromUnit}
                custom={fromCustom}
                allowCustom={!isSpecial}
                onValue={setFromUnit}
                onCustom={setFromCustom}
              />

              <button className="swap" type="button" onClick={swap} aria-label="Swap units">⇄</button>

              <UnitPicker
                label="To"
                units={analyte.commonUnits}
                value={toUnit}
                custom={toCustom}
                allowCustom={!isSpecial}
                onValue={setToUnit}
                onCustom={setToCustom}
              />
            </div>
            <p className="unit-hint">
              {isSpecial
                ? 'This analyte uses a published conversion formula, so only the validated reporting-unit pair is offered.'
                : 'The dropdown shows analyte-specific common units. Choose Custom UCUM for any other valid UCUM expression.'}
            </p>
          </div>

          <aside className={`panel result-panel ${result.kind}`}>
            <div className="section-heading"><div><span className="step">3</span><h2>Result</h2></div></div>
            {result.kind === 'success' ? <>
              <div className="result-value">{pretty(result.value)}</div>
              <div className="result-unit">{unitLabel(analyte, toUnit)}</div>
              <div className="equation">{value} {unitLabel(analyte, fromUnit)} = {pretty(result.value)} {unitLabel(analyte, toUnit)}</div>

              {result.mode === 'special' ? (
                <div className="formula-box">
                  <strong>Published conversion rule</strong>
                  <code>{result.formula}</code>
                  <a href={result.sourceUrl} target="_blank" rel="noreferrer">Source: {result.sourceName} ↗</a>
                </div>
              ) : (
                <div className="verified-box"><strong>UCUM validated</strong><span>{result.fromCode} → {result.toCode}</span></div>
              )}

              {result.mode === 'special' && result.note ? <p className="rule-note">{result.note}</p> : null}
            </> : result.kind === 'error' ? <div className="error-box"><strong>Conversion unavailable</strong><p>{result.message}</p></div> : <div className="empty-state">Enter a numeric value and valid units to calculate.</div>}
            {analyte.note ? <p className="clinical-note">{analyte.note}</p> : null}
          </aside>
        </section>

        <section className="principles">
          <div><strong>UCUM when appropriate</strong><span>Ordinary unit scaling and dimensional conversions remain on the NLM UCUM engine.</span></div>
          <div><strong>Published special rules</strong><span>BUN, triglycerides, HbA1c and urine creatinine ratios are routed through explicit formulas with visible sources.</span></div>
          <div><strong>No silent guessing</strong><span>D-dimer FEU↔DDU and other assay-dependent conventions stay excluded until a clearly scoped rule is added.</span></div>
        </section>

        <section className="notice"><strong>Clinical-use note.</strong> This is an engineering prototype. Independently validate conversion results before use in reporting or patient care. Reference intervals remain separate because they are method-, population-, age-, and sex-dependent.</section>
      </main>
      <footer>LabTools v0.3 · UCUM + explicit clinical conversion rules · Open source</footer>
    </div>
  )
}
