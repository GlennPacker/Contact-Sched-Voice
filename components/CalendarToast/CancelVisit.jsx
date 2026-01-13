import React from 'react';

export default function CancelVisit({ onCancel }) {
  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-danger me-2"
      onClick={onCancel}
      aria-label="Cancel visit"
    >
      🗑 Cancel
    </button>
  );
}
