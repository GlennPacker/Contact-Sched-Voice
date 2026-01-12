import React from 'react';

const cycleDir = current => (current === 'none' ? 'asc' : current === 'asc' ? 'desc' : 'none');

export default function SortIcon({ field, activeField, activeDir, onChange }) {
  const isActive = activeField === field && activeDir !== 'none';

  const handleClick = () => {
    const next = activeField !== field ? 'asc' : cycleDir(activeDir);
    if (onChange) onChange(field, next);
  };

  if (!isActive) {
    return (
      <button
        type="button"
        className="btn btn-link p-0 ms-2"
        onClick={handleClick}
        aria-label={`sort ${field}`}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden>
          <path
            d="M2 8h12"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round" />
        </svg>
      </button>
    );
  }

  if (activeDir === 'asc') {
    return (
      <button
        type="button"
        className="btn btn-link p-0 ms-2"
        onClick={handleClick}
        aria-label={`sort ${field} asc`}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden>
          <path
            d="M8 4l4 6H4l4-6z"
            fill="currentColor" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-link p-0 ms-2"
      onClick={handleClick}
      aria-label={`sort ${field} desc`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden>
        <path
          d="M8 12l-4-6h8l-4 6z"
          fill="currentColor" />
      </svg>
    </button>
  );
}
