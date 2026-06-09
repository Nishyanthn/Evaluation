import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import workflow components
import TestcaseBeta from "./Components/frontend/pages/testcase_beta.jsx";
import FieldMapBeta from './Components/frontend/pages/fieldmap_beta.jsx';
import CriteriaBeta from './Components/frontend/pages/criteria_beta.jsx';
import ReviewBeta from './Components/frontend/pages/review_beta.jsx';
import ResultsBeta from './Components/frontend/pages/results_beta.jsx';
import HumanReviewBeta from './Components/frontend/pages/human_review_beta.jsx';

// Wrapper component to manage state across the workflow
function EvaluationWorkflow() {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [evaluationData, setEvaluationData] = useState({
    dataset: null,
    fieldMappings: null,
    criteria: null,
    judgeModel: null
  });

  const handleTestCaseComplete = (dataset) => {
    setSelectedDataset(dataset);
    setEvaluationData(prev => ({ ...prev, dataset }));
  };

  const handleFieldMappingComplete = (mappings, judgeModel) => {
    setEvaluationData(prev => ({
      ...prev,
      fieldMappings: mappings,
      judgeModel: judgeModel
    }));
  };

  const handleFieldMappingBack = () => {
    // Optionally clear field mapping data when going back
  };

  const handleCriteriaComplete = (criteriaData) => {
    setEvaluationData(prev => ({
      ...prev,
      criteria: criteriaData
    }));
  };

  const handleCriteriaBack = () => {
    // Optionally clear criteria data when going back
  };

  const handleReviewBack = () => {
    // Optionally clear review data when going back
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <TestcaseBeta
            onComplete={handleTestCaseComplete}
            initialDataset={selectedDataset}
          />
        }
      />
      <Route
        path="/field-mapping"
        element={
          <FieldMapBeta
            selectedDataset={selectedDataset}
            onNext={handleFieldMappingComplete}
            onBack={handleFieldMappingBack}
          />

        }
      />
      <Route
        path="/criteria"
        element={
          <CriteriaBeta
            selectedDataset={selectedDataset}
            fieldMappings={evaluationData.fieldMappings}
            judgeModel={evaluationData.judgeModel}
            onNext={handleCriteriaComplete}
            onBack={handleCriteriaBack}
          />
        }
      />
      <Route
        path="/review"
        element={
          <ReviewBeta
            selectedDataset={selectedDataset}
            fieldMappings={evaluationData.fieldMappings}
            judgeModel={evaluationData.judgeModel}
            criteriaData={evaluationData.criteria}
            onBack={handleReviewBack}
          />
        }
      />
      <Route
        path="/results"
        element={<ResultsBeta />}
      />
      <Route
        path="/human-review"
        element={<HumanReviewBeta />}
      />
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
