import React, { useState, useEffect } from "react";
import { hasFutureDatesApi } from "../../lib/calendarService";

function MoveVisit({ visit, loading }) {
  const [show, setShow] = useState(false);
  const [hasFutureDates, setHasFutureDates] = useState(false);
  const [moveFuture, setMoveFuture] = useState(false);
  const [moveDate, setMoveDate] = useState(visit.visitDate || "");

  useEffect(() => {
    if (!show) return;

    async function checkFuture() {
      const payload = await hasFutureDatesApi(visit.id, visit.visitDate);
      const exists = !!payload?.exists;
      setHasFutureDates(exists);
      setMoveFuture(exists);
      setMoveDate(visit.visitDate);
    }

    checkFuture();
  }, [show, visit.id, visit.visitDate]);

  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary me-2"
        aria-label="move dates"
        onClick={() => setShow(true)}
        disabled={loading}
      >
        ↔️ move
      </button>
      {show && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Move Visit</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShow(false)}
                />
              </div>
              <div className="modal-body">
                {hasFutureDates && (
                  <div className="alert alert-warning mb-2">This contact has future visits scheduled.</div>
                )}
                <label htmlFor="move-date">New Date</label>
                <input
                  id="move-date"
                  type="date"
                  className="form-control mb-2"
                  value={moveDate}
                  onChange={e => setMoveDate(e.target.value)}
                  disabled={loading}
                />
                {hasFutureDates && (
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="move-future"
                      checked={moveFuture}
                      onChange={e => setMoveFuture(e.target.checked)}
                      disabled={loading}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="move-future"
                    >
                      Move all future visits
                    </label>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShow(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Move
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MoveVisit;
