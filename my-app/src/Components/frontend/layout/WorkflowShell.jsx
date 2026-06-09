import React from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from './PortalLayout.jsx';
import './stylePortal.css';

const STEPS = [
  { id: 1, label: 'Test Data',     sub: 'Upload or generate' },
  { id: 2, label: 'Field Mapping', sub: 'Map dataset columns' },
  { id: 3, label: 'Criteria',      sub: 'Choose metrics' },
  { id: 4, label: 'Review',        sub: 'Confirm & run' },
  { id: 5, label: 'Results',       sub: 'View scores' },
];

/**
 * WorkflowShell wraps any workflow step page inside the portal layout.
 * Props:
 *   currentStep  – 1..5
 *   title        – page header text shown in topbar breadcrumb
 *   children     – the scrollable page content
 */
export default function WorkflowShell({ currentStep = 1, title = '', children }) {
  const navigate = useNavigate();

  return (
    <PortalLayout activeSection="knowledge">
      <div className="eval-workflow-panel">
        {/* Breadcrumb topbar */}
        <div className="eval-workflow-topbar">
          <button className="eval-workflow-back" onClick={() => navigate('/knowledge')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Evaluation
          </button>
          <span className="eval-workflow-crumb-sep">›</span>
          <span className="eval-workflow-crumb-current">{title}</span>
        </div>

        {/* Step panel + content */}
        <div className="workflow-inner">
          {/* Vertical stepper sidebar */}
          <div className="workflow-stepper-col">
            <div className="ws-title">Progress</div>
            {STEPS.map((step, idx) => {
              const done   = step.id < currentStep;
              const active = step.id === currentStep;
              const isLast = idx === STEPS.length - 1;
              return (
                <div key={step.id} className="ws-step">
                  <div className="ws-step-track">
                    <div className={`ws-step-dot ${done ? 'ws-step-dot-done' : active ? 'ws-step-dot-active' : ''}`}>
                      {done ? '✓' : step.id}
                    </div>
                    {!isLast && (
                      <div className={`ws-step-line ${done ? 'ws-step-line-done' : ''}`} />
                    )}
                  </div>
                  <div className="ws-step-info">
                    <div className={`ws-step-label ${done ? 'ws-step-label-done' : active ? 'ws-step-label-active' : 'ws-step-label-inactive'}`}>
                      {step.label}
                    </div>
                    <div className="ws-step-sublabel">{step.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scrollable page content */}
          <div className="workflow-main-col">
            {children}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
