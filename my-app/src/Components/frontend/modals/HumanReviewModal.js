import React, { useState } from 'react';
import { CheckCircle, XCircle, Edit3, MessageSquare, Send, Loader2, X } from 'lucide-react';

const HumanReviewModal = ({ draft, onApprove, onReject, onClose, onRefine }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOutput, setEditedOutput] = useState(draft.draft_expected_output);
  const [feedback, setFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);

  const handleRefine = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for refinement');
      return;
    }

    setIsRefining(true);
    try {
      const response = await fetch('http://localhost:8001/refine-expected-output', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: draft.test_id,
          question: draft.user_input,
          current_draft: editedOutput,
          context: draft.retrieved_context,
          human_feedback: feedback
        })
      });

      const data = await response.json();
      setEditedOutput(data.refined_expected_output);
      setFeedback('');
      setShowFeedbackBox(false);
      alert('Expected output refined based on your feedback!');
    } catch (error) {
      console.error('Refinement error:', error);
      alert('Failed to refine output');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <MessageSquare className="modal-icon" />
            <div>
              <h2>Review AI-Generated Expected Output</h2>
              <p className="modal-subtitle">{draft.test_id}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body review-body">
          {/* Question */}
          <div className="review-section">
            <h3>Question</h3>
            <p className="review-text">{draft.user_input}</p>
          </div>

          {/* Agent Response */}
          <div className="review-section">
            <h3>Agent's Response</h3>
            <p className="review-text">{draft.agent_response}</p>
          </div>

          {/* Retrieved Context */}
          <div className="review-section">
            <h3>Retrieved Context ({draft.retrieved_context.length} chunks)</h3>
            <div className="context-list">
              {draft.retrieved_context.map((ctx, idx) => (
                <div key={idx} className="context-item">
                  <span className="context-number">Chunk {idx + 1}</span>
                  <p className="context-text">{ctx}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Draft Expected Output */}
          <div className="review-section highlight-section">
            <div className="section-header">
              <h3>AI-Generated Expected Output</h3>
              <button 
                className="btn-secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 size={16} />
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </button>
            </div>
            
            {isEditing ? (
              <textarea
                className="edit-textarea"
                value={editedOutput}
                onChange={(e) => setEditedOutput(e.target.value)}
                rows={6}
              />
            ) : (
              <p className="review-text">{editedOutput}</p>
            )}
          </div>

          {/* Feedback Section */}
          <div className="review-section">
            <button 
              className="btn-feedback"
              onClick={() => setShowFeedbackBox(!showFeedbackBox)}
            >
              <MessageSquare size={16} />
              Talk to AI Evaluator
            </button>

            {showFeedbackBox && (
              <div className="feedback-box">
                <label>Tell the AI what's wrong and what you expect:</label>
                <textarea
                  className="feedback-textarea"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="E.g., 'The output should mention the 24-hour support window and include the ticket number format'"
                  rows={4}
                />
                <button 
                  className="btn-refine"
                  onClick={handleRefine}
                  disabled={isRefining || !feedback.trim()}
                >
                  {isRefining ? (
                    <>
                      <Loader2 className="spinner" size={16} />
                      Refining...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Regenerate with Feedback
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="review-actions">
            <button 
              className="btn-approve"
              onClick={() => onApprove(draft.test_id, editedOutput)}
            >
              <CheckCircle size={20} />
              Approve
            </button>
            <button 
              className="btn-reject"
              onClick={() => onReject(draft.test_id)}
            >
              <XCircle size={20} />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanReviewModal;