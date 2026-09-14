# LabTools

Clinical laboratory utilities built with React + TypeScript + Vite.

The first release is a **UCUM-based unit converter** using the U.S. National Library of Medicine Lister Hill Center implementation, `@lhncbc/ucum-lhc`.

## Design

- UCUM validates unit expressions and performs ordinary dimensional conversions.
- Mass ↔ molar conversions use analyte-specific molecular weight when the measurand is well defined.
- Equivalent conversions may use ionic charge.
- No LLM is used for numeric arithmetic.
- Reference intervals are intentionally excluded from v0.1 because they depend on method, population, age, sex, and local validation.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

The repository contains `.github/workflows/deploy.yml`. The expected URL is:

https://fsysy.github.io/labtools/

If Pages has never been enabled for the repository, set **Settings → Pages → Build and deployment → Source → GitHub Actions** once.

## Clinical-use note

This is an engineering prototype. Independently validate conversion results before use in reporting or patient care. The upstream UCUM library also recommends independent verification for clinical use.

## Upstream references

- UCUM: https://ucum.org/
- NLM LHC UCUM implementation: https://github.com/LHNCBC/ucum-lhc
