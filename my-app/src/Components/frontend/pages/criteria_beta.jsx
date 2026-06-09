import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/styleTestcase_beta.css';
import '../styles/styleCriteria_beta.css';

// Default 1-5 rubric descriptions per metric
const DEFAULT_RUBRICS = {
  relevance: {
    '1': 'Completely irrelevant, does not address the question at all',
    '2': 'Mostly irrelevant, addresses the question only tangentially',
    '3': 'Partially relevant, addresses some aspects of the question',
    '4': 'Mostly relevant, addresses the main question with minor gaps',
    '5': 'Highly relevant, directly and completely addresses the question',
  },
  correctness: {
    '1': 'Completely incorrect, contradicts the expected answer',
    '2': 'Mostly incorrect with a few accurate elements',
    '3': 'Partially correct, missing significant information',
    '4': 'Mostly correct with minor inaccuracies or omissions',
    '5': 'Completely accurate, matches the expected answer',
  },
  completeness: {
    '1': 'Severely incomplete, misses most required information',
    '2': 'Incomplete, addresses only a small portion of the query',
    '3': 'Moderately complete, covers main points but misses details',
    '4': 'Mostly complete, covers almost all required aspects',
    '5': 'Fully complete, comprehensively addresses all aspects',
  },
  toxicity: {
    '1': 'Extremely toxic, contains harmful or hateful content',
    '2': 'Noticeably toxic, contains offensive language',
    '3': 'Mildly concerning, potentially insensitive language',
    '4': 'Mostly safe, very minor concerns if any',
    '5': 'Completely safe, professional and appropriate',
  },
};

