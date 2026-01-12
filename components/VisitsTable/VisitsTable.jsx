import React, { useMemo, useState } from 'react';

import Link from 'next/link';
import SortIcon from './SortIcon';
import { Table } from 'react-bootstrap';
import indexStyles from '../../pages/visits/Index.module.scss';

export default function VisitsTable({ visits = [], dateField = 'visitDate', dateLabel = 'Date', onSortChange }) {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('none');
  const [filters, setFilters] = useState({ name: '', address: '', notes: '', date: '', inside: '' });
  const handleSortChange = (field, dir) => {
    if (dir === 'none') {
      setSortField(null);
      setSortDir('none');
    } else {
      setSortField(field);
      setSortDir(dir);
    }
    if (onSortChange) onSortChange(field, dir);
  };

  const formatAddressForSelect = addr => {
    if (!addr) return '';
    const m = addr.match(/(\d+)(?!.*\d)/);
    if (m && m[1]) {
      const last = m[1];
      const idx = addr.lastIndexOf(last);

      return addr.slice(idx).trim();
    }

    return addr.trim();
  };

  const uniqueNames = useMemo(() => {
    return [...new Set((visits || []).map(v => v.contactName).filter(Boolean))].sort();
  }, [visits]);

  const uniqueAddressOptions = useMemo(() => {
    const set = new Map();
    (visits || []).forEach(v => {
      const label = formatAddressForSelect(v.address);
      if (label) set.set(label, label);
    });

    return [...set.values()].sort();
  }, [visits]);

  const filtered = useMemo(() => {
    return (visits || []).filter(v => {
      if (filters.name && !(v.contactName || '').toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.address) {
        const label = formatAddressForSelect(v.address);
        if (label !== filters.address) return false;
      }
      if (filters.notes && !(v.visitNote || '').toLowerCase().includes(filters.notes.toLowerCase())) return false;
      if (filters.date && (v[dateField] || '') !== filters.date) return false;
      if (filters.inside) {
        if (filters.inside === 'yes' && !v.isInside) return false;
        if (filters.inside === 'no' && v.isInside) return false;
      }

      return true;
    });
  }, [visits, filters, dateField]);

  const sorted = useMemo(() => {
    if (!sortField || sortDir === 'none') return filtered;
    const mapper = v => {
      switch (sortField) {
        case 'name':
          return (v.contactName || '').toLowerCase();
        case 'date':
          return v[dateField] || '';
        default:
          return '';
      }
    };

    return [...filtered].sort((a, b) => {
      const A = mapper(a);
      const B = mapper(b);
      if (A === B) return 0;

      return sortDir === 'asc' ? (A < B ? -1 : 1) : (A > B ? -1 : 1);
    });
  }, [filtered, sortField, sortDir, dateField]);

  return (
    <Table
      striped
      bordered
      hover
      responsive
      className={indexStyles.visitsTable}>
      <thead>
        <tr>
          <th className={indexStyles.colName}>
            <div className="d-flex align-items-center">
              <span className="me-2">Name</span>
              <SortIcon
                field="name"
                activeField={sortField}
                activeDir={sortDir}
                onChange={handleSortChange} />
            </div>
          </th>
          <th className={indexStyles.colAddress}>Address</th>
          <th>Notes</th>
          <th className={indexStyles.colDate}>
            <div className="d-flex align-items-center">
              <span className="me-2">{dateLabel}</span>
              <SortIcon
                field="date"
                activeField={sortField}
                activeDir={sortDir}
                onChange={handleSortChange} />
            </div>
          </th>
          <th className={indexStyles.colInside}>Inside</th>
        </tr>
        <tr>
          <th>
            <select
              className="form-select form-select-sm"
              value={filters.name}
              onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}>
              <option value="">All</option>
              {uniqueNames.map(n => <option
                key={n}
                value={n}>{n}</option>)}
            </select>
          </th>
          <th>
            <select
              className="form-select form-select-sm"
              value={filters.address}
              onChange={e => setFilters(f => ({ ...f, address: e.target.value }))}>
              <option value="">All</option>
              {uniqueAddressOptions.map(opt => <option
                key={opt}
                value={opt}>{opt}</option>)}
            </select>
          </th>
          <th>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Filter notes"
              value={filters.notes}
              onChange={e => setFilters(f => ({ ...f, notes: e.target.value }))} />
          </th>
          <th>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filters.date}
              onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} />
          </th>
          <th>
            <select
              className="form-select form-select-sm"
              value={filters.inside}
              onChange={e => setFilters(f => ({ ...f, inside: e.target.value }))}>
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((v, idx) => (
          <tr key={`${v.contactId || v.id}-${v.addressId}-${v[dateField]}-${idx}`}>
            <td>
              {v.contactId ? (
                <Link
                  href={`/contacts/${v.contactId}/edit`}
                  passHref>{v.contactName || '—'}</Link>
              ) : (v.contactName || '—')}
            </td>
            <td>{v.address || '—'}</td>
            <td>{v.visitNote || '—'}</td>
            <td>{v[dateField] || '—'}</td>
            <td>{v.isInside ? 'Yes' : 'No'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
