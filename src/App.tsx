import { useMemo, useState } from 'react'
import { UcumLhcUtils, type UcumMessage } from '@lhncbc/ucum-lhc'
import { analyteCategories, analytes, type Analyte, type UnitOption } from './data'
import { convertSpecial, hasSpecialConversion, specialAnalytes } from './specialConversions'
import {
  RCPA_SOURCE,
  classifyAgainstRange,
  convertReferenceInterval,
  findReferenceInterval,
  hasReferenceIntervals,
  needsSex,
  type BiologicalSex,
} from './referenceRanges'
import './styles.css'
import './special.css'
import './reference.css'

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
  const hasReference = hasReferenceIntervals(analyte.id)

  const [value, setValue] = useState('100')
  const [fromUnit, setFromUnit] = useState(analyte.defaultFrom)
  const [toUnit, setToUnit] = useState(analyte.defaultTo)
  const [fromCustom, setFromCustom] = useState(false)
  const [toCustom, setToCustom] = useState(false)
  const [ageYears, setAgeYears] = useState('45')
  const [sex, setSex] = useState<BiologicalSex>('unspecified')

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

  const referenceView = useMemo(() => {
    if (!hasReference) return { kind: 'none' as const }

    const age = Number(ageYears)
    if (!Number.isFinite(age) || age < 0) return { kind: 'invalid-age' as const }
    if (needsSex(analyte.id, age) && sex === 'unspecified') return { kind: 'needs-sex' as const }

    const interval = findReferenceInterval(analyte.id, age, sex)
    if (!interval) return { kind: 'no-match' as const }

    const converted = convertReferenceInterval(interval, analyte, toUnit.trim())
    if (!converted) return { kind: 'unit-error' as const, interval }

    if (result.kind !== 'success') return { kind: 'range-only' as const, range: converted }

    return {
      kind: 'matched' as const,
      range: converted,
      status: classifyAgainstRange(result.value, converted.displayLower, converted.displayUpper),
    }
  }, [hasReference, ageYears, sex, analyte, toUnit, result])

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

  const renderReferenceCard = () => {
    if (referenceView.kind === 'none') return null

    if (referenceView.kind === 'invalid-age') {
      return <div className="reference-empty"><strong>Reference interval unavailable</strong>Enter a valid age in years.</div>
    }
    if (referenceView.kind === 'needs-sex') {
      return <div className="reference-empty"><strong>Sex-specific interval</strong>Select male or female to apply the RCPA interval for this analyte and age.</div>
    }
    if (referenceView.kind === 'no-match') {
      return <div className="reference-empty"><strong>No interval in the current adult seed</strong>The selected age/sex falls outside the RCPA interval currently encoded in LabTools. The app does not extrapolate.</div>
    }
    if (referenceView.kind === 'unit-error') {
      return <div className="reference-empty"><strong>Reference interval found, but not convertible</strong>The published RCPA interval is {pretty(referenceView.interval.lower)}–{pretty(referenceView.interval.upper)} {referenceView.interval.unit}. Choose a compatible reporting unit to compare the result.</div>
    }

    const range = referenceView.range
    const status = referenceView.kind === 'matched' ? referenceView.status : null
    const statusText = status === 'low' ? 'Low' : status === 'high' ? 'High' : status === 'within' ? 'Within' : null

    return (
      <div className="reference-card">
        <div className="reference-card-header">
          <div>
            <span className="reference-kicker">RCPA harmonised reference interval</span>
            <span className="reference-range">{pretty(range.displayLower)}–{pretty(range.displayUpper)} {unitLabel(analyte, range.displayUnit)}</span>
          </div>
          {status ? <span className={`range-status ${status}`}>{statusText}</span> : null}
        </div>

        <div className="reference-meta">
          <div><span>Population</span><strong>{range.ageMinYears} to &lt;{range.ageMaxYears} years{range.sex !== 'any' ? ` · ${range.sex}` : ''}</strong></div>
          <div><span>Specimen</span><strong>{range.specimen}</strong></div>
          <div><span>Published unit</span><strong>{pretty(range.lower)}–{pretty(range.upper)} {range.unit}</strong></div>
        </div>

        {range.note ? <p className="reference-note">{range.note}</p> : null}
        <a className="reference-source" href={RCPA_SOURCE.url} target="_blank" rel="noreferrer">Source: RCPA Table 6 ↗</a>
        <div className="reference-scope">{RCPA_SOURCE.scope}</div>
      </div>
    )
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
          <div className="eyebrow">UCUM-powered · source-aware reference intervals</div>
          <h1>Laboratory unit conversion with reference intervals kept in context.</h1>
          <p>
            Standard conversions use UCUM, convention-based conversions use explicit published formulas,
            and selected adult chemistry tests now show RCPA harmonised reference intervals with age, sex,
            specimen and method limitations preserved.
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
              {hasReference ? <span>RCPA adult RI available</span> : null}
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

            {hasReference ? (
              <div className="reference-context">
                <div className="section-heading">
                  <div><span className="step">3</span><h2>Reference context</h2></div>
                  <span className="badge">RCPA adult seed</span>
                </div>
                <div className="reference-fields">
                  <label className="input-group">
                    <span>Age (years)</span>
                    <input className="field" inputMode="decimal" value={ageYears} onChange={(e) => setAgeYears(e.target.value)} />
                  </label>
                  <label className="input-group">
                    <span>Sex</span>
                    <select className="field" value={sex} onChange={(e) => setSex(e.target.value as BiologicalSex)}>
                      <option value="unspecified">Not specified</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                </div>
                <p className="reference-help">Reference intervals are source-specific, not universal. LabTools will not extrapolate outside the encoded RCPA age/sex scope.</p>
              </div>
            ) : null}
          </div>

          <aside className={`panel result-panel ${result.kind}`}>
            <div className="section-heading"><div><span className="step">{hasReference ? '4' : '3'}</span><h2>Result</h2></div></div>
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

            {renderReferenceCard()}
            {analyte.note ? <p className="clinical-note">{analyte.note}</p> : null}
          </aside>
        </section>

        <section className="principles">
          <div><strong>Source-aware RI</strong><span>Reference intervals are stored with age, sex, specimen, method notes and source instead of being presented as universal normal ranges.</span></div>
          <div><strong>Unit-aware comparison</strong><span>The published interval is converted into the selected output unit before Low / Within / High classification.</span></div>
          <div><strong>No extrapolation</strong><span>If age, sex, method scope or analyte data do not match, LabTools shows no classification rather than inventing a range.</span></div>
        </section>

        <section className="notice"><strong>Clinical-use note.</strong> This is an engineering prototype. RCPA harmonised intervals apply only in their published context and do not replace the reporting laboratory's validated reference interval. Independently validate both conversion and interval logic before use in reporting or patient care.</section>
      </main>
      <footer>LabTools v0.4 · UCUM + published conversion rules + source-aware RCPA adult reference intervals · Open source</footer>
    </div>
  )
}
