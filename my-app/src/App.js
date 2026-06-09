import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Portal pages
import KnowledgeArea from './Components/frontend/pages/KnowledgeArea.jsx';

// Workflow pages
import TestcaseBeta from './Components/frontend/pages/testcase_beta.jsx';
import FieldMapBeta from './Components/frontend/pages/fieldmap_beta.jsx';
import CriteriaBeta from './Components/frontend/pages/criteria_beta.jsx';
import ReviewBeta from './Components/frontend/pages/review_beta.jsx';
import ResultsBeta from './Components/frontend/pages/results_beta.jsx';
import HumanReviewBeta from './Components/frontend/pages/human_review_beta.jsx';

// State wrapper for the multi-step evaluation workflow
function EvaluationWorkflow() {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [evaluationData, setEvaluationData] = useState({
    dataset: null,
    fieldMappings: null,
    criteria: null,
    judgeModel: null,
  });

  const handleTestCaseComplete = (dataset) => {
    setSelectedDataset(dataset);
    setEvaluationData(prev => ({ ...prev, dataset }));
  };

  const handleFieldMappingComplete = (mappings, judgeModel) => {
    setEvaluationData(prev => ({ ...prev, fieldMappings: mappings, judgeModel }));
  };

  const handleCriteriaComplete = (criteriaData) => {
    setEvaluationData(prev => ({ ...prev, criteria: criteriaData }));
  };

  return (
    <Routes>
      {/* Portal home */}
      <Route path="/" element={<Navigate to="/knowledge" replace />} />
      <Route path="/knowledge" element={<KnowledgeArea />} />

      {/* Evaluation workflow */}
      <Route
        path="/eval/new"
        element={
          <TestcaseBeta
            onComplete={handleTestCaseComplete}
            initialDataset={selectedDataset}
          />
        }
      />
      <Route
        path="/eval/field-mapping"
        element={
          <FieldMapBeta
            selectedDataset={selectedDataset}
            onNext={handleFieldMappingComplete}
          />
        }
      />
      <Route
        path="/eval/criteria"
        element={
          <CriteriaBeta
            selectedDataset={selectedDataset}
            fieldMappings={evaluationData.fieldMappings}
            judgeModel={evaluationData.judgeModel}
            onNext={handleCriteriaComplete}
          />
        }
      />
      <Route
        path="/eval/review"
        element={
          <ReviewBeta
            selectedDataset={selectedDataset}
            fieldMappings={evaluationData.fieldMappings}
            judgeModel={evaluationData.judgeModel}
            criteriaData={evaluationData.criteria}
          />
        }
      />
      <Route path="/eval/results" element={<ResultsBeta />} />
      <Route path="/eval/human-review" element={<HumanReviewBeta />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <EvaluationWorkflow />
    </Router>
  );
}

export default App;

