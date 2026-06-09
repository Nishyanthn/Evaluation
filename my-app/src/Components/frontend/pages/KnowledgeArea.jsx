import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PortalLayout from '../layout/PortalLayout.jsx';
import '../layout/stylePortal.css';

const TABS = [
  { id: 'knowledgebase',  label: 'Knowledgebase',   icon: <KBIcon /> },
  { id: 'playground',     label: 'Playground',       icon: <PlayIcon /> },
  { id: 'unanswered',     label: 'Unanswered',       icon: <UnansweredIcon /> },
  { id: 'unsafe',         label: 'Unsafe Content',   icon: <ShieldIcon /> },
  { id: 'evaluation',     label: 'Evaluation',       icon: <EvalIcon /> },
];

const SCORE_COLOR = (score) => {
  if (score >= 80) return 'score-green';
  if (score >= 60) return 'score-yellow';
  return 'score-red';
};

// Sample past-run data (replaced by real data navigated in via results page)
const SAMPLE_RUNS = [
  {
    id: 1,
    name: 'Inext Hotel Address Evaluation',
    date: '10/01/2024',
    status: 'success',
    metrics: [
      { name: 'Relevance',     score: 85 },
      { name: 'Correctness',   score: 79 },
      { name: 'Completeness',  score: 82 },
      { name: 'Toxicity',      score: 5  },
    ],
  },
];

export default function KnowledgeArea() {
  const navigate = useNavigate();
  const location = useLocation();

  // Persist completed eval runs navigated back from results
  const [pastRuns, setPastRuns] = useState(SAMPLE_RUNS);
  const [activeTab, setActiveTab] = useState('evaluation');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRuns = pastRuns.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalLayout activeSection="knowledge">
      <div className="ka-page">
        {/* Page header */}
        <div className="ka-header">
          <h1 className="ka-title">Knowledge Area</h1>
          <button className="ka-bot-selector">
            <div className="ka-bot-dot" />
            Bot in Focus &nbsp;
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            &nbsp; iNextLabs QA &nbsp;
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="ka-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`ka-tab ${activeTab === tab.id ? 'ka-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="ka-body">
          {activeTab !== 'evaluation' ? (
            <PlaceholderTab label={TABS.find(t => t.id === activeTab)?.label} />
          ) : (
            <EvaluationTab
              runs={filteredRuns}
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              onNewEval={() => navigate('/eval/new')}
              onOpenRun={(run) => {
                // Re-navigate to results with the run data
                navigate('/eval/results', { state: { results: run.rawResult } });
              }}
              onHumanReview={() => navigate('/eval/human-review')}
            />
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

/* ── Evaluation tab ──────────────────────────────────────────────────────── */
function EvaluationTab({ runs, searchQuery, onSearch, onNewEval, onOpenRun, onHumanReview }) {
  return (
    <div className="eval-list-page">
      <div className="eval-list-header">
        <div className="eval-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search by question"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        <div style={{display:'flex', gap:'0.5rem'}}>
          <button className="btn-new-eval" onClick={onNewEval}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Evaluation
          </button>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="eval-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
          <h3>No evaluations yet</h3>
          <p>Click "New Evaluation" to run your first bot evaluation.</p>
        </div>
      ) : (
        runs.map(run => <EvalRunCard key={run.id} run={run} onClick={() => onOpenRun(run)} />)
      )}
    </div>
  );
}

function EvalRunCard({ run, onClick }) {
  const statusClass = {
    success: 'eval-status-success',
    running: 'eval-status-running',
    failed:  'eval-status-failed',
  }[run.status] || 'eval-status-success';

  const statusLabel = {
    success: '✓ Success',
    running: '⟳ Running',
    failed:  '✕ Failed',
  }[run.status] || 'Success';

  return (
    <div className="eval-run-card" onClick={onClick}>
      <div className="eval-run-top">
        <div className="eval-run-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div className="eval-run-name">{run.name}</div>
          <div className="eval-run-date">{run.date}</div>
        </div>
        <span className={`eval-status-badge ${statusClass}`}>{statusLabel}</span>
        <div className="eval-run-actions" onClick={e => e.stopPropagation()}>
          <button className="eval-action-btn" title="Download">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
      </div>

      {run.metrics && run.metrics.length > 0 && (
        <>
          <div className="eval-divider-label">Overall Evaluation Result</div>
          <div className="eval-metrics-row">
            {run.metrics.map(m => (
              <div key={m.name} className="eval-metric-chip">
                <span className="eval-metric-chip-name">{m.name}</span>
                <span className={`eval-metric-chip-score ${SCORE_COLOR(m.score)}`}>
                  {m.score}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Placeholder for non-eval tabs ── */
function PlaceholderTab({ label }) {
  return (
    <div className="ka-placeholder">
      <svg className="ka-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <h3>{label}</h3>
      <p>This section is coming soon.</p>
    </div>
  );
}

/* ── Tab Icons ── */
function KBIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function PlayIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
function UnansweredIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function ShieldIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function EvalIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>;
}
