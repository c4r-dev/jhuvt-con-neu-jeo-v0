/**
 * ConcernTable Component
 * 
 * Features:
 * - Display concerns in a table format
 * - Highlight flow steps on hover
 * - Support for concern deletion
 */

import React from 'react';
import { deleteComment } from '../../flow-viewer/utils/commentUtils';

const ConcernTable = ({ concerns, isLoading, onConcernHover, onConcernLeave, onConcernUpdate }) => {
  
  // Format date for display
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  
  // Handle concern hover
  const handleConcernHover = (nodeIds) => {
    if (onConcernHover && Array.isArray(nodeIds) && nodeIds.length > 0) {
      onConcernHover(nodeIds);
    }
  };
  
  // Handle concern mouse leave
  const handleConcernLeave = () => {
    if (onConcernLeave) {
      onConcernLeave();
    }
  };
  
  // Handle concern deletion
  const handleDelete = async (concernId) => {
    if (window.confirm("Are you sure you want to delete this concern?")) {
      try {
        const result = await deleteComment(concernId);
        if (result.success && onConcernUpdate) {
          onConcernUpdate();
        }
      } catch (error) {
        console.error("Error deleting concern:", error);
      }
    }
  };
  
  // Get affected steps text
  const getAffectedStepsText = (nodeLabels) => {
    if (!nodeLabels || nodeLabels.length === 0) return '';
    
    if (nodeLabels.length <= 3) {
      return nodeLabels.join(', ');
    } else {
      return `${nodeLabels.slice(0, 3).join(', ')} and ${nodeLabels.length - 3} more`;
    }
  };
  
  return (
    <div className="concern-table-wrapper">
      <h2>Concerns</h2>
      
      {isLoading ? (
        <div className="loading-indicator">Loading concerns...</div>
      ) : concerns.length === 0 ? (
        <div className="no-concerns">No concerns added yet.</div>
      ) : (
        <table className="concern-table">
          <thead>
            <tr>
              <th className="concern-col">CONCERN</th>
              <th className="processes-col">STEPS AFFECTED</th>
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {concerns.map(concern => (
              <tr 
                key={concern._id}
                onMouseEnter={() => handleConcernHover(concern.nodeIds)}
                onMouseLeave={handleConcernLeave}
                className="concern-row"
              >
                <td className="concern-col">{concern.text}</td>
                <td className="processes-col">{getAffectedStepsText(concern.nodeLabels)}</td>
                <td className="actions-col">
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(concern._id)}
                    title="Delete concern"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ConcernTable; 