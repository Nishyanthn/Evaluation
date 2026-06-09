import React, { useState } from 'react';
import { Upload, X, CheckCircle2, FileText, Calendar, User, Sparkles, Trash2, Download, Loader } from 'lucide-react';
import * as XLSX from 'xlsx';
import '../styles/styleTestcase_beta.css';
import { useNavigate } from "react-router-dom";
import WorkflowShell from '../layout/WorkflowShell.jsx';


export default function TestcaseBeta({ onComplete, initialDataset }) {

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedOption, setSelectedOption] = useState('manual');

  // LLM Generation States
  const [llmDatasetName, setLlmDatasetName] = useState('');
  const [llmModel, setLlmModel] = useState('gpt-4');
  const [numTestCases, setNumTestCases] = useState(20);
  const [customPrompt, setCustomPrompt] = useState('');
  const [kbFiles, setKbFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDataset, setGeneratedDataset] = useState(null);

  // Test scenario tags for LLM generation
  const SCENARIO_OPTIONS = [
    { value: 'happy_path', label: 'Happy Path' },
    { value: 'angry_customer', label: 'Angry Customer' },
    { value: 'multi_turn', label: 'Multi-turn Follow-ups' },
    { value: 'out_of_scope', label: 'Out-of-scope Deflections' },
    { value: 'sensitive_topics', label: 'Sensitive Topics' },
    { value: 'edge_cases', label: 'Edge Cases' },
  ];
  const [selectedScenarios, setSelectedScenarios] = useState([]);

  const toggleScenario = (value) => {
    setSelectedScenarios(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const navigate = useNavigate();


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleKbFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setKbFiles(prevFiles => [...prevFiles, ...files]);
  };

  const removeKbFile = (indexToRemove) => {
    setKbFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleGenerateTestCases = async () => {
    if (!llmDatasetName.trim()) {
      alert('Please provide a dataset name');
      return;
    }

    setIsGenerating(true);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('datasetName', llmDatasetName);
      formData.append('modelName', llmModel);
      formData.append('numTestCases', numTestCases.toString());
      formData.append('customPrompt', customPrompt);
      if (selectedScenarios.length > 0) {
        formData.append('scenarios', selectedScenarios.join(','));
      }

      // Add KB files
      kbFiles.forEach(file => {
        formData.append('kbFiles', file);
      });

      console.log('Generating test cases...');

      // Call backend API
      const response = await fetch('http://localhost:8001/api/generate-test-cases', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Generated dataset:', result);

      // Create dataset object
      const newDataset = {
        id: Date.now(),
        name: result.datasetName,
        version: result.version,
        createdBy: 'AI Generated',
        createdOn: result.createdOn,
        data: result.data,
        fileName: `${result.datasetName}.csv`
      };

      setGeneratedDataset(newDataset);
      setDatasets([...datasets, newDataset]);
      setSelectedDataset(newDataset);
      setIsGenerating(false);

      alert(`Successfully generated ${result.totalCases} test cases!`);

    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      alert(
        `Error generating test cases: ${error.message}\n\n` +
        `Make sure the backend server is running on http://localhost:8001`
      );
    }
  };

  const handleDownloadDataset = async (dataset) => {
    try {
      const response = await fetch('http://localhost:8001/api/download-dataset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataset)
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset.name}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading dataset: ' + error.message);
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).filter(line => line.trim()).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row = { id: index + 1 };
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
  };

  const parseJSON = (text) => {
    const parsed = JSON.parse(text);
    // Handle both array and object formats
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => ({ id: index + 1, ...item }));
    } else {
      // If it's an object, convert to array with single item
      return [{ id: 1, ...parsed }];
    }
  };

  const parseJSONL = (text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const parsed = JSON.parse(line);
      return { id: index + 1, ...parsed };
    });
  };

  const parseXLSX = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          const withIds = jsonData.map((item, index) => ({ id: index + 1, ...item }));
          resolve(withIds);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUploadSubmit = async () => {
    if (!uploadedFile || !datasetName) {
      alert('Please provide both file and dataset name');
      return;
    }

    try {
      let parsedData;

      if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
        parsedData = await parseXLSX(uploadedFile);
      } else {
        const text = await uploadedFile.text();
        
        if (uploadedFile.name.endsWith('.csv')) {
          parsedData = parseCSV(text);
        } else if (uploadedFile.name.endsWith('.json')) {
          parsedData = parseJSON(text);
        } else if (uploadedFile.name.endsWith('.jsonl')) {
          parsedData = parseJSONL(text);
        } else {
          alert('Only CSV, JSON, JSONL, and XLSX files are supported');
          return;
        }
      }

      // Ensure parsedData is always an array
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        alert('No valid data found in the file');
        return;
      }

      const newDataset = {
        id: Date.now(),
        name: datasetName,
        version: 1,
        createdBy: 'Current User',
        createdOn: new Date().toLocaleDateString(),
        data: parsedData,
        fileName: uploadedFile.name
      };

      setDatasets([...datasets, newDataset]);
      setUploadModalOpen(false);
      setDatasetName('');
      setUploadedFile(null);
    } catch (error) {
      alert('Error parsing file: ' + error.message);
      console.error('Parse error:', error);
    }
  };

  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset);
  };

  const handleNext = () => {
    if (!selectedDataset) {
      alert('Please select a dataset before proceeding');
      return;
    }
    if (onComplete) {
      onComplete(selectedDataset);
    }
    navigate('/eval/field-mapping');
  };

  return (
    <WorkflowShell currentStep={1} title="Test Data Generation">
      <div className="content-wrapper">
            <h2 className="section-title">Test Data Generation</h2>

            {/* Radio Options */}
            <div className="radio-options">
              <label className={`radio-option ${selectedOption === 'manual' ? 'radio-option-selected' : ''}`}>
                <input
                  type="radio"
                  name="generation-method"
                  value="manual"
                  checked={selectedOption === 'manual'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="radio-input"
                />
                <div className="radio-content">
                  <div className="radio-title">Manual Upload of Dataset</div>
                  <div className="radio-description">
                    Upload a CSV, JSON, JSONL, or XLSX with test datas (user_query, expected_response, metadata)
                  </div>
                </div>
              </label>

              <label className={`radio-option ${selectedOption === 'llm' ? 'radio-option-selected' : ''}`}>
                <input
                  type="radio"
                  name="generation-method"
                  value="llm"
                  checked={selectedOption === 'llm'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="radio-input"
                />
                <div className="radio-content">
                  <div className="radio-title">Generate Test Datas via LLM</div>
                  <div className="radio-description">
                    Upload optional Knowledge Base documents and let the LLM generate test datas
                  </div>
                </div>
              </label>
            </div>

            {/* Manual Upload Section */}
            {selectedOption === 'manual' && (
              <div className="section-content">
                <p className="form-hint" style={{marginBottom: '1rem'}}>
                  Tip: include a <code>scenario</code> column in your file (e.g. <em>happy_path</em>, <em>angry_customer</em>) to enable per-scenario failure analysis in results.
                </p>
                <button onClick={() => setUploadModalOpen(true)} className="btn-primary">
                  Upload New Dataset
                </button>

                {/* Datasets Table */}
                {datasets.length > 0 && (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>Version</th>
                          <th>Created By</th>
                          <th>Created On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datasets.map((dataset) => (
                          <tr
                            key={dataset.id}
                            onClick={() => handleDatasetSelect(dataset)}
                            className={`table-row ${selectedDataset?.id === dataset.id ? 'table-row-selected' : ''}`}
                          >
                            <td>
                              <input
                                type="radio"
                                checked={selectedDataset?.id === dataset.id}
                                onChange={() => handleDatasetSelect(dataset)}
                                className="radio-input"
                              />
                            </td>
                            <td>
                              <div className="table-cell-icon">
                                <FileText className="icon-sm" />
                                {dataset.name}
                              </div>
                            </td>
                            <td className="text-secondary">{dataset.version}</td>
                            <td className="text-secondary">
                              <div className="table-cell-icon">
                                <User className="icon-sm" />
                                {dataset.createdBy}
                              </div>
                            </td>
                            <td className="text-secondary">
                              <div className="table-cell-icon">
                                <Calendar className="icon-sm" />
                                {dataset.createdOn}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Dataset Preview */}
                {selectedDataset && selectedDataset.data && Array.isArray(selectedDataset.data) && selectedDataset.data.length > 0 && (
                  <div className="preview-container">
                    <h3 className="preview-title">Dataset Preview (Top 5 rows)</h3>
                    <div className="preview-scroll">
                      <table className="preview-table">
                        <thead>
                          <tr>
                            {Object.keys(selectedDataset.data[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDataset.data.slice(0, 5).map((row, idx) => (
                            <tr key={idx}>
                              {Object.values(row).map((value, vidx) => (
                                <td key={vidx}>{String(value)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LLM Generation Section */}
            {selectedOption === 'llm' && (
              <div className="section-content">
                <div className="llm-generation-container">
                  {/* Header with Icon */}
                  <div className="llm-header">
                    <Sparkles className="llm-header-icon" />
                    <h3 className="llm-header-title">AI-Powered Test Generation</h3>
                  </div>

                  {/* Dataset Name */}
                  <div className="form-group">
                    <label className="form-label">
                      Dataset Name <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      value={llmDatasetName}
                      onChange={(e) => setLlmDatasetName(e.target.value)}
                      placeholder="Enter a name for the generated dataset"
                      className="form-input"
                    />
                  </div>

                  {/* Model Selection */}
                  <div className="form-group">
                    <label className="form-label">
                      Select Model <span className="required-star">*</span>
                    </label>
                    <select
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      className="form-input model-select"
                    >
                      <option value="gpt-4">GPT-4 (Recommended)</option>
                      <option value="gpt-4-turbo">GPT - 4o mini</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="azure-gpt-4">Azure GPT-4</option>
                    </select>
                  </div>

                  {/* Number of Test Cases - Slider */}
                  <div className="form-group">
                    <label className="form-label">
                      Number of Test datas
              
                      <span className="test-count-badge">{numTestCases}</span>
                    </label>
                    <div className="slider-container">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={numTestCases}
                        onChange={(e) => setNumTestCases(parseInt(e.target.value))}
                        className="slider"
                      />
                      <div className="slider-labels">
                        <span className="slider-label">1</span>
                        <span className="slider-label">50</span>
                        <span className="slider-label">100</span>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={numTestCases}
                      onChange={(e) => setNumTestCases(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                      className="form-input number-input-small"
                      placeholder="Or enter manually"
                    />
                  </div>

                  {/* Custom Prompt */}
                  <div className="form-group">
                    <label className="form-label">
                      Custom Prompt 
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Provide specific instructions for test case generation. For example: 'Generate test cases focusing on edge cases and error handling...'"
                      className="form-textarea"
                      rows="6"
                    />
                    <div className="form-hint">
                      Give the LLM specific instructions on what kind of test datas to generate
                    </div>
                  </div>

                  {/* Test Scenarios */}
                  <div className="form-group">
                    <label className="form-label">Test Scenarios (Optional)</label>
                    <p className="form-hint" style={{marginBottom: '0.5rem'}}>
                      Tag the generated test cases by scenario type. Enables failure analysis by scenario in results.
                    </p>
                    <div className="scenario-tags">
                      {SCENARIO_OPTIONS.map(s => (
                        <button
                          key={s.value}
                          type="button"
                          className={`scenario-tag ${selectedScenarios.includes(s.value) ? 'scenario-tag-active' : ''}`}
                          onClick={() => toggleScenario(s.value)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Knowledge Base Upload */}
                  <div className="form-group">
                    <label className="form-label">
                      Upload Knowledge Base (Optional)
                    </label>
                    <div className="kb-upload-container">
                      <div className="upload-area-enhanced">
                        <Upload className="upload-icon" />
                        <h3 className="upload-title">Drop KB files here or click to browse</h3>
                        <p className="upload-description">PDF, TXT, or Markdown files accepted</p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.txt,.md"
                          onChange={handleKbFileUpload}
                          className="file-input-hidden"
                          id="kb-upload"
                        />
                        <label htmlFor="kb-upload" className="btn-secondary">
                          Choose Files
                        </label>
                      </div>

                      {/* Uploaded Files List */}
                      {kbFiles.length > 0 && (
                        <div className="uploaded-files-list">
                          <div className="uploaded-files-header">
                            <span className="uploaded-files-count">{kbFiles.length} file(s) uploaded</span>
                          </div>
                          {kbFiles.map((file, index) => (
                            <div key={index} className="uploaded-file-item">
                              <FileText className="file-icon" />
                              <span className="file-name">{file.name}</span>
                              <span className="file-size">
                                {(file.size / 1024).toFixed(2)} KB
                              </span>
                              <button
                                onClick={() => removeKbFile(index)}
                                className="remove-file-btn"
                                title="Remove file"
                              >
                                <Trash2 className="icon-sm" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateTestCases}
                    disabled={isGenerating}
                    className="btn-primary btn-generate"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="btn-icon btn-spinner" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="btn-icon" />
                        Generate Test Datas
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Dataset Display */}
                {generatedDataset && (
                  <div className="section-content" style={{marginTop: '2rem'}}>
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Version</th>
                            <th>Created By</th>
                            <th>Created On</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            onClick={() => handleDatasetSelect(generatedDataset)}
                            className={`table-row ${selectedDataset?.id === generatedDataset.id ? 'table-row-selected' : ''}`}
                          >
                            <td>
                              <input
                                type="radio"
                                checked={selectedDataset?.id === generatedDataset.id}
                                onChange={() => handleDatasetSelect(generatedDataset)}
                                className="radio-input"
                              />
                            </td>
                            <td>
                              <div className="table-cell-icon">
                                <Sparkles className="icon-sm" style={{color: '#f97316'}} />
                                {generatedDataset.name}
                              </div>
                            </td>
                            <td className="text-secondary">{generatedDataset.version}</td>
                            <td className="text-secondary">
                              <div className="table-cell-icon">
                                <User className="icon-sm" />
                                {generatedDataset.createdBy}
                              </div>
                            </td>
                            <td className="text-secondary">
                              <div className="table-cell-icon">
                                <Calendar className="icon-sm" />
                                {generatedDataset.createdOn}
                              </div>
                            </td>
                            <td>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadDataset(generatedDataset);
                                }}
                                className="btn-download"
                                title="Download CSV"
                              >
                                <Download className="icon-sm" />
                                Download
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Dataset Preview */}
                    {generatedDataset.data && generatedDataset.data.length > 0 && (
                      <div className="preview-container" style={{marginTop: '1rem'}}>
                        <h3 className="preview-title">Dataset Preview (First 5 rows)</h3>
                        <div className="preview-scroll">
                          <table className="preview-table">
                            <thead>
                              <tr>
                                {Object.keys(generatedDataset.data[0]).map((key) => (
                                  <th key={key}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {generatedDataset.data.slice(0, 5).map((row, idx) => (
                                <tr key={idx}>
                                  {Object.values(row).map((value, vidx) => (
                                    <td key={vidx}>{String(value).substring(0, 100)}{String(value).length > 100 ? '...' : ''}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button disabled className="btn-disabled">
                Back
              </button>
              <button onClick={handleNext} className="btn-primary">Next</button>
            </div>
          </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Upload Dataset</h3>
              <button onClick={() => setUploadModalOpen(false)} className="modal-close">
                <X className="icon-sm" />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Dataset Name</label>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="Enter dataset name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">File Upload</label>
                <div className="upload-area-small">
                  {uploadedFile ? (
                    <div className="upload-success">
                      <CheckCircle2 className="icon-sm" />
                      <span>{uploadedFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="upload-icon-small" />
                      <p className="upload-description">CSV, JSON, JSONL, or XLSX file</p>
                      <input type="file" accept=".csv,.json,.jsonl,.xlsx,.xls" onChange={handleFileUpload} className="file-input-hidden" id="file-upload" />
                      <label htmlFor="file-upload" className="btn-secondary-sm">
                        Choose File
                      </label>
                    </>
                  )}
                </div>
              </div>

              <button onClick={handleUploadSubmit} className="btn-primary btn-full">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkflowShell>
  );
}