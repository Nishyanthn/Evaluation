import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Edit3, ChevronLeft, ChevronRight,
  Inbox, AlertCircle, MessageSquare, BarChart3
} from 'lucide-react';
import '../styles/styleHumanReview_beta.css';
import '../styles/styleTestcase_beta.css';

const SCORE_LABELS = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Acceptable',
  4: 'Good',
  5: 'Excellent',
};

export default function HumanReviewBeta() {
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [pending, setPending] = useState(0);
  const [evaluationId, setEvaluationId] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Per-case review state
  const [reviewerScore, setReviewerScore] = useState(null);
  const [reviewerNote, setReviewerNote] = useState('');
  const [noteVisible, setNoteVisible] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8001/api/human-review-queue');
      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
      const data = await res.json();
      setQueue(data.items || []);
      setPending(data.pending || 0);
      setEvaluationId(data.evaluationId || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetReviewState = () => {
    setReviewerScore(null);
    setReviewerNote('');
    setNoteVisible(false);
  };

  const submitReview = async (action) => {
    const item = queue[currentIdx];
    if (!item) return;

    if (action === 'correct' && !reviewerScore) {
      alert('Please select a score (1–5) before correcting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        evaluation_id: evaluationId,
        test_index: item.test_index,
        action,
        reviewer_score: action === 'correct' ? reviewerScore : null,
        reviewer_note: reviewerNote || null,
      };

      const res = await fetch('http://localhost:8001/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Submission failed: ${res.statusText}`);

      // Mark item locally as reviewed and advance
      const updated = [...queue];
      updated[currentIdx] = {
        ...updated[currentIdx],
        review_status: 'reviewed',
        review_action: action,
        reviewer_score: action === 'correct' ? reviewerScore : null,
        reviewer_note: reviewerNote || null,
      };
      setQueue(updated);
      setPending(prev => Math.max(0, prev - 1));
      resetReviewState();

      // Move to next pending case
      const nextPending = updated.findIndex(
        (q, i) => i > currentIdx && q.review_status === 'pending'
      );
      if (nextPending !== -1) {
        setCurrentIdx(nextPending);
      }
    } catch (err) {
      alert(`Error submitting review: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goTo = (idx) => {
    resetReviewState();
    setCurrentIdx(idx);
  };

  const getScoreColor = (score) => {
    if (score >= 0.7) return '#10b981';
    if (score >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  // ── Empty / loading states ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="app-container">
        <ReviewSidebar navigate={navigate} />
        <div className="hr-center">
          <div className="hr-spinner" />
          <p>Loading review queue…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <ReviewSidebar navigate={navigate} />
        <div className="hr-center">
          <AlertCircle size={48} color="#ef4444" />
          <h2>Could not load queue</h2>
          <p style={{color: '#6b7280'}}>{error}</p>
          <p style={{color: '#6b7280', fontSize: '0.85rem'}}>Make sure the backend is running on http://localhost:8001</p>
          <button className="btn-primary" onClick={fetchQueue}>Retry</button>
        </div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="app-container">
        <ReviewSidebar navigate={navigate} />
        <div className="hr-center">
          <Inbox size={56} color="#9ca3af" />
          <h2 style={{marginTop: '1rem'}}>No cases to review</h2>
          <p style={{color: '#6b7280'}}>
            Run an evaluation first. Cases that fall in the confidence gray zone will appear here.
          </p>
          <button className="btn-primary" style={{marginTop: '1rem'}} onClick={() => navigate('/')}>
            New Evaluation
          </button>
        </div>
      </div>
    );
  }

  const item = queue[currentIdx];
  const isReviewed = item.review_status === 'reviewed';

  return (
    <div className="app-container">
      <ReviewSidebar navigate={navigate} />

      <div className="main-layout">
        {/* Header bar */}
        <div className="stepper-container">
          <div className="hr-header-row">
            <div>
              <h1 className="page-title">Human Review Queue</h1>
              <p className="hr-subtitle">
                {pending > 0
                  ? `${pending} case${pending !== 1 ? 's' : ''} pending review`
                  : 'All cases reviewed'}
                {evaluationId && <span className="hr-eval-id"> · {evaluationId}</span>}
              </p>
            </div>
            <div className="hr-progress-summary">
              <span className="hr-progress-text">
                {queue.filter(q => q.review_status === 'reviewed').length} / {queue.length} reviewed
              </span>
              <div className="hr-progress-bar">
                <div
                  className="hr-progress-fill"
                  style={{
                    width: `${(queue.filter(q => q.review_status === 'reviewed').length / queue.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Case navigation pills */}
          <div className="hr-nav-pills">
            {queue.map((q, i) => (
              <button
                key={i}
                className={`hr-nav-pill ${i === currentIdx ? 'hr-nav-pill-active' : ''} ${q.review_status === 'reviewed' ? 'hr-nav-pill-done' : ''}`}
                onClick={() => goTo(i)}
                title={`Case #${q.test_index}${q.review_status === 'reviewed' ? ' (reviewed)' : ''}`}
              >
                {q.test_index}
              </button>
            ))}
          </div>
        </div>

        {/* Main review panel */}
        <div className="content-area">
          <div className="content-wrapper">

            {/* Case header */}
            <div className="hr-case-header">
              <div className="hr-case-title-row">
                <span className="hr-case-label">Case #{item.test_index}</span>
                {item.scenario && (
                  <span className="hr-scenario-badge">{item.scenario.replace(/_/g, ' ')}</span>
                )}
                <span className="hr-triggers">
                  {(item.review_triggers || []).map(t => (
                    <span key={t} className="hr-trigger-tag">{t.replace(/_/g, ' ')}</span>
                  ))}
                </span>
                {isReviewed && (
                  <span className="hr-reviewed-badge">
                    ✓ Reviewed · {item.review_action}
                  </span>
                )}
              </div>
              <div className="hr-overall-score" style={{color: getScoreColor(item.score)}}>
                Judge score: {(item.score * 100).toFixed(1)}%
                <span className="hr-confidence"> · confidence {(item.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Q / Reference / Actual row */}
            <div className="hr-triple-grid">
              <div className="hr-panel">
                <div className="hr-panel-label">Question</div>
                <div className="hr-panel-body">{item.user_query || '—'}</div>
              </div>
              <div className="hr-panel">
                <div className="hr-panel-label">Reference Answer</div>
                <div className="hr-panel-body">{item.expected_response || <em style={{color:'#9ca3af'}}>No reference provided</em>}</div>
              </div>
              <div className="hr-panel">
                <div className="hr-panel-label">Bot's Actual Response</div>
                <div className="hr-panel-body">{item.actual_response || '—'}</div>
              </div>
            </div>

            {/* Per-metric scores + reasoning */}
            {item.metric_scores && Object.keys(item.metric_scores).length > 0 && (
              <div className="hr-metrics-section">
                <h3 className="hr-section-title">
                  <BarChart3 size={16} /> Judge Scores &amp; Reasoning
                </h3>
                <div className="hr-metrics-list">
                  {Object.entries(item.metric_scores).map(([metricName, score]) => {
                    const reason = (item.metric_reasoning || {})[metricName] || '';
                    return (
                      <div key={metricName} className="hr-metric-row">
                        <div className="hr-metric-header">
                          <span className="hr-metric-name">{metricName}</span>
                          <span className="hr-metric-score" style={{color: getScoreColor(score)}}>
                            {(score * 100).toFixed(1)}%
                          </span>
                        </div>
                        {reason && (
                          <div className="hr-metric-reason">{reason}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review actions */}
            {!isReviewed ? (
              <div className="hr-actions-section">
                <h3 className="hr-section-title">Your Decision</h3>

                <div className="hr-action-buttons">
                  <button
                    className="hr-btn-accept"
                    disabled={isSubmitting}
                    onClick={() => submitReview('accept')}
                  >
                    <CheckCircle size={18} /> Accept Judge Score
                  </button>

                  <button
                    className="hr-btn-correct"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (!noteVisible) setNoteVisible(true);
                      // Submit happens after score selection below
                    }}
                  >
                    <Edit3 size={18} /> Correct Score
                  </button>

                  <button
                    className="hr-btn-reject"
                    disabled={isSubmitting}
                    onClick={() => submitReview('reject')}
                    title="Reject this case — e.g. the reference answer was wrong"
                  >
                    <XCircle size={18} /> Reject Case
                  </button>
                </div>

                {/* Score correction panel */}
                {noteVisible && (
                  <div className="hr-correction-panel">
                    <label className="hr-correction-label">
                      <Edit3 size={14} /> Your Score (1 = poor, 5 = excellent)
                    </label>
                    <div className="hr-score-radios">
                      {[1, 2, 3, 4, 5].map(n => (
                        <label key={n} className={`hr-score-radio ${reviewerScore === n ? 'hr-score-radio-active' : ''}`}>
                          <input
                            type="radio"
                            name="reviewer-score"
                            value={n}
                            checked={reviewerScore === n}
                            onChange={() => setReviewerScore(n)}
                            style={{display: 'none'}}
                          />
                          <span className="hr-score-number">{n}</span>
                          <span className="hr-score-label">{SCORE_LABELS[n]}</span>
                        </label>
                      ))}
                    </div>

                    <label className="hr-correction-label" style={{marginTop: '1rem'}}>
                      <MessageSquare size={14} /> Note (optional)
                    </label>
                    <textarea
                      className="hr-note-textarea"
                      placeholder="Explain why you're overriding the judge's score…"
                      value={reviewerNote}
                      onChange={e => setReviewerNote(e.target.value)}
                      rows={3}
                    />

                    <div className="hr-correction-actions">
                      <button
                        className="hr-btn-accept"
                        disabled={isSubmitting || !reviewerScore}
                        onClick={() => submitReview('correct')}
                      >
                        {isSubmitting ? 'Submitting…' : 'Submit Correction'}
                      </button>
                      <button
                        className="hr-btn-cancel"
                        onClick={() => { setNoteVisible(false); setReviewerScore(null); setReviewerNote(''); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hr-reviewed-summary">
                <CheckCircle size={20} color="#10b981" />
                <span>
                  Reviewed: <strong>{item.review_action}</strong>
                  {item.reviewer_score != null && ` · Your score: ${(item.reviewer_score * 5).toFixed(0)}/5`}
                  {item.reviewer_note && ` · "${item.reviewer_note}"`}
                </span>
              </div>
            )}

            {/* Prev / Next */}
            <div className="hr-nav-row">
              <button
                className="btn-secondary"
                disabled={currentIdx === 0}
                onClick={() => goTo(currentIdx - 1)}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="hr-case-counter">{currentIdx + 1} / {queue.length}</span>
              <button
                className="btn-secondary"
                disabled={currentIdx === queue.length - 1}
                onClick={() => goTo(currentIdx + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSidebar({ navigate }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">AI</div>
          <span className="logo-text">EvalBot</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <button className="nav-button" onClick={() => navigate('/')}>
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Evaluation
        </button>
        <button className="nav-button nav-button-active">
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Human Review
        </button>
      </nav>
      <div className="sidebar-footer">
        <div className="version">v1.0.0</div>
      </div>
    </div>
  );
}
