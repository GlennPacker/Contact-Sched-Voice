import React from 'react';

export default function CancelMultipleVisits({ onCancelFuture, loading }) {
  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-danger me-2"
      onClick={onCancelFuture}
      disabled={loading}
      aria-label="Delete all future visits"
    >
      🗑 Delete future
    </button>
  );
}
