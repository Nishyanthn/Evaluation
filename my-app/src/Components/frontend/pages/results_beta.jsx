import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown,
  Activity, BarChart3, Eye, Download, ChevronDown, ChevronUp,
  MessageSquare, Users
} from 'lucide-react';
import '../styles/styleTestcase_beta.css';
import '../styles/styleResults_beta.css';

export default function ResultsBeta() {
  const navigate = useNavigate();
  const location = useLocation();
  const evaluationResults = location.state?.results || null;

  const [expandedTestCase, setExpandedTestCase] = useState(null);

  if (!evaluationResults) {
    return (
      <div className="app-container">
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <h2>No Results Found</h2>
          <p>Please complete an evaluation first.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const {
    evaluationName,
    totalTests,
    completedTests,
    overallScore,
    testResults,
    timestamp,
    tokenUsage,
    reviewQueueCount,
    evaluationId,
  } = evaluationResults;

  // Calculate statistics
  const passedTests = testResults.filter(t => t.passed).length;
  const failedTests = completedTests - passedTests;
  const passRate = completedTests > 0 ? (passedTests / completedTests) * 100 : 0;
  const reviewCount = reviewQueueCount ?? testResults.filter(t => t.needs_human_review).length;

  // Get metric names from first test case
  const metricNames = testResults[0]?.metric_scores ? Object.keys(testResults[0].metric_scores) : [];

  // Calculate average scores per metric
  const avgMetricScores = {};
  metricNames.forEach(metric => {
    const scores = testResults
      .filter(t => t.metric_scores && t.metric_scores[metric] !== undefined)
      .map(t => t.metric_scores[metric]);
    avgMetricScores[metric] = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  });

  // Failure analysis: group failed tests by scenario
  const failedCompleted = testResults.filter(t => t.status === 'completed' && !t.passed);
  const scenarioFailMap = {};
  failedCompleted.forEach(t => {
    const scenario = t.scenario || 'Untagged';
    if (!scenarioFailMap[scenario]) scenarioFailMap[scenario] = { count: 0, scores: [] };
    scenarioFailMap[scenario].count += 1;
    scenarioFailMap[scenario].scores.push(t.score);
  });
  const scenarioFailures = Object.entries(scenarioFailMap)
    .map(([name, d]) => ({
      name,
      count: d.count,
      avgScore: d.scores.reduce((a, b) => a + b, 0) / d.scores.length,
    }))
    .sort((a, b) => b.count - a.count);

  // Weakest metric
  const weakestMetric = metricNames.length > 0
    ? metricNames.reduce((a, b) => avgMetricScores[a] < avgMetricScores[b] ? a : b)
    : null;

  const toggleTestCase = (index) => {
    setExpandedTestCase(expandedTestCase === index ? null : index);
  };

  const getScoreColor = (score) => {
    if (score >= 0.7) return '#10b981'; // Green
    if (score >= 0.5) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 0.7) return 'Good';
    if (score >= 0.5) return 'Fair';
    return 'Poor';
  };

  const handleDownloadResults = () => {
    const dataStr = JSON.stringify(evaluationResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${evaluationName.replace(/\s+/g, '_')}_results.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">AI</div>
            <span className="logo-text">EvalBot</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-button nav-button-active">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Evaluation
          </button>
          <button className="nav-button">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="version">v1.0.0</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-layout">
        {/* Stepper */}
        <div className="stepper-container">
          <h1 className="page-title">Evaluation Results</h1>

          <div className="stepper">
            {/* Steps 1-4 completed */}
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="step-item">
                <div className="step-indicator-container">
                  <div className="step-indicator step-indicator-active" style={{backgroundColor: '#10b981'}}>✓</div>
                  {step < 5 && <div className="step-connector"></div>}
                </div>
                <div className="step-label">
                  <div className="step-label-inactive">
                    {step === 1 && 'Test Case Generation'}
                    {step === 2 && 'Field Mapping'}
                    {step === 3 && 'Criteria'}
                    {step === 4 && 'Review'}
                  </div>
                </div>
              </div>
            ))}

            {/* Step 5 - Active */}
            <div className="step-item">
              <div className="step-indicator-container">
                <div className="step-indicator step-indicator-active">5</div>
              </div>
              <div className="step-label">
                <div className="step-label-active">Results</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="content-area">
          <div className="content-wrapper">
            <div className="results-header">
              <div>
                <h2 className="section-title">{evaluationName}</h2>
                <p className="results-timestamp">Completed on {new Date(timestamp).toLocaleString()}</p>
              </div>
              <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
                {reviewCount > 0 && (
                  <button
                    onClick={() => navigate('/human-review')}
                    className="btn-review-queue"
                  >
                    <Users size={16} />
                    Review Queue ({reviewCount})
                  </button>
                )}
                <button onClick={handleDownloadResults} className="btn-download">
                  <Download className="icon-sm" />
                  Export Results
                </button>
              </div>
            </div>

            {/* Overall Summary Cards */}
            <div className="summary-grid">
              {/* Overall Score Card */}
              <div className="summary-card summary-card-large">
                <div className="summary-card-header">
                  <Activity className="summary-icon" />
                  <span className="summary-label">Overall Score</span>
                </div>
                <div className="summary-value-large" style={{color: getScoreColor(overallScore)}}>
                  {(overallScore * 100).toFixed(1)}%
                </div>
                <div className="summary-subtitle">{getScoreLabel(overallScore)} Performance</div>
                <div className="score-bar">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${overallScore * 100}%`,
                      backgroundColor: getScoreColor(overallScore)
                    }}
                  />
                </div>
              </div>

              {/* Pass Rate Card */}
              <div className="summary-card">
                <div className="summary-card-header">
                  <CheckCircle className="summary-icon" style={{color: '#10b981'}} />
                  <span className="summary-label">Pass Rate</span>
                </div>
                <div className="summary-value">{passRate.toFixed(1)}%</div>
                <div className="summary-subtitle">
                  {passedTests} / {completedTests} passed
                </div>
              </div>

              {/* Total Tests Card */}
              <div className="summary-card">
                <div className="summary-card-header">
                  <BarChart3 className="summary-icon" style={{color: '#3b82f6'}} />
                  <span className="summary-label">Total Tests</span>
                </div>
                <div className="summary-value">{totalTests}</div>
                <div className="summary-subtitle">
                  {completedTests} completed, {failedTests} failed
                </div>
              </div>

              {/* Token Usage Card (if available) */}
              {tokenUsage && (
                <div className="summary-card">
                  <div className="summary-card-header">
                    <Activity className="summary-icon" style={{color: '#f59e0b'}} />
                    <span className="summary-label">Tokens Used</span>
                  </div>
                  <div className="summary-value">{tokenUsage.total_tokens.toLocaleString()}</div>
                  <div className="summary-subtitle">
                    {tokenUsage.total_calls} API calls
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Performance */}
            <div className="metrics-section">
              <h3 className="section-subtitle">
                <TrendingUp className="icon-sm" />
                Metrics Performance
              </h3>
              <div className="metrics-grid">
                {metricNames.map((metricName) => {
                  const score = avgMetricScores[metricName];
                  return (
                    <div key={metricName} className="metric-card">
                      <div className="metric-header">
                        <span className="metric-name">{metricName}</span>
                        <span className="metric-score" style={{color: getScoreColor(score)}}>
                          {(score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="metric-bar">
                        <div
                          className="metric-bar-fill"
                          style={{
                            width: `${score * 100}%`,
                            backgroundColor: getScoreColor(score)
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Failure Analysis */}
            {(scenarioFailures.length > 0 || weakestMetric) && (
              <div className="metrics-section">
                <h3 className="section-subtitle">
                  <TrendingDown className="icon-sm" style={{color:'#ef4444'}} />
                  Failure Analysis
                </h3>

                {weakestMetric && (
                  <div className="failure-insight">
                    <AlertCircle size={16} style={{color:'#f59e0b', flexShrink:0}} />
                    <span>
                      Weakest metric: <strong>{weakestMetric}</strong> averaging{' '}
                      <strong style={{color: getScoreColor(avgMetricScores[weakestMetric])}}>
                        {(avgMetricScores[weakestMetric] * 100).toFixed(1)}%
                      </strong>
                      . Consider reviewing the knowledge base coverage for related topics.
                    </span>
                  </div>
                )}

                {scenarioFailures.length > 0 && (
                  <div className="scenario-fail-list">
                    <p style={{fontSize:'0.8rem', color:'#6b7280', marginBottom:'0.5rem'}}>
                      Failed tests by scenario:
                    </p>
                    {scenarioFailures.map(s => (
                      <div key={s.name} className="scenario-fail-row">
                        <span className="scenario-fail-name">{s.name.replace(/_/g, ' ')}</span>
                        <span className="scenario-fail-count">{s.count} failed</span>
                        <div className="metric-bar" style={{flex:1, margin:'0 0.75rem'}}>
                          <div
                            className="metric-bar-fill"
                            style={{width:`${s.avgScore*100}%`, backgroundColor: getScoreColor(s.avgScore)}}
                          />
                        </div>
                        <span style={{fontSize:'0.8rem', fontWeight:600, color: getScoreColor(s.avgScore)}}>
                          {(s.avgScore*100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Individual Test Results */}
            <div className="test-results-section">
              <h3 className="section-subtitle">
                <Eye className="icon-sm" />
                Individual Test Results
              </h3>

              <div className="test-results-list">
                {testResults.map((test, index) => (
                  <div key={index} className="test-result-card">
                    {/* Test Header */}
                    <div
                      className="test-result-header"
                      onClick={() => toggleTestCase(index)}
                    >
                      <div className="test-result-info">
                        <div className="test-result-status">
                          {test.passed ? (
                            <CheckCircle className="status-icon status-icon-success" />
                          ) : (
                            <XCircle className="status-icon status-icon-error" />
                          )}
                          <span className="test-result-title">Test Case #{test.test_index}</span>
                          <span
                            className="test-result-badge"
                            style={{
                              backgroundColor: test.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: test.passed ? '#10b981' : '#ef4444'
                            }}
                          >
                            {test.passed ? 'PASSED' : 'FAILED'}
                          </span>
                          {test.needs_human_review && (
                            <span className="test-result-badge" style={{backgroundColor:'rgba(245,158,11,0.1)', color:'#d97706'}}>
                              REVIEW
                            </span>
                          )}
                          {test.scenario && (
                            <span className="test-result-badge" style={{backgroundColor:'#eff6ff', color:'#2563eb'}}>
                              {test.scenario.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <div className="test-result-query">{test.user_query}</div>
                      </div>
                      <div className="test-result-score-container">
                        <div
                          className="test-result-score"
                          style={{color: getScoreColor(test.score)}}
                        >
                          {(test.score * 100).toFixed(1)}%
                        </div>
                        {expandedTestCase === index ? (
                          <ChevronUp className="expand-icon" />
                        ) : (
                          <ChevronDown className="expand-icon" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedTestCase === index && (
                      <div className="test-result-details">
                        {/* Response Comparison */}
                        <div className="comparison-grid">
                          <div className="comparison-section">
                            <div className="comparison-header">
                              <span className="comparison-label">Agent Response</span>
                              <span className="comparison-badge comparison-badge-actual">Actual</span>
                            </div>
                            <div className="comparison-content">
                              {test.actual_response || 'No response'}
                            </div>
                          </div>

                          <div className="comparison-section">
                            <div className="comparison-header">
                              <span className="comparison-label">Expected Response</span>
                              <span className="comparison-badge comparison-badge-expected">Expected</span>
                            </div>
                            <div className="comparison-content">
                              {test.expected_response || 'No expected response'}
                            </div>
                          </div>
                        </div>

                        {/* Metric Scores + Reasoning */}
                        {test.metric_scores && (
                          <div className="test-metrics">
                            <h4 className="test-metrics-title">
                              <MessageSquare size={14} /> Detailed Metrics &amp; Judge Reasoning
                            </h4>
                            <div className="test-metrics-grid">
                              {Object.entries(test.metric_scores).map(([metric, score]) => {
                                const reason = (test.metric_reasoning || {})[metric] || '';
                                return (
                                  <div key={metric} className="test-metric-item">
                                    <div className="test-metric-header">
                                      <span className="test-metric-name">{metric}</span>
                                      <span
                                        className="test-metric-value"
                                        style={{color: getScoreColor(score)}}
                                      >
                                        {(score * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="test-metric-bar">
                                      <div
                                        className="test-metric-bar-fill"
                                        style={{
                                          width: `${score * 100}%`,
                                          backgroundColor: getScoreColor(score)
                                        }}
                                      />
                                    </div>
                                    {reason && (
                                      <div className="metric-reasoning-text">{reason}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Context (if available) */}
                        {test.context && test.context.length > 0 && (
                          <div className="test-context">
                            <h4 className="test-context-title">Retrieval Context</h4>
                            <div className="test-context-list">
                              {test.context.map((ctx, idx) => (
                                <div key={idx} className="test-context-item">
                                  {ctx}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button onClick={() => navigate('/')} className="btn-secondary">
                New Evaluation
              </button>
              <button onClick={handleDownloadResults} className="btn-primary">
                <Download className="icon-sm" />
                Export Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
