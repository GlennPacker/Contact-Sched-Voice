import { Alert } from 'react-bootstrap';
import React from 'react';
import VisitsTable from '../../components/VisitsTable/VisitsTable';
import VisitsToolbar from '../../components/VisitsToolbar/VisitsToolbar';
import { getAddressesByIds } from '../../lib/addressService';
import { getContactsByIds } from '../../lib/contactService';
import { listVisits } from '../../lib/visitService';

export default function VisitsPage({ visits = [], error = null }) {
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Upcoming Visits</h1>
        <div>
          <VisitsToolbar />
        </div>
      </div>

      {!visits.length ? (
        <Alert variant="info">No upcoming visits</Alert>
      ) : (
        <VisitsTable visits={visits} dateField="visitDate" dateLabel="Date" />
      )}
    </>
  );
}

export async function getServerSideProps() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allVisits = await listVisits({ fromDate: today, order: 'asc', limit: 25 });

    const addressIds = [...new Set((allVisits || []).map(v => v.addressId))];
    const addresses = addressIds.length ? await getAddressesByIds(addressIds) : [];
    const contactIds = [...new Set((addresses || []).map(a => a.contactId))];
    const contacts = contactIds.length ? await getContactsByIds(contactIds) : [];

    const addressMap = Object.fromEntries((addresses || []).map(a => [a.id, a]));
    const contactMap = Object.fromEntries((contacts || []).map(c => [c.id, c]));

    const visits = (allVisits || []).map(v => {
      const addr = addressMap[v.addressId] || {};
      const contact = addr ? contactMap[addr.contactId] : null;

      return {
        id: v.id,
        contactId: contact?.id,
        contactName: contact?.name,
        addressId: addr?.id,
        address: addr?.address,
        visitNote: v.notes,
        visitDate: v.visitDate,
        isInside: v.isInside,
      };
    });

    return { props: { visits, error: null } };
  } catch (err) {
    return { props: { visits: [], error: err && err.message ? err.message : 'Server error' } };
  }
}
