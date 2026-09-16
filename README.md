# LabTools

Clinical laboratory utilities built with **React + TypeScript + Vite**.

LabTools is intended to provide small, transparent, browser-based utilities for common laboratory tasks. The current application focuses on **clinical laboratory unit conversion** and an experimental **reference interval lookup** module.

Live site: https://fsysy.github.io/labtools/

## Current features

### 1. Laboratory unit converter

The converter is built around the UCUM (Unified Code for Units of Measure) model using the U.S. National Library of Medicine Lister Hill Center implementation, [`@lhncbc/ucum-lhc`](https://github.com/LHNCBC/ucum-lhc).

The application does not treat every conversion as a simple multiplication. Laboratory conversions fall into several different classes:

| Conversion type | Example | How it is handled |
| --- | --- | --- |
| Dimensional / scale conversion | `mg/dL → g/L` | UCUM |
| Mass ↔ molar concentration | glucose `mg/dL → mmol/L` | UCUM-compatible scaling plus analyte molecular weight |
| Equivalent concentration | calcium `mmol/L → mEq/L` | analyte ionic charge |
| Convention-based conversion | BUN `mg/dL → mmol/L` | explicit published clinical conversion rule |
| Standardization equation | HbA1c NGSP `% → mmol/mol` | published NGSP/IFCC equation |
| Ratio-unit convention | uACR `mg/g → mg/mmol` | explicit guideline-based conversion factor |
| Incompatible measurands | e.g. `mg/dL → U/L` | rejected rather than guessed |

### 2. Analyte-aware conversion

Mass concentration and amount-of-substance concentration cannot be converted safely from the unit strings alone. The identity of the analyte matters because the molecular weight is different for each substance.

For example:

- Glucose: molecular weight ≈ `180.156 g/mol`
- Creatinine: molecular weight ≈ `113.12 g/mol`
- Calcium: molecular weight ≈ `40.078 g/mol`, ionic charge `+2`

Therefore:

```text
100 mg/dL glucose ≈ 5.55 mmol/L
1 mg/dL creatinine ≈ 88.4 µmol/L
1 mmol/L calcium = 2 mEq/L
```

The analyte metadata is maintained in `src/data.ts`. Each analyte can define:

```ts
type Analyte = {
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
```

This allows the UI to limit users to clinically meaningful units and lets the conversion engine decide whether a molecular-weight or charge-based bridge is appropriate.

Examples currently represented include general chemistry, electrolytes/minerals, lipids, enzymes, hematology, coagulation, blood gas, osmolality, steroid hormones, and thyroid-related analytes.

### 3. Special clinical conversions

Some laboratory conversions are **not ordinary dimensional conversions** and should not be inferred from molecular weight alone. These are implemented explicitly in `src/specialConversions.ts` with a formula and source.

Current special conversions include:

| Analyte / measurand | Conversion | Basis |
| --- | --- | --- |
| BUN | `mg/dL ↔ mmol/L urea` | conventional BUN-to-urea conversion |
| Triglycerides | `mg/dL ↔ mmol/L` | conventional clinical factor |
| HbA1c | NGSP `% ↔ IFCC mmol/mol` | NGSP/IFCC master equation |
| Urine albumin/creatinine ratio (uACR) | `mg/g ↔ mg/mmol` | creatinine-denominator convention |
| Urine protein/creatinine ratio (uPCR) | `mg/g ↔ mg/mmol` | creatinine-denominator convention |

Unlike generic UCUM conversion, these rules are deliberately enumerated and carry their own source information so that a convention is never silently substituted for a physical-unit conversion.

### 4. Reference interval lookup

The repository also contains an experimental reference interval module in `src/referenceRanges.ts`.

The current dataset is based on the **Royal College of Pathologists of Australasia (RCPA) harmonised reference intervals for chemical pathology**, including age-, sex-, and specimen-specific partitions where published.

The lookup model can represent:

- analyte
- age interval
- biological sex
- serum / plasma distinction
- lower and upper limits
- reporting unit
- LOINC identifier where available
- source-specific notes

The application preserves published partitions rather than extrapolating values across missing age groups or specimen types.

Reference intervals are fundamentally different from unit conversions. They may depend on analytical method, calibration traceability, specimen type, population, age, sex, and local validation. For that reason, this module should be treated as **source-linked reference data**, not as a universal laboratory reference range database.

## Conversion design principles

### Deterministic arithmetic

Numeric conversion is performed by program code, UCUM rules, analyte metadata, or explicitly defined published formulas. **No LLM is used to perform the numeric arithmetic.**

This is intentional: the same validated input should always produce the same output.

### Do not guess across measurands

A unit may be syntactically valid but still inappropriate for a particular laboratory measurand. LabTools aims to distinguish:

1. ordinary dimensional conversion,
2. analyte-dependent chemical conversion,
3. convention-based clinical conversion,
4. conversions that should be refused.

### Keep clinical assumptions visible

Where a conversion depends on something beyond UCUM—such as molecular weight, ionic charge, or a clinical convention—the relevant assumption should be represented explicitly in data or code rather than hidden in the UI.

## Example conversion flow

Conceptually, conversion follows this sequence:

```text
Select analyte
    ↓
Enter value and source unit
    ↓
Check whether a special clinical rule exists
    ↓
Otherwise check UCUM dimensional compatibility
    ↓
If mass ↔ molar conversion is needed,
use analyte molecular weight
    ↓
If equivalent units are involved,
use ionic charge where applicable
    ↓
Return converted value and conversion context
```

If the requested conversion does not have a defensible physical or clinical relationship, the converter should fail rather than fabricate a factor.

## Project structure

```text
src/
├── App.tsx                  Main application UI and conversion workflow
├── data.ts                  Analyte metadata and common units
├── specialConversions.ts    Explicit convention-based conversions
├── referenceRanges.ts       Source-linked reference interval data/logic
├── main.tsx                 React entry point
├── styles.css               Main styles
├── reference.css            Reference interval styles
└── special.css              Special-conversion styles
```

## Local development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## GitHub Pages deployment

The repository includes `.github/workflows/deploy.yml` for GitHub Pages deployment.

Expected deployment URL:

https://fsysy.github.io/labtools/

If GitHub Pages has not previously been enabled for the repository, configure:

**Settings → Pages → Build and deployment → Source → GitHub Actions**

## Clinical-use limitations

LabTools is an engineering and clinical-informatics prototype, not an IVD medical device or a substitute for a laboratory's validated LIS/middleware rules.

Before using any result for reporting or patient care:

- independently verify conversion formulas and constants;
- confirm the exact measurand (for example, urea vs BUN or phosphorus as P vs phosphate);
- verify unit notation and specimen type;
- confirm method-specific assumptions;
- validate reference intervals locally before implementation;
- retain source/version information for controlled laboratory use.

The upstream UCUM implementation likewise recommends independent verification for clinical applications.

## Data and maintenance direction

As the number of analytes grows, analyte metadata should remain separated from presentation logic. The intended model is a structured dataset containing, where applicable:

- canonical analyte identifier and display name
- aliases
- laboratory category
- supported/common units
- SI and conventional reporting units
- molecular weight
- ionic charge
- conversion notes
- source/provenance
- measurand-specific restrictions

This keeps the UI lightweight while allowing the conversion knowledge base to expand without hard-coding every dropdown or calculation directly into React components.

## Upstream and clinical references

- UCUM: https://ucum.org/
- NLM LHC UCUM implementation: https://github.com/LHNCBC/ucum-lhc
- RCPA harmonised reference intervals: https://www.rcpa.edu.au/Manuals/RCPA-Manual/General-Information/IG/Table-6-Harmonised-reference-intervals-for-chem
- NGSP / IFCC HbA1c standardization: https://ngsp.org/ifcc.asp
- KDIGO 2024 CKD guideline: https://kdigo.org/wp-content/uploads/2024/01/KDIGO-2024-CKD-Guideline.pdf
