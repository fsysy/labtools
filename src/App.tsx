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
  needsSpecimen,
  type BiologicalSex,
  type SpecimenChoice,
} from './referenceRanges'
import './styles.css'
import './special.css'
import './reference.css'

const ucum = UcumLhcUtils.getInstance()
const CUSTOM_UNIT = '__custom__'
const allAnalytes: Analyte[] = [...analytes, ...specialAnalytes]
const allCategories = Array.from(new Set([...analyteCategories, ...specialAnalytes.map((item) => item.category)]))

type AgeUnit = 'days' | 'weeks' | 'months' | 'years'

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

function ageToDays(value: string, unit: AgeUnit): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return Number.NaN
  const multiplier = unit === 'days' ? 1 : unit === 'weeks' ? 7 : unit === 'months' ? 365.25 / 12 : 365.25
  return Math.floor(n * multiplier)
}

function matchesAnalyte(analyte: Analyte, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [analyte.name, analyte.id, analyte.category, ...analyte.aliases].join(' ').toLowerCase()
  return haystack.includes(q)
}

function analyteScore(analyte: Analyte, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0
  const name = analyte.name.toLowerCase()
  const id = analyte.id.toLowerCase()
  const aliases = analyte.aliases.map((alias) => alias.toLowerCase())
  if (name === q || id === q || aliases.includes(q)) return 0
  if (name.startsWith(q) || id.startsWith(q) || aliases.some((alias) => alias.startsWith(q))) return 1
  return 2
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

  const [searchQuery, setSearchQuery] = useState('')
  const [value, setValue] = useState('100')
  const [fromUnit, setFromUnit] = useState(analyte.defaultFrom)
  const [toUnit, setToUnit] = useState(analyte.defaultTo)
  const [fromCustom, setFromCustom] = useState(false)
  const [toCustom, setToCustom] = useState(false)
  const [ageValue, setAgeValue] = useState('45')
  const [ageUnit, setAgeUnit] = useState<AgeUnit>('years')
  const [sex, setSex] = useState<BiologicalSex>('unspecified')
  const [specimen, setSpecimen] = useState<SpecimenChoice>('unspecified')

  const ageDays = useMemo(() => ageToDays(ageValue, ageUnit), [ageValue, ageUnit])
  const requiresSex = hasReference && Number.isFinite(ageDays) ? needsSex(analyte.id, ageDays) : false
  const requiresSpecimen = hasReference && Number.isFinite(ageDays) ? needsSpecimen(analyte.id, ageDays) : false

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return allAnalytes
      .filter((item) => matchesAnalyte(item, searchQuery))
      .sort((a, b) => analyteScore(a, searchQuery) - analyteScore(b, searchQuery) || a.name.localeCompare(b.name))
      .slice(0, 10)
  }, [searchQuery])

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
    if (!Number.isFinite(ageDays) || ageDays < 0) return { kind: 'invalid-age' as const }
    if (needsSex(analyte.id, ageDays) && sex === 'unspecified') return { kind: 'needs-sex' as const }
    if (needsSpecimen(analyte.id, ageDays) && specimen === 'unspecified') return { kind: 'needs-specimen' as const }

    const interval = findReferenceInterval(analyte.id, ageDays, sex, specimen)
    if (!interval) return { kind: 'no-match' as const }

    const converted = convertReferenceInterval(interval, analyte, toUnit.trim())
    if (!converted) return { kind: 'unit-error' as const, interval }
    if (result.kind !== 'success') return { kind: 'range-only' as const, range: converted }

    return {
      kind: 'matched' as const,
      range: converted,
      status: classifyAgainstRange(result.value, converted.displayLower, converted.displayUpper),
    }
  }, [hasReference, ageDays, sex, specimen, analyte, toUnit, result])

  const chooseAnalyte = (id: string) => {
    const next = allAnalytes.find((x) => x.id === id)
    if (!next) return
    setAnalyteId(id)
    setFromUnit(next.defaultFrom)
    setToUnit(next.defaultTo)
    setFromCustom(false)
    setToCustom(false)
    setSearchQuery('')
    setSpecimen('unspecified')
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
      return <div className="reference-empty"><strong>Reference interval unavailable</strong>Enter a valid non-negative age.</div>
    }
    if (referenceView.kind === 'needs-sex') {
      return <div className="reference-empty"><strong>Sex-specific interval</strong>Select male or female for this RCPA age partition.</div>
    }
    if (referenceView.kind === 'needs-specimen') {
      return <div className="reference-empty"><strong>Specimen-specific interval</strong>RCPA publishes different paediatric potassium intervals for serum and plasma. Select the specimen before classification.</div>
    }
    if (referenceView.kind === 'no-match') {
      return <div className="reference-empty"><strong>No matching RCPA interval encoded</strong>The selected age/sex/specimen falls outside the interval currently encoded in LabTools. The app does not extrapolate.</div>
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
          <div><span>Population</span><strong>{range.ageLabel}{range.sex !== 'any' ? ` · ${range.sex}` : ''}</strong></div>
          <div><span>Specimen</span><strong>{range.specimen}</strong></div>
          <div><span>Published unit</span><strong>{pretty(range.lower)}–{pretty(range.upper)} {range.unit}</strong></div>
          {range.loinc ? <div><span>RCPA LOINC</span><strong>{range.loinc}</strong></div> : null}
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
          <div className="eyebrow">UCUM-powered · paediatric + adult RCPA intervals</div>
          <h1>Search the analyte, convert the unit, keep the reference context.</h1>
          <p>
            Search by test name or common alias, convert with UCUM or an explicit published rule,
            then compare against source-specific RCPA paediatric or adult harmonised intervals when available.
          </p>
        </section>

        <section className="workspace">
          <div className="panel converter-panel">
            <div className="section-heading">
              <div><span className="step">1</span><h2>Select analyte</h2></div>
              <span className={`badge ${isSpecial ? 'special-badge' : ''}`}>{isSpecial ? 'Published formula' : analyte.category}</span>
            </div>

            <div className="analyte-search">
              <input
                className="field"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults[0]) chooseAnalyte(searchResults[0].id)
                  if (e.key === 'Escape') setSearchQuery('')
                }}
                placeholder="Search name or alias — e.g. Cr, CREA, AST, HDL"
                aria-label="Search analytes by name or alias"
              />
              {searchQuery.trim() ? (
                <div className="analyte-search-results" role="listbox" aria-label="Analyte search results">
                  {searchResults.length ? searchResults.map((item) => (
                    <button key={item.id} type="button" onClick={() => chooseAnalyte(item.id)}>
                      <span><strong>{item.name}</strong><small>{item.category}</small></span>
                      <em>{item.aliases.slice(0, 4).join(' · ') || item.id}</em>
                    </button>
                  )) : <div className="search-no-result">No analyte matched “{searchQuery}”.</div>}
                </div>
              ) : null}
            </div>

            <label className="browse-label" htmlFor="analyte-select">Or browse by category</label>
            <select id="analyte-select" className="field analyte-select" value={analyteId} onChange={(e) => chooseAnalyte(e.target.value)}>
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
              {hasReference ? <span>RCPA RI available</span> : null}
            </div>

            <div className="common-unit-strip" aria-label="Common units for selected analyte">
              <strong>Common units</strong>
              <div>{analyte.commonUnits.map((unit) => <span key={unit.code}>{unit.label}</span>)}</div>
            </div>

            <div className="section-heading value-heading"><div><span className="step">2</span><h2>Enter value & units</h2></div></div>
            <div className="conversion-grid">
              <label className="input-group value-input">
                <span>Value</span>
                <input className="field numeric" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
              </label>

              <UnitPicker label="From" units={analyte.commonUnits} value={fromUnit} custom={fromCustom} allowCustom={!isSpecial} onValue={setFromUnit} onCustom={setFromCustom} />
              <button className="swap" type="button" onClick={swap} aria-label="Swap units">⇄</button>
              <UnitPicker label="To" units={analyte.commonUnits} value={toUnit} custom={toCustom} allowCustom={!isSpecial} onValue={setToUnit} onCustom={setToCustom} />
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
                  <span className="badge">RCPA paediatric + adult</span>
                </div>

                <div className="reference-fields reference-fields-age">
                  <label className="input-group">
                    <span>Age</span>
                    <input className="field" inputMode="decimal" value={ageValue} onChange={(e) => setAgeValue(e.target.value)} />
                  </label>
                  <label className="input-group">
                    <span>Age unit</span>
                    <select className="field" value={ageUnit} onChange={(e) => setAgeUnit(e.target.value as AgeUnit)}>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </label>
                  <label className="input-group">
                    <span>Sex {requiresSex ? '· required' : ''}</span>
                    <select className="field" value={sex} onChange={(e) => setSex(e.target.value as BiologicalSex)}>
                      <option value="unspecified">Not specified</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                  {requiresSpecimen ? (
                    <label className="input-group">
                      <span>Specimen · required</span>
                      <select className="field" value={specimen} onChange={(e) => setSpecimen(e.target.value as SpecimenChoice)}>
                        <option value="unspecified">Select specimen</option>
                        <option value="serum">Serum</option>
                        <option value="plasma">Plasma</option>
                      </select>
                    </label>
                  ) : null}
                </div>

                <p className="reference-help">
                  Age partitions are evaluated in days to preserve neonatal and paediatric boundaries. For a child close to a boundary, use days or weeks rather than an approximate month value. LabTools never extrapolates beyond the encoded RCPA scope.
                </p>
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
          <div><strong>Name + alias search</strong><span>Search matches the analyte name, internal id, category and aliases such as Cr, CREA, HDL or AST.</span></div>
          <div><strong>Paediatric boundaries preserved</strong><span>Neonatal, weekly and childhood RCPA partitions are evaluated in days instead of flattening everything into adult years.</span></div>
          <div><strong>Specimen-aware where needed</strong><span>Paediatric potassium requires serum vs plasma because RCPA publishes different intervals for those specimens.</span></div>
        </section>

        <section className="notice"><strong>Clinical-use note.</strong> This is an engineering prototype. RCPA harmonised intervals apply only in their published context and do not replace the reporting laboratory's validated reference interval. Independently validate both conversion and interval logic before use in reporting or patient care.</section>
      </main>
      <footer>LabTools v0.5 · UCUM + published conversion rules + RCPA paediatric/adult reference intervals + alias search · Open source</footer>
    </div>
  )
}
