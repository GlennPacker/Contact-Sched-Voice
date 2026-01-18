import React, { useState, useEffect } from "react";
import { hasFutureDatesApi } from "../../lib/calendarService";
import { moveVisitApi } from "../../lib/calendarService";
import { updateVisitDate } from "../../lib/visitService";
import { updateFutureVisitTableDates } from "../../lib/visitService";
import { useRouter } from "next/router";

function MoveVisit({ visit, loading, onMoveComplete }) {
  const router = useRouter();
  const safeVisit = visit ?? {};
  const moveVisitDate = async () => {
    await moveVisitApi({
      calendarId: safeVisit.id,
      visitId: safeVisit.id,
      newDate: moveDate,
      moveFuture,
      originalDate: safeVisit.visitDate
    });
    const today = new Date();
    const newVisitDate = new Date(moveDate);
    let monthOffset = (newVisitDate.getFullYear() - today.getFullYear()) * 12 + (newVisitDate.getMonth() - today.getMonth());
    let urlPart = !monthOffset ? 'current' : monthOffset;
    setShow(false);
    onMoveComplete();
    router.push(`/visits/calendar/${urlPart}`);
  };

  const [show, setShow] = useState(false);
  const [hasFutureDates, setHasFutureDates] = useState(false);
  const [moveFuture, setMoveFuture] = useState(false);
  const [moveDate, setMoveDate] = useState(safeVisit.visitDate || "");

  useEffect(() => {
    if (!show) return;
    const checkFuture = async () => {
      const payload = await hasFutureDatesApi(safeVisit.visitId, safeVisit.visitDate);
      const exists = !!payload?.exists;
      setHasFutureDates(exists);
      setMoveFuture(exists);
      setMoveDate(safeVisit.visitDate);
    };
    checkFuture();
  }, [show, safeVisit.visitId, safeVisit.visitDate]);

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
                  min={(() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().split('T')[0];
                  })()}
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
                  disabled={!moveDate}
                  onClick={moveVisitDate}
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
