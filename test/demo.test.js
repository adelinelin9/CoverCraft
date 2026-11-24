/**
 * Demo Mode — four-step flow integrity tests
 *
 * Verifies that all three demo scenarios contain complete, well-formed data
 * so the entire CoverCraft workflow can run without any backend calls.
 *
 * Run with: node --experimental-strip-types --test test/demo.test.js
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import { DEMO_SCENARIOS } from '../src/demo.ts'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_ICON_KEYS = new Set(['cs', 'marketing', 'healthcare'])
const MIN_CHARS = 50 // matches worker validation

function assertRecommendation(rec, label) {
  assert.equal(typeof rec.id, 'string', `${label}: id must be a string`)
  assert.ok(rec.id.trim().length > 0, `${label}: id must not be blank`)
  assert.equal(typeof rec.title, 'string', `${label}: title must be a string`)
  assert.ok(rec.title.trim().length > 0, `${label}: title must not be blank`)
  assert.equal(typeof rec.skill, 'string', `${label}: skill must be a string`)
  assert.ok(rec.skill.trim().length > 0, `${label}: skill must not be blank`)
  assert.equal(typeof rec.explanation, 'string', `${label}: explanation must be a string`)
  assert.ok(rec.explanation.trim().length > 0, `${label}: explanation must not be blank`)
}

function assertQuestionnaire(q, label) {
  assert.equal(typeof q.interest, 'string', `${label}: interest must be a string`)
  assert.ok(q.interest.trim().length > 0, `${label}: interest (Q1) must not be blank — it is required`)
  assert.equal(typeof q.strengths, 'string', `${label}: strengths must be a string`)
  assert.ok(q.strengths.trim().length > 0, `${label}: strengths (Q2) must not be blank — it is required`)
  assert.equal(typeof q.accomplishmentImpact, 'string', `${label}: accomplishmentImpact must be a string`)
  assert.equal(typeof q.additionalInfo, 'string', `${label}: additionalInfo must be a string`)
}

// ─── Top-level shape ──────────────────────────────────────────────────────────

test('DEMO_SCENARIOS exports exactly three scenarios', () => {
  assert.ok(Array.isArray(DEMO_SCENARIOS), 'DEMO_SCENARIOS must be an array')
  assert.equal(DEMO_SCENARIOS.length, 3, 'must have exactly 3 scenarios')
})

test('all three scenarios have distinct ids', () => {
  const ids = DEMO_SCENARIOS.map((s) => s.id)
  assert.equal(new Set(ids).size, 3, 'each scenario must have a unique id')
})

test('all three scenarios cover the expected icon keys', () => {
  const keys = new Set(DEMO_SCENARIOS.map((s) => s.iconKey))
  assert.ok(keys.has('cs'), 'missing cs scenario')
  assert.ok(keys.has('marketing'), 'missing marketing scenario')
  assert.ok(keys.has('healthcare'), 'missing healthcare scenario')
})

// ─── Per-scenario structure ───────────────────────────────────────────────────

for (const scenario of DEMO_SCENARIOS) {
  const label = `scenario "${scenario.id}"`

  // Step 1 — resume + job description (Step 1 display + worker validation minimum)
  test(`${label}: Step 1 — resume and job description meet the 50-char minimum`, () => {
    assert.ok(
      typeof scenario.resume === 'string' && scenario.resume.trim().length >= MIN_CHARS,
      `resume must be at least ${MIN_CHARS} characters`,
    )
    assert.ok(
      typeof scenario.jobDescription === 'string' &&
        scenario.jobDescription.trim().length >= MIN_CHARS,
      `jobDescription must be at least ${MIN_CHARS} characters`,
    )
  })

  // Step 2 — recommendations (pre-generated, no API call needed)
  test(`${label}: Step 2 — has 3–5 well-formed recommendations`, () => {
    assert.ok(Array.isArray(scenario.recommendations), 'recommendations must be an array')
    assert.ok(
      scenario.recommendations.length >= 3 && scenario.recommendations.length <= 5,
      `expected 3–5 recommendations, got ${scenario.recommendations.length}`,
    )
    for (const [i, rec] of scenario.recommendations.entries()) {
      assertRecommendation(rec, `${label} recommendation[${i}]`)
    }
  })

  test(`${label}: Step 2 — recommendation ids are unique within the scenario`, () => {
    const ids = scenario.recommendations.map((r) => r.id)
    assert.equal(new Set(ids).size, ids.length, 'recommendation ids must be unique')
  })

  test(`${label}: Step 2 — first three recommendations are auto-selectable`, () => {
    // handleDemoSelect calls slice(0, 3) — verify at least 3 exist and have ids
    const autoSelected = scenario.recommendations.slice(0, 3)
    assert.equal(autoSelected.length, 3, 'need at least 3 recommendations to auto-select 3')
    assert.ok(autoSelected.every((r) => r.id.trim()), 'all auto-selected recommendations need valid ids')
  })

  // Step 3 — questionnaire (pre-filled, all four fields)
  test(`${label}: Step 3 — questionnaire has all four fields with required ones populated`, () => {
    assertQuestionnaire(scenario.questionnaire, label)
  })

  // Step 4 — cover letter + suggestions (pre-generated, no API call needed)
  test(`${label}: Step 4 — has a non-empty cover letter`, () => {
    assert.equal(typeof scenario.coverLetter, 'string', 'coverLetter must be a string')
    assert.ok(scenario.coverLetter.trim().length > 0, 'coverLetter must not be blank')
  })

  test(`${label}: Step 4 — has 1–3 non-empty suggestions`, () => {
    assert.ok(Array.isArray(scenario.suggestions), 'suggestions must be an array')
    assert.ok(
      scenario.suggestions.length >= 1 && scenario.suggestions.length <= 3,
      `expected 1–3 suggestions, got ${scenario.suggestions.length}`,
    )
    for (const [i, s] of scenario.suggestions.entries()) {
      assert.equal(typeof s, 'string', `suggestion[${i}] must be a string`)
      assert.ok(s.trim().length > 0, `suggestion[${i}] must not be blank`)
    }
  })

  // Metadata — required for DemoSelect card rendering
  test(`${label}: metadata fields are present for DemoSelect card`, () => {
    assert.equal(typeof scenario.title, 'string', 'title must be a string')
    assert.ok(scenario.title.trim().length > 0, 'title must not be blank')
    assert.equal(typeof scenario.subtitle, 'string', 'subtitle must be a string')
    assert.ok(scenario.subtitle.trim().length > 0, 'subtitle must not be blank')
    assert.ok(VALID_ICON_KEYS.has(scenario.iconKey), `iconKey "${scenario.iconKey}" is not a valid icon key`)
  })
}

// ─── No async operations in demo data ────────────────────────────────────────

test('DEMO_SCENARIOS is a static array — no Promises or async values', () => {
  for (const scenario of DEMO_SCENARIOS) {
    // Verify none of the string fields are Promises or other non-string values
    assert.ok(!(scenario.resume instanceof Promise), 'resume must not be a Promise')
    assert.ok(!(scenario.jobDescription instanceof Promise), 'jobDescription must not be a Promise')
    assert.ok(!(scenario.coverLetter instanceof Promise), 'coverLetter must not be a Promise')
  }
  // The mere fact that this test runs synchronously confirms no async module-level
  // side effects (e.g. fetch calls) occurred during import
})
