import type { ScenarioInput, SimulationResult } from '@/simulation/types';
import { formatLabel, formatStatus } from '@/utils/format';

export function buildScenarioReport(scenario: ScenarioInput, result: SimulationResult) {
  return {
    exportedAt: new Date().toISOString(),
    scenario,
    result,
    summary: {
      title: scenario.name,
      status: formatStatus(result.status),
      waterway: formatLabel(scenario.waterwayType),
      bridgeSystem: formatLabel(scenario.bridgeSystem),
      feasibility: result.feasibilityScore,
      stability: result.stabilityScore,
      cost: result.costScore,
      complexity: result.complexityScore,
    },
    assessment: {
      decisionSignal: result.decisionSignal,
      studyBasis: result.confidenceLabel,
      basisNote: result.basisNote,
      explanation: result.explanation,
      screeningChecks: result.screeningChecks,
    },
    provenance: {
      origin: scenario.dataOrigin,
      confidence: scenario.sourceConfidence,
      siteContext: scenario.siteContext,
      sourceSummary: scenario.sourceSummary,
      assumptions: scenario.studyAssumptions,
      sources: scenario.sourceReferences,
      importedArtifacts: scenario.importedArtifacts,
    },
  };
}

export function buildScenarioShareText(scenario: ScenarioInput, result: SimulationResult) {
  return [
    `KARRAS crossing: ${scenario.name}`,
    `Status: ${formatStatus(result.status)}`,
    `Decision signal: ${result.decisionSignal}`,
    `Waterway: ${formatLabel(scenario.waterwayType)}`,
    `Bridge system: ${formatLabel(scenario.bridgeSystem)}`,
    `Span: ${scenario.spanDistanceM}m`,
    `Channel width: ${scenario.channelWidthM}m`,
    `Navigation clearance: ${scenario.navigationClearanceM}m`,
    `Study basis: ${result.confidenceLabel}`,
    `Data origin: ${formatLabel(scenario.dataOrigin)}`,
    `Source confidence: ${formatLabel(scenario.sourceConfidence)}`,
    `Feasibility: ${Math.round(result.feasibilityScore)}/100`,
    `Stability: ${Math.round(result.stabilityScore)}/100`,
    `Cost band: ${Math.round(result.costScore)}/100`,
    `Complexity: ${Math.round(result.complexityScore)}/100`,
    `Top recommendation: ${result.recommendations[0] ?? 'Review the scenario in KARRAS.'}`,
  ].join('\n');
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function downloadScenarioReport(scenario: ScenarioInput, result: SimulationResult) {
  const payload = buildScenarioReport(scenario, result);
  const assumptionsMarkup = scenario.studyAssumptions
    .map(
      (assumption) => `
        <div class="card">
          <div class="label-row">
            <span class="label">${escapeHtml(assumption.label)}</span>
            <span class="pill">${escapeHtml(assumption.value)}</span>
          </div>
          <p>${escapeHtml(assumption.basis)}</p>
        </div>
      `,
    )
    .join('');
  const sourcesMarkup = scenario.sourceReferences
    .map(
      (source) => `
        <div class="card">
          <p class="title">${escapeHtml(source.label)}</p>
          <p class="meta">${escapeHtml(source.owner)} · ${escapeHtml(source.type)}</p>
          <p>${escapeHtml(source.note)}</p>
          ${source.url ? `<p><a href="${escapeHtml(source.url)}">${escapeHtml(source.url)}</a></p>` : ''}
        </div>
      `,
    )
    .join('');
  const artifactsMarkup = scenario.importedArtifacts
    .map(
      (artifact) => `
        <div class="card">
          <p class="title">${escapeHtml(artifact.fileName)}</p>
          <p class="meta">${escapeHtml(artifact.format.toUpperCase())} · ${escapeHtml(artifact.importedAt)}</p>
          <p>${escapeHtml(artifact.note)}</p>
        </div>
      `,
    )
    .join('');
  const screeningChecksMarkup = result.screeningChecks
    .map(
      (check) => `
        <div class="card">
          <div class="label-row">
            <span class="label">${escapeHtml(check.label)}</span>
            <span class="pill">${escapeHtml(check.status)}</span>
          </div>
          <p class="title" style="margin-top:10px;">${escapeHtml(check.value)}</p>
          <p>${escapeHtml(check.detail)}</p>
        </div>
      `,
    )
    .join('');
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(scenario.name)} | KARRAS Brief</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; background: #06101d; color: #e4e4e7; margin: 0; padding: 32px; }
      .shell { max-width: 1100px; margin: 0 auto; }
      h1, h2, h3, p { margin: 0; }
      .eyebrow { letter-spacing: 0.28em; text-transform: uppercase; font-size: 11px; color: #67e8f9; }
      .hero { border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 28px; background: linear-gradient(180deg, rgba(17, 24, 39, 0.9), rgba(8, 17, 33, 0.92)); }
      .hero h1 { font-size: 38px; margin-top: 12px; }
      .hero p { color: #a1a1aa; margin-top: 16px; line-height: 1.7; }
      .grid { display: grid; gap: 16px; margin-top: 20px; }
      .grid.metrics { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .metric, .panel { border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; background: rgba(255,255,255,0.03); padding: 18px; }
      .metric .value { font-size: 30px; margin-top: 10px; }
      .section { margin-top: 24px; }
      .section h2 { font-size: 24px; margin-bottom: 14px; }
      .card { border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; background: rgba(0,0,0,0.18); padding: 14px; margin-bottom: 12px; }
      .title { font-size: 16px; color: #fafafa; }
      .meta { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #71717a; margin-top: 6px; }
      .label-row { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
      .label { font-size: 15px; color: #fafafa; }
      .pill { border: 1px solid rgba(103,232,249,0.3); border-radius: 999px; padding: 4px 10px; color: #a5f3fc; font-size: 12px; }
      ul { margin: 12px 0 0; padding-left: 20px; color: #d4d4d8; line-height: 1.7; }
      a { color: #67e8f9; word-break: break-all; }
      @media print { body { background: white; color: black; } .hero, .metric, .panel, .card { background: white; color: black; border-color: #d4d4d8; } a { color: #0f766e; } }
    </style>
  </head>
  <body>
    <div class="shell">
      <section class="hero">
        <p class="eyebrow">KARRAS Executive Brief</p>
        <h1>${escapeHtml(scenario.name)}</h1>
        <p>${escapeHtml(scenario.sourceSummary)}</p>
        <p><strong>Decision signal:</strong> ${escapeHtml(result.decisionSignal)}</p>
        <p><strong>Study basis:</strong> ${escapeHtml(result.confidenceLabel)}</p>
        <div class="grid metrics">
          <div class="metric"><div class="meta">Feasibility</div><div class="value">${Math.round(result.feasibilityScore)}/100</div></div>
          <div class="metric"><div class="meta">Stability</div><div class="value">${Math.round(result.stabilityScore)}/100</div></div>
          <div class="metric"><div class="meta">Cost Band</div><div class="value">${Math.round(result.costScore)}/100</div></div>
          <div class="metric"><div class="meta">Complexity</div><div class="value">${Math.round(result.complexityScore)}/100</div></div>
        </div>
      </section>
      <section class="grid two section">
        <div class="panel">
          <h2>Study Basis</h2>
          <p><strong>Origin:</strong> ${escapeHtml(formatLabel(scenario.dataOrigin))}</p>
          <p><strong>Confidence:</strong> ${escapeHtml(formatLabel(scenario.sourceConfidence))}</p>
          <p><strong>Basis:</strong> ${escapeHtml(result.confidenceLabel)}</p>
          <p><strong>Site Context:</strong> ${escapeHtml(scenario.siteContext)}</p>
          <p><strong>Status:</strong> ${escapeHtml(formatStatus(result.status))}</p>
          <p><strong>Basis note:</strong> ${escapeHtml(result.basisNote)}</p>
        </div>
        <div class="panel">
          <h2>Primary Configuration</h2>
          <p><strong>Waterway:</strong> ${escapeHtml(formatLabel(scenario.waterwayType))}</p>
          <p><strong>Bridge System:</strong> ${escapeHtml(formatLabel(scenario.bridgeSystem))}</p>
          <p><strong>Span:</strong> ${escapeHtml(String(scenario.spanDistanceM))}m</p>
          <p><strong>Clearance:</strong> ${escapeHtml(String(scenario.navigationClearanceM))}m</p>
        </div>
      </section>
      <section class="section">
        <h2>Screening Interpretation</h2>
        <div class="panel">
          <p><strong>Decision signal:</strong> ${escapeHtml(result.decisionSignal)}</p>
          <p style="margin-top: 10px;">${escapeHtml(result.explanation)}</p>
        </div>
      </section>
      <section class="section">
        <h2>Concept Checks</h2>
        ${screeningChecksMarkup || '<p>No screening checks generated.</p>'}
      </section>
      <section class="section">
        <h2>Assumptions</h2>
        ${assumptionsMarkup || '<p>No explicit assumptions recorded.</p>'}
      </section>
      <section class="section">
        <h2>Source References</h2>
        ${sourcesMarkup || '<p>No sources attached to this study.</p>'}
      </section>
      <section class="section">
        <h2>Imported Data</h2>
        ${artifactsMarkup || '<p>No user-imported files attached to this study.</p>'}
      </section>
      <section class="grid two section">
        <div class="panel">
          <h2>Dominant Risks</h2>
          <ul>${result.dominantRisks.map((risk) => `<li>${escapeHtml(risk)}</li>`).join('')}</ul>
        </div>
        <div class="panel">
          <h2>Recommended Moves</h2>
          <ul>${result.recommendations.map((move) => `<li>${escapeHtml(move)}</li>`).join('')}</ul>
        </div>
      </section>
      <section class="section">
        <h2>Machine Payload</h2>
        <pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
      </section>
    </div>
  </body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `${scenario.name.toLowerCase().replace(/\s+/g, '-')}-karras-brief.html`;
  link.click();
  URL.revokeObjectURL(href);
}
