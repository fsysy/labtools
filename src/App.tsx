import { useMemo, useState } from 'react'
import { UcumLhcUtils, type UcumMessage } from '@lhncbc/ucum-lhc'
import { analyteCategories, analytes, type Analyte, type UnitOption } from './data'
import './styles.css'

const ucum = UcumLhcUtils.getInstance()
const CUSTOM_UNIT = '__custom__'

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
  onValue: (value: string) => void
  onCustom: (custom: boolean) => void
}

function UnitPicker({ label, units, value, custom, onValue, onCustom }: UnitPickerProps) {
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
        <option value={CUSTOM_UNIT}>Custom UCUM…</option>
      </select>
      {custom ? (
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
  const analyte = analytes.find((x) => x.id === analyteId) ?? analytes[0]
  const [value, setValue] = useState('100')
  const [fromUnit, setFromUnit] = useState(analyte.defaultFrom)
  const [toUnit, setToUnit] = useState(analyte.defaultTo)
  const [fromCustom, setFromCustom] = useState(false)
  const [toCustom, setToCustom] = useState(false)

  const result = useMemo(() => {
    const number = Number(value)
    if (!Number.isFinite(number)) return { kind: 'empty' as const }
    if (!fromUnit.trim() || !toUnit.trim()) return { kind: 'empty' as const }

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
      value: converted.toVal,
      fromCode: from.ucumCode ?? fromUnit,
      toCode: to.ucumCode ?? toUnit,
    }
  }, [analyte, value, fromUnit, toUnit])

  const chooseAnalyte = (id: string) => {
    const next = analytes.find((x) => x.id === id)
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
          <div className="eyebrow">UCUM-powered · analyte-aware</div>
          <h1>Laboratory unit conversion with clinically relevant unit choices.</h1>
          <p>
            Each analyte now exposes the units commonly encountered in laboratory reporting.
            You can still enter any valid UCUM expression through the custom-unit option.
          </p>
        </section>

        <section className="workspace">
          <div className="panel converter-panel">
            <div className="section-heading">
              <div><span className="step">1</span><h2>Select analyte</h2></div>
              <span className="badge">{analyte.category}</span>
            </div>

            <select className="field analyte-select" value={analyteId} onChange={(e) => chooseAnalyte(e.target.value)}>
              {analyteCategories.map((category) => (
                <optgroup key={category} label={category}>
                  {analytes.filter((item) => item.category === category).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="analyte-meta">
              {analyte.molecularWeight ? <span>MW {analyte.molecularWeight} g/mol</span> : <span>No molecular conversion</span>}
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
                onValue={setFromUnit}
                onCustom={setFromCustom}
              />

              <button className="swap" type="button" onClick={swap} aria-label="Swap units">⇄</button>

              <UnitPicker
                label="To"
                units={analyte.commonUnits}
                value={toUnit}
                custom={toCustom}
                onValue={setToUnit}
                onCustom={setToCustom}
              />
            </div>
            <p className="unit-hint">The dropdown shows analyte-specific common units. Choose Custom UCUM for any other valid UCUM expression.</p>
          </div>

          <aside className={`panel result-panel ${result.kind}`}>
            <div className="section-heading"><div><span className="step">3</span><h2>Result</h2></div></div>
            {result.kind === 'success' ? <>
              <div className="result-value">{pretty(result.value)}</div>
              <div className="result-unit">{unitLabel(analyte, toUnit)}</div>
              <div className="equation">{value} {unitLabel(analyte, fromUnit)} = {pretty(result.value)} {unitLabel(analyte, toUnit)}</div>
              <div className="verified-box"><strong>UCUM validated</strong><span>{result.fromCode} → {result.toCode}</span></div>
            </> : result.kind === 'error' ? <div className="error-box"><strong>Conversion unavailable</strong><p>{result.message}</p></div> : <div className="empty-state">Enter a numeric value and valid units to calculate.</div>}
            {analyte.note ? <p className="clinical-note">{analyte.note}</p> : null}
          </aside>
        </section>

        <section className="principles">
          <div><strong>Analyte-specific units</strong><span>Glucose, CBC, blood gas, enzymes and hormones no longer share one generic unit list.</span></div>
          <div><strong>UCUM first</strong><span>Machine-readable UCUM codes are kept separate from human-friendly display labels such as µmol/L or mmHg.</span></div>
          <div><strong>Exceptions stay explicit</strong><span>HbA1c NGSP↔IFCC, D-dimer FEU↔DDU, BUN and similar convention-based conversions are not guessed from dimensional units.</span></div>
        </section>

        <section className="notice"><strong>Clinical-use note.</strong> This is an engineering prototype. Independently validate conversion results before use in reporting or patient care. Reference intervals remain separate because they are method-, population-, age-, and sex-dependent.</section>
      </main>
      <footer>LabTools v0.2 · UCUM engine by NLM LHC · Open source</footer>
    </div>
  )
}
