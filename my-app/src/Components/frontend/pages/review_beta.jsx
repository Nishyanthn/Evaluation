import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, CheckCircle, Settings, FileText, Loader } from 'lucide-react';
import '../styles/styleTestcase_beta.css';
import '../styles/styleReview_beta.css';
import WorkflowShell from '../layout/WorkflowShell.jsx';

export default function ReviewBeta({
  selectedDataset,
  fieldMappings,
  judgeModel,
  criteriaData,
  onBack
}) {
  const navigate = useNavigate();
  const [evaluationName, setEvaluationName] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Generate default evaluation name
  useEffect(() => {
    if (selectedDataset) {
      const timestamp = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      setEvaluationName(`${selectedDataset.name} - ${timestamp}`);
    }
  }, [selectedDataset]);

  // Check if required data is available
  useEffect(() => {
    if (!selectedDataset || !fieldMappings || !criteriaData) {
      alert('Please complete all previous steps first');
      navigate('/knowledge');
    }
  }, [selectedDataset, fieldMappings, criteriaData, navigate]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    navigate('/eval/criteria');
  };

  const handleRunEvaluation = async () => {
    if (!evaluationName.trim()) {
      alert('Please provide a name for this evaluation run');
      return;
    }

    setIsRunning(true);

    try {
      // Prepare evaluation request payload
      const evaluationRequest = {
        evaluationName: evaluationName,
        dataset: selectedDataset,
        fieldMappings: fieldMappings,
        judgeModel: judgeModel,
        criteriaData: criteriaData
      };

      console.log('Starting evaluation:', evaluationRequest);

      // Call backend API
      const response = await fetch('http://localhost:8001/api/run-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationRequest)
      });

      if (!response.ok) {
        throw new Error(`Evaluation failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Evaluation results:', result);

      setIsRunning(false);

      // Navigate to results page with evaluation data
      navigate('/eval/results', {
        state: {
          results: result
        }
      });

    } catch (error) {
      console.error('Evaluation error:', error);
      setIsRunning(false);
      alert(
        `Error running evaluation: ${error.message}\n\n` +
        `Make sure the backend server is running on http://localhost:8001`
      );
    }
  };

  if (!selectedDataset || !fieldMappings || !criteriaData) {
    return null;
  }

  // Get mapped field display
  const getMappedFieldDisplay = (key) => {
    const value = fieldMappings[key];
    if (!value || value === 'not_available') {
      return 'None';
    }
    return `{{item.${value}}}`;
  };

  // Get metric labels
  const getMetricLabels = () => {
    const metricMap = {
      'relevance': 'Answer Relevancy',
      'correctness': 'Correctness',
      'completeness': 'Completeness',
      'toxicity': 'Toxicity (Lower is Better)'
    };
    return criteriaData.selectedMetrics.map(id => metricMap[id] || id);
  };

  return (
    <WorkflowShell currentStep={4} title="Review and Run">
          <div className="content-wrapper">
            <h2 className="section-title">Review</h2>
            <p className="radio-description" style={{marginBottom: '1.5rem'}}>
              Review all configuration before running your evaluation
            </p>

            {/* Dataset Summary */}
            <div className="review-section">
              <div className="review-section-header">
                <Database className="review-icon" />
                <h3 className="review-section-title">Dataset Summary</h3>
              </div>
              <div className="review-content">
                <div className="review-row">
                  <span className="review-label">Dataset Name:</span>
                  <span className="review-value">{selectedDataset.name}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Version:</span>
                  <span className="review-value">{selectedDataset.version}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Test Cases:</span>
                  <span className="review-value">{selectedDataset.data?.length || 0}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">File Name:</span>
                  <span className="review-value">{selectedDataset.fileName}</span>
                </div>
              </div>

              {/* Preview Rows */}
              <div className="review-preview">
                <div className="review-preview-title">Preview (First 3 rows)</div>
                <div className="preview-scroll">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {selectedDataset.data && selectedDataset.data[0] &&
                          Object.keys(selectedDataset.data[0]).map(key => (
                            <th key={key}>{key}</th>
                          ))
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDataset.data && selectedDataset.data.slice(0, 3).map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((value, vidx) => (
                            <td key={vidx}>{String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Field Mapping Summary */}
            <div className="review-section">
              <div className="review-section-header">
                <CheckCircle className="review-icon" />
                <h3 className="review-section-title">Field Mapping Summary</h3>
              </div>
              <div className="review-content">
                <div className="review-row">
                  <span className="review-label">Judge Model:</span>
                  <span className="review-value review-value-highlight">{judgeModel}</span>
                </div>
                <div className="review-mapping-grid">
                  <div className="review-mapping-item">
                    <span className="review-mapping-label">Query →</span>
                    <code className="review-mapping-value">{getMappedFieldDisplay('query')}</code>
                  </div>
                  <div className="review-mapping-item">
                    <span className="review-mapping-label">Response →</span>
                    <code className="review-mapping-value">{getMappedFieldDisplay('response')}</code>
                  </div>
                  <div className="review-mapping-item">
                    <span className="review-mapping-label">Context →</span>
                    <code className="review-mapping-value">{getMappedFieldDisplay('context')}</code>
                  </div>
                  <div className="review-mapping-item">
                    <span className="review-mapping-label">Ground Truth →</span>
                    <code className="review-mapping-value">{getMappedFieldDisplay('ground_truth')}</code>
                  </div>
                  <div className="review-mapping-item">
                    <span className="review-mapping-label">Tool Calls →</span>
                    <code className="review-mapping-value">{getMappedFieldDisplay('tool_calls')}</code>
                  </div>
                  <div className="review-mapping-item">
                    <span className="review-mapping-label">Tool Definitions →</span>
                    <code className="review-mapping-value">{getMappedFieldDisplay('tool_definitions')}</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Criteria Summary */}
            <div className="review-section">
              <div className="review-section-header">
                <Settings className="review-icon" />
                <h3 className="review-section-title">Criteria Summary</h3>
              </div>
              <div className="review-content">
                <div className="review-row">
                  <span className="review-label">Metrics Selected:</span>
                  <div className="review-metrics">
                    {getMetricLabels().map((label, idx) => (
                      <span key={idx} className="review-metric-badge">{label}</span>
                    ))}
                  </div>
                </div>
                {criteriaData.customPrompt && (
                  <div className="review-row">
                    <span className="review-label">Custom Prompt:</span>
                    <code className="review-code-block">{criteriaData.customPrompt}</code>
                  </div>
                )}
                <div className="review-row">
                  <span className="review-label">Model Under Test:</span>
                  <span className="review-value review-value-highlight">{criteriaData.modelUnderTest}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Temperature:</span>
                  <span className="review-value">{criteriaData.temperature}</span>
                </div>
              </div>
            </div>

            {/* Evaluation Name */}
            <div className="review-section">
              <div className="review-section-header">
                <FileText className="review-icon" />
                <h3 className="review-section-title">Evaluation Name</h3>
              </div>
              <div className="review-content">
                <input
                  type="text"
                  value={evaluationName}
                  onChange={(e) => setEvaluationName(e.target.value)}
                  placeholder="Enter a name for this evaluation run"
                  className="form-input"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button onClick={handleBack} className="btn-secondary" disabled={isRunning}>
                Back
              </button>
              <button
                onClick={handleRunEvaluation}
                className="btn-primary btn-run-evaluation"
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Loader className="btn-spinner" />
                    Running Evaluation...
                  </>
                ) : (
                  'Run Evaluation'
                )}
              </button>
            </div>
          </div>

      {/* Loading Modal */}
      {isRunning && (
        <div className="modal-overlay">
          <div className="modal loading-modal">
            <div className="loading-content">
              <Loader className="loading-spinner" />
              <h3 className="loading-title">Running Evaluation</h3>
              <p className="loading-description">
                This may take a few minutes. Please don't close this window.
              </p>
              <div className="loading-progress">
                <div className="loading-progress-bar"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </WorkflowShell>
  );
}