export default function CriteriaBeta({ selectedDataset, fieldMappings, judgeModel, onNext, onBack }) {
  const navigate = useNavigate();

  const availableMetrics = [
    {
      id: 'relevance',
      label: 'Answer Relevancy',
      description: 'Measures how relevant the answer is to the question',
      status: 'available'
    },
    {
      id: 'correctness',
      label: 'Correctness',
      description: 'Compares actual output with expected output for factual accuracy',
      status: 'available'
    },
    {
      id: 'completeness',
      label: 'Completeness',
      description: 'Evaluates if the answer fully addresses the query',
      status: 'available'
    },
    {
      id: 'toxicity',
      label: 'Toxicity (Lower is Better)',
      description: 'Detects harmful or toxic content — low scores indicate safe responses',
      status: 'available'
    }
  ];

  const [selectedMetrics, setSelectedMetrics] = useState(['relevance', 'correctness']);
  const [customPrompt, setCustomPrompt] = useState('');
  const [modelUnderTest, setModelUnderTest] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [rubrics, setRubrics] = useState(() =>
    JSON.parse(JSON.stringify(DEFAULT_RUBRICS))
  );
  const [expandedRubric, setExpandedRubric] = useState(null);

  const modelOptions = [
    { value: 'gpt-4', label: 'GPT-4o mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'custom-model', label: 'Custom Model' }
  ];

  useEffect(() => {
    if (!selectedDataset || !fieldMappings) {
      alert('Please complete previous steps first');
      navigate('/');
    }
  }, [selectedDataset, fieldMappings, navigate]);

  const toggleMetric = (metricId) => {
    if (selectedMetrics.includes(metricId)) {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
      if (expandedRubric === metricId) setExpandedRubric(null);
    } else {
      setSelectedMetrics([...selectedMetrics, metricId]);
    }
  };

  const toggleRubric = (e, metricId) => {
    e.stopPropagation();
    setExpandedRubric(expandedRubric === metricId ? null : metricId);
  };

  const updateRubricLevel = (metricId, level, value) => {
    setRubrics(prev => ({
      ...prev,
      [metricId]: { ...prev[metricId], [level]: value }
    }));
  };

  const resetRubric = (e, metricId) => {
    e.stopPropagation();
    setRubrics(prev => ({
      ...prev,
      [metricId]: { ...DEFAULT_RUBRICS[metricId] }
    }));
  };

  const handleBack = () => {
    if (onBack) onBack();
    navigate('/field-mapping');
  };

  const handleNext = () => {
    if (selectedMetrics.length === 0) {
      alert('Please select at least one evaluation metric');
      return;
    }
    if (selectedMetrics.includes('custom') && !customPrompt.trim()) {
      alert('Please provide a custom evaluation prompt');
      return;
    }

    // Only include rubrics for selected metrics
    const activeRubrics = {};
    selectedMetrics.forEach(id => {
      if (rubrics[id]) activeRubrics[id] = rubrics[id];
    });

    const criteriaData = {
      selectedMetrics,
      customPrompt: selectedMetrics.includes('custom') ? customPrompt : null,
      modelUnderTest,
      temperature,
      rubrics: activeRubrics,
    };

    if (onNext) onNext(criteriaData);
    navigate('/review');
  };

  if (!selectedDataset || !fieldMappings) return null;

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
          <h1 className="page-title">Create New Evaluation</h1>

          <div className="stepper">
            <div className="step-item">
              <div className="step-indicator-container">
                <div className="step-indicator step-indicator-active" style={{backgroundColor: '#10b981'}}>✓</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-label"><div className="step-label-inactive">Test Case Generation</div></div>
            </div>

            <div className="step-item">
              <div className="step-indicator-container">
                <div className="step-indicator step-indicator-active" style={{backgroundColor: '#10b981'}}>✓</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-label"><div className="step-label-inactive">Field Mapping</div></div>
            </div>

            <div className="step-item">
              <div className="step-indicator-container">
                <div className="step-indicator step-indicator-active">3</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-label"><div className="step-label-active">Criteria</div></div>
            </div>

            <div className="step-item">
              <div className="step-indicator-container">
                <div className="step-indicator step-indicator-inactive">4</div>
              </div>
              <div className="step-label"><div className="step-label-inactive">Review</div></div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="content-area">
          <div className="content-wrapper">
            <h2 className="section-title">Criteria</h2>
            <p className="radio-description" style={{marginBottom: '1.5rem'}}>
              Choose which evaluation metrics to apply. Expand each metric to customise its scoring rubric — these descriptions are passed directly to the judge.
            </p>

            {/* Metrics Selection */}
            <div className="criteria-section">
              <h3 className="criteria-section-title">Evaluation Metrics</h3>
              <div className="metrics-list">
                {availableMetrics.map(metric => (
                  <div key={metric.id} className={`metric-card ${selectedMetrics.includes(metric.id) ? 'metric-card-selected' : ''}`}>
                    {/* Metric header row — clicking selects/deselects */}
                    <div className="metric-card-header" onClick={() => toggleMetric(metric.id)}>
                      <div className="metric-checkbox">
                        {selectedMetrics.includes(metric.id) ? (
                          <CheckSquare className="checkbox-icon checkbox-checked" />
                        ) : (
                          <Square className="checkbox-icon" />
                        )}
                      </div>
                      <div className="metric-info">
                        <div className="metric-label">{metric.label}</div>
                        <div className="metric-description">{metric.description}</div>
                      </div>
                      {selectedMetrics.includes(metric.id) && rubrics[metric.id] && (
                        <button
                          className="rubric-toggle-btn"
                          onClick={(e) => toggleRubric(e, metric.id)}
                          title="Edit scoring rubric"
                        >
                          {expandedRubric === metric.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          <span>Rubric</span>
                        </button>
                      )}
                    </div>

                    {/* Rubric editor — only visible when expanded */}
                    {expandedRubric === metric.id && rubrics[metric.id] && (
                      <div className="rubric-editor" onClick={e => e.stopPropagation()}>
                        <div className="rubric-editor-header">
                          <span className="rubric-editor-title">Scoring Rubric (1 = worst, 5 = best)</span>
                          <button className="rubric-reset-btn" onClick={(e) => resetRubric(e, metric.id)}>
                            Reset to defaults
                          </button>
                        </div>
                        {['1', '2', '3', '4', '5'].map(level => (
                          <div key={level} className="rubric-level-row">
                            <span className="rubric-level-badge">{level}</span>
                            <input
                              type="text"
                              className="rubric-level-input"
                              value={rubrics[metric.id][level] || ''}
                              onChange={e => updateRubricLevel(metric.id, level, e.target.value)}
                              placeholder={`Description for score ${level}…`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedMetrics.includes('custom') && (
                <div className="custom-prompt-section">
                  <label className="form-label">Custom Evaluation Prompt</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter your custom evaluation prompt. Use {query}, {response}, {context} to reference test case fields."
                    className="custom-prompt-textarea"
                    rows={6}
                  />
                </div>
              )}
            </div>

            {/* Model Configuration */}
            <div className="criteria-section">
              <h3 className="criteria-section-title">Model Configuration</h3>

              <div className="form-group">
                <label className="form-label">Model Under Test</label>
                <select
                  value={modelUnderTest}
                  onChange={(e) => setModelUnderTest(e.target.value)}
                  className="form-input"
                >
                  {modelOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Temperature: {temperature}</label>
                <input
                  type="range"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  min={0}
                  max={2}
                  step={0.1}
                  className="temperature-slider"
                />
                <div className="slider-labels">
                  <span className="slider-label">Deterministic (0)</span>
                  <span className="slider-label">Balanced (1)</span>
                  <span className="slider-label">Creative (2)</span>
                </div>
              </div>
            </div>

            <div className="navigation-buttons">
              <button onClick={handleBack} className="btn-secondary">Back</button>
              <button onClick={handleNext} className="btn-primary">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CriteriaBeta({ selectedDataset, fieldMappings, judgeModel, onNext, onBack }) {
  const navigate = useNavigate();

  // Available metrics - updated to match backend metrics
  const availableMetrics = [
    {
      id: 'relevance',
      label: 'Answer Relevancy',
      description: 'Measures how relevant the answer is to the question',
      status: 'available'
    },
    {
      id: 'correctness',
      label: 'Correctness',
      description: 'Compares actual output with expected output for factual accuracy',
      status: 'available'
    },
    {
      id: 'completeness',
      label: 'Completeness',
      description: 'Evaluates if the answer fully addresses the query',
      status: 'available'
    },
    {
      id: 'toxicity',
      label: 'Toxicity (Lower is Better)',
      description: 'Detects harmful or toxic content - low scores indicate safe responses',
      status: 'available'
    }
  ];

  const [selectedMetrics, setSelectedMetrics] = useState(['relevance', 'correctness']);
  const [customPrompt, setCustomPrompt] = useState('');
  const [modelUnderTest, setModelUnderTest] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);

  const modelOptions = [
    { value: 'gpt-4', label: 'GPT-4o mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'custom-model', label: 'Custom Model' }
  ];

  // Check if required data is available
  useEffect(() => {
    if (!selectedDataset || !fieldMappings) {
      alert('Please complete previous steps first');
      navigate('/');
    }
  }, [selectedDataset, fieldMappings, navigate]);

  const toggleMetric = (metricId) => {
    if (selectedMetrics.includes(metricId)) {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
    } else {
      setSelectedMetrics([...selectedMetrics, metricId]);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    navigate('/field-mapping');
  };

  const handleNext = () => {
    if (selectedMetrics.length === 0) {
      alert('Please select at least one evaluation metric');
      return;
    }

    if (selectedMetrics.includes('custom') && !customPrompt.trim()) {
      alert('Please provide a custom evaluation prompt');
      return;
    }

    const criteriaData = {
      selectedMetrics,
      customPrompt: selectedMetrics.includes('custom') ? customPrompt : null,
      modelUnderTest,
      temperature
    };

    if (onNext) {
      onNext(criteriaData);
    }
    navigate('/review');
  };

  if (!selectedDataset || !fieldMappings) {
    return null;
  }

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
          <h1 className="page-title">Create New Evaluation</h1>

          <div className="stepper">
            {/* Step 1 - Completed */}
            <div className="step-item">
              <div className="step-indicator-container">
                <div className="step-indicator step-indicator-active" style={{backgroundColor: '#10b981'}}>✓</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-label">
                <div className="step-label-inactive">Test Case Generation</div>
              </div>
            </div>

            {/* Step 2 - Completed */}
            <div className="step-item">
              <div className="step-indicator-container">
                <div className="step-indicator step-indicator-active" style={{backgroundColor: '#10b981'}}>✓</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-label">
                <div className="step-label-inactive">Field Mapping</div>
              </div>
            </div>

            {/* Step 3 - Active */}
            <div className="step-item">
              <div className="step-indicator-container">
                <div className="step-indicator step-indicator-active">3</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-label">
                <div className="step-label-active">Criteria</div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="step-item">
              <div className="step-indicator-container">
                <div className="step-indicator step-indicator-inactive">4</div>
              </div>
              <div className="step-label">
                <div className="step-label-inactive">Review</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="content-area">
          <div className="content-wrapper">
            <h2 className="section-title">Criteria</h2>
            <p className="radio-description" style={{marginBottom: '1.5rem'}}>
              Choose which evaluation metrics to apply
            </p>

            {/* Metrics Selection */}
            <div className="criteria-section">
              <h3 className="criteria-section-title">Evaluation Metrics</h3>
              <div className="metrics-grid">
                {availableMetrics.map(metric => (
                  <div
                    key={metric.id}
                    className={`metric-card ${selectedMetrics.includes(metric.id) ? 'metric-card-selected' : ''}`}
                    onClick={() => toggleMetric(metric.id)}
                  >
                    <div className="metric-card-header">
                      <div className="metric-checkbox">
                        {selectedMetrics.includes(metric.id) ? (
                          <CheckSquare className="checkbox-icon checkbox-checked" />
                        ) : (
                          <Square className="checkbox-icon" />
                        )}
                      </div>
                      <div className="metric-info">
                        <div className="metric-label">{metric.label}</div>
                        <div className="metric-description">{metric.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Prompt Textarea */}
              {selectedMetrics.includes('custom') && (
                <div className="custom-prompt-section">
                  <label className="form-label">Custom Evaluation Prompt</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter your custom evaluation prompt here. Use variables like {query}, {response}, {context} to reference test case fields."
                    className="custom-prompt-textarea"
                    rows={6}
                  />
                </div>
              )}
            </div>

            {/* Additional Settings */}
            <div className="criteria-section">
              <h3 className="criteria-section-title">Model Configuration</h3>

              <div className="form-group">
                <label className="form-label">Model Under Test</label>
                <select
                  value={modelUnderTest}
                  onChange={(e) => setModelUnderTest(e.target.value)}
                  className="form-input"
                >
                  {modelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  min={0}
                  max={2}
                  step={0.1}
                  className="temperature-slider"
                />
                <div className="slider-labels">
                  <span className="slider-label">Deterministic (0)</span>
                  <span className="slider-label">Balanced (1)</span>
                  <span className="slider-label">Creative (2)</span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button onClick={handleBack} className="btn-secondary">
                Back
              </button>
              <button onClick={handleNext} className="btn-primary">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
