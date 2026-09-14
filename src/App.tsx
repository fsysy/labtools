import { useMemo, useState } from 'react'
import { UcumLhcUtils, type UcumMessage } from '@lhncbc/ucum-lhc'
import { analytes, unitOptions } from './data'
import './styles.css'

const ucum = UcumLhcUtils.getInstance()

function msgText(message: UcumMessage): string {
  const text = typeof message === 'string' ? message : (message.message ?? message.msg ?? '')
  return text.replace(/<[^>]*>/g, '')
}

function pretty(value: number): string {
  const a = Math.abs(value)
  if ((a > 0 && a < 0.001) || a >= 1_000_000) return value.toExponential(6)
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 }).format(value)
}

export default function App() {
  const [analyteId, setAnalyteId] = useState('glucose')
  const analyte = analytes.find((x) => x.id === analyteId) ?? analytes[0]
  const [value, setValue] = useState('100')
  const [fromUnit, setFromUnit] = useState(analyte.defaultFrom)
  const [toUnit, setToUnit] = useState(analyte.defaultTo)

  const result = useMemo(() => {
    const number = Number(value)
    if (!Number.isFinite(number)) return { kind: 'empty' as const }

    const from = ucum.validateUnitString(fromUnit, true)
    const to = ucum.validateUnitString(toUnit, true)
    if (from.status !== 'valid' || to.status !== 'valid') {
      const messages = [...(from.msg ?? []), ...(to.msg ?? [])].map(msgText).filter(Boolean)
      return { kind: 'error' as const, message: messages.join(' ') || 'Check the UCUM unit expressions.' }
    }

    const converted = ucum.convertUnitTo(fromUnit, number, toUnit, {
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
  }

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
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
          <div className="eyebrow">UCUM-powered · deterministic conversion</div>
          <h1>Laboratory unit conversion without memorizing the factor.</h1>
          <p>LabTools validates UCUM unit expressions and performs the conversion locally in your browser. Mass↔molar conversions use the selected analyte's molecular weight.</p>
        </section>

        <section className="workspace">
          <div className="panel converter-panel">
            <div className="section-heading"><div><span className="step">1</span><h2>Select analyte</h2></div><span className="badge">Clinical preset</span></div>
            <select className="field analyte-select" value={analyteId} onChange={(e) => chooseAnalyte(e.target.value)}>
              {analytes.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
            <div className="analyte-meta">
              <span>MW {analyte.molecularWeight ? `${analyte.molecularWeight} g/mol` : 'not required'}</span>
              {analyte.charge ? <span>|charge| {analyte.charge}</span> : null}
            </div>

            <div className="section-heading value-heading"><div><span className="step">2</span><h2>Enter value & units</h2></div></div>
            <div className="conversion-grid">
              <label className="input-group"><span>Value</span><input className="field numeric" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} /></label>
              <label className="input-group"><span>From</span><input className="field" list="units" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} /></label>
              <button className="swap" type="button" onClick={swap} aria-label="Swap units">⇄</button>
              <label className="input-group"><span>To</span><input className="field" list="units" value={toUnit} onChange={(e) => setToUnit(e.target.value)} /></label>
            </div>
            <datalist id="units">{unitOptions.map((u) => <option key={u} value={u} />)}</datalist>
            <p className="unit-hint">Any valid UCUM expression can be typed directly.</p>
          </div>

          <aside className={`panel result-panel ${result.kind}`}>
            <div className="section-heading"><div><span className="step">3</span><h2>Result</h2></div></div>
            {result.kind === 'success' ? <>
              <div className="result-value">{pretty(result.value)}</div>
              <div className="result-unit">{toUnit}</div>
              <div className="equation">{value} {fromUnit} = {pretty(result.value)} {toUnit}</div>
              <div className="verified-box"><strong>UCUM validated</strong><span>{result.fromCode} → {result.toCode}</span></div>
            </> : result.kind === 'error' ? <div className="error-box"><strong>Conversion unavailable</strong><p>{result.message}</p></div> : <div className="empty-state">Enter a numeric value to calculate.</div>}
            {analyte.note ? <p className="clinical-note">{analyte.note}</p> : null}
          </aside>
        </section>

        <section className="principles">
          <div><strong>UCUM first</strong><span>Unit validation and conversions use the NLM implementation of UCUM.</span></div>
          <div><strong>Analyte-aware</strong><span>Mass↔molar conversion uses molecular weight only for a defined measurand.</span></div>
          <div><strong>No LLM math</strong><span>The numeric conversion path is deterministic and reproducible.</span></div>
        </section>

        <section className="notice"><strong>Clinical-use note.</strong> This is an engineering prototype. Independently validate conversion results before use in reporting or patient care. Reference intervals are intentionally excluded from v0.1 because they are method-, population-, age-, and sex-dependent.</section>
      </main>
      <footer>LabTools v0.1 · UCUM engine by NLM LHC · Open source</footer>
    </div>
  )
}
