import { Alert, Form } from 'react-bootstrap';
import indexStyles from './Index.module.scss';
import { getAddressesByIds } from '../../lib/addressService';

import Link from 'next/link';
import React, { useState } from 'react';
import { getContactsByIds } from '../../lib/contactService';
import { listUnscheduledVisits } from '../../lib/visitService';
import VisitsToolbar from '../../components/VisitsToolbar/VisitsToolbar';
import VisitsTable from '../../components/VisitsTable/VisitsTable';

export default function UnscheduledVisitsPage({ visits = [], error = null }) {
  if (error) return <Alert variant="danger">{error}</Alert>;

  const [showFuture, setShowFuture] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const displayed = visits.filter(v => {
    if (!v.earliestDate || v.earliestDate <= today) return true;
    return showFuture;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Unscheduled Visits</h1>
        <div className="d-flex align-items-center">
          <Form.Check
            type="switch"
            id="show-future-earliest"
            label="Show future earliest dates"
            checked={showFuture}
            onChange={e => setShowFuture(e.target.checked)}
            className="me-3"
          />
          <VisitsToolbar />
        </div>
      </div>

      {!displayed.length ? (
        <Alert variant="info">No unscheduled visits</Alert>
      ) : (
        <VisitsTable visits={displayed} dateField="earliestDate" dateLabel="Earliest" />
      )}
    </>
  );
}

export async function getServerSideProps() {
  try {
    const allVisits = await listUnscheduledVisits();

    const addressIds = [...new Set(allVisits.map(v => v.addressId))];
    const addresses = addressIds.length ? await getAddressesByIds(addressIds) : [];
    const contactIds = [...new Set(addresses.map(a => a.contactId))];
    const contacts = contactIds.length ? await getContactsByIds(contactIds) : [];

    const addressMap = Object.fromEntries((addresses || []).map(a => [a.id, a]));
    const contactMap = Object.fromEntries((contacts || []).map(c => [c.id, c]));

    const visits = allVisits.map(v => {
      const address = addressMap[v.addressId] || {};
      const contact = contactMap[address.contactId] || {};

      return {
        id: v.id,
        contactId: contact.id,
        contactName: contact.name,
        addressId: address.id,
        address: address.address,
        visitNote: v.notes,
        visitDate: v.visitDate,
        earliestDate: v.earliestDate,
        isInside: v.isInside,
      };
    });

    return { props: { visits, error: null } };
  } catch (err) {
    return { props: { visits: [], error: err && err.message ? err.message : 'Server error' } };
  }
}
