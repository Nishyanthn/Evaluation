import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, RefreshCw, HelpCircle, Database } from 'lucide-react';
import '../styles/styleTestcase_beta.css';
import '../styles/styleFieldmap_beta.css';
import WorkflowShell from '../layout/WorkflowShell.jsx';

export default function FieldMapBeta({ selectedDataset, onNext, onBack }) {
  const navigate = useNavigate();

  // Judge model options
  const judgeModels = [
    { value: 'evaluator-gpt-4o', label: 'evaluator-gpt-4o' },
    { value: 'evaluator-gpt-4o-mini', label: 'evaluator-gpt-4o-mini' },
    { value: 'evaluator-company-llm', label: 'evaluator-company-llm' }
  ];

  // Field mapping configuration with tooltips
  const mappingFields = [
    {
      key: 'query',
      label: 'Query',
      required: true,
      tooltip: 'The user query or question to be evaluated'
    },
    {
      key: 'response',
      label: 'Response',
      required: true,
      tooltip: 'The AI-generated response to be evaluated'
    },
    {
      key: 'context',
      label: 'Context',
      required: false,
      tooltip: 'Retrieved context or knowledge base chunks used to generate the response'
    },
    {
      key: 'ground_truth',
      label: 'Ground Truth',
      required: false,
      tooltip: 'The expected or ideal response for comparison'
    },
    {
      key: 'tool_calls',
      label: 'Tool Calls',
      required: false,
      tooltip: 'Tool or function calls made during response generation'
    },
    {
      key: 'tool_definitions',
      label: 'Tool Definitions',
      required: false,
      tooltip: 'Definitions of tools or functions available to the AI'
    }
  ];

  const [judgeModel, setJudgeModel] = useState('evaluator-gpt-4o');
  const [fieldMappings, setFieldMappings] = useState({});
  const [availableFields, setAvailableFields] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-detect field mappings when dataset is loaded
  useEffect(() => {
    if (selectedDataset && selectedDataset.data && selectedDataset.data.length > 0) {
      const fields = Object.keys(selectedDataset.data[0]);
      setAvailableFields(fields);

      // Auto-detect mappings
      const autoMappings = autoDetectMappings(fields);
      setFieldMappings(autoMappings);
    }
  }, [selectedDataset]);

  // Auto-detection logic
  const autoDetectMappings = (fields) => {
    const mappings = {};

    // Common field name patterns
    const patterns = {
      query: ['user_query', 'query', 'question', 'user_input', 'input', 'prompt'],
      response: ['response', 'answer', 'output', 'agent_response', 'expected_response'],
      context: ['context', 'retrieved_context', 'contexts', 'knowledge'],
      ground_truth: ['expected_response', 'ground_truth', 'expected_output', 'ideal_response'],
      tool_calls: ['tool_calls', 'function_calls', 'tools'],
      tool_definitions: ['tool_definitions', 'function_definitions', 'tool_schemas']
    };

    // Try to match each mapping field to available fields
    mappingFields.forEach(({ key }) => {
      const matchedField = fields.find(field => {
        const lowerField = field.toLowerCase();
        return patterns[key]?.some(pattern => lowerField.includes(pattern.toLowerCase()));
      });

      mappings[key] = matchedField || 'not_available';
    });

    return mappings;
  };

  const handleMappingChange = (mappingKey, value) => {
    setFieldMappings(prev => ({
      ...prev,
      [mappingKey]: value
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      if (selectedDataset && selectedDataset.data && selectedDataset.data.length > 0) {
        const fields = Object.keys(selectedDataset.data[0]);
        const autoMappings = autoDetectMappings(fields);
        setFieldMappings(autoMappings);
      }
      setIsRefreshing(false);
    }, 500);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    navigate('/knowledge');
  };

  const handleNext = () => {
    // Validate required fields
    const requiredFields = mappingFields.filter(f => f.required);
    const missingFields = requiredFields.filter(f =>
      !fieldMappings[f.key] || fieldMappings[f.key] === 'not_available'
    );

    if (missingFields.length > 0) {
      alert(`Please map the following required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    if (onNext) {
      onNext(fieldMappings, judgeModel);
    }
    navigate('/eval/criteria');
  };

  // Redirect if no dataset selected
  useEffect(() => {
    if (!selectedDataset) {
      alert('Please select a dataset first');
      navigate('/knowledge');
    }
  }, [selectedDataset, navigate]);

  if (!selectedDataset) {
    return null;
  }

  return (
    <WorkflowShell currentStep={2} title="Field Mapping">
          <div className="content-wrapper">
            <h2 className="section-title">Field Mapping</h2>
            <p className="radio-description" style={{marginBottom: '1.5rem'}}>
              Map your dataset fields to the standard evaluator fields
            </p>

            {/* Dataset Info Banner */}
            <div className="dataset-info-banner">
              <div className="dataset-info-icon">
                <Database />
              </div>
              <div className="dataset-info-content">
                <div className="dataset-info-name">{selectedDataset.name}</div>
                <div className="dataset-info-meta">
                  {selectedDataset.data?.length || 0} test cases " Version {selectedDataset.version}
                </div>
              </div>
            </div>

            <div className="fieldmap-layout">
              {/* Left Column - Main Content */}
              <div className="fieldmap-main-content">
                {/* Judge Model Selection */}
                <div className="judge-model-section">
                  <h3>Judge Model <span className="mapping-required">*</span></h3>
                  <p className="judge-model-description">
                    Select the AI model that will evaluate your test cases
                  </p>
                  <select
                    value={judgeModel}
                    onChange={(e) => setJudgeModel(e.target.value)}
                    className="form-input"
                  >
                    {judgeModels.map(model => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto-Detection Notice */}
                <div className="auto-detect-notice">
                  <RefreshCw className={isRefreshing ? 'spinning' : ''} />
                  <span>We've auto-detected likely matches.</span>
                  <button
                    onClick={handleRefresh}
                    className="refresh-button"
                    disabled={isRefreshing}
                    style={{marginLeft: 'auto'}}
                  >
                    <RefreshCw className={isRefreshing ? 'spinning' : ''} />
                  </button>
                </div>

                {/* Mapping Fields */}
                <div className="mapping-fields-section">
                  <h3>Field Mappings</h3>

                  {mappingFields.map(field => (
                    <div key={field.key} className="mapping-field-group">
                      <div className="mapping-field-label">
                        <span>
                          {field.label}
                          {field.required && <span className="mapping-required"> *</span>}
                        </span>
                        <div className="mapping-tooltip">
                          <HelpCircle className="mapping-tooltip-icon" />
                          <span className="mapping-tooltip-text">{field.tooltip}</span>
                        </div>
                      </div>
                      <select
                        value={fieldMappings[field.key] || 'not_available'}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        className={`mapping-select ${fieldMappings[field.key] === 'not_available' ? 'not-available' : ''}`}
                      >
                        <option value="not_available" disabled>
                          Not available
                        </option>
                        {availableFields.map(availField => (
                          <option key={availField} value={availField}>
                            {`{{item.${availField}}}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Info Panel */}
              <div className="fieldmap-info-panel">
                <div className="info-panel-section">
                  <div className="info-panel-title">
                    <FileText style={{width: '16px', height: '16px'}} />
                    Available fields in your file
                  </div>
                  <div className="field-chips">
                    {availableFields.map(field => (
                      <div key={field} className="field-chip">
                        {field}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="info-panel-section">
                  <div className="info-panel-title">
                    <HelpCircle style={{width: '16px', height: '16px'}} />
                    Why field mapping now?
                  </div>
                  <p className="info-panel-description">
                    Field mapping ensures that your dataset columns are correctly aligned with
                    the evaluator's expected input format. This standardization is crucial for
                    accurate evaluation across different metrics.
                  </p>
                </div>

                <div className="info-panel-section">
                  <div className="info-panel-title">
                    <HelpCircle style={{width: '16px', height: '16px'}} />
                    What evaluators are affected?
                  </div>
                  <p className="info-panel-description">
                    All selected metrics (Faithfulness, Contextual Precision, Answer Relevancy, etc.)
                    rely on properly mapped fields. Missing required fields may cause certain
                    evaluators to be skipped.
                  </p>
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
    </WorkflowShell>
  );
}
