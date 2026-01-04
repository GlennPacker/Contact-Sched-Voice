import { Button, Form } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';

import Visit from './Visit';
import styles from './Visits.module.scss';

export default function Visits({ nestIndex, control, register, errors, createCalendarInvite }) {
	let fields = [];
	let add = () => {};
	let remove = () => {};
	const [localFields, setLocalFields] = useState([{ visitDate: null, notes: '' }]);
	const addLocal = React.useCallback((item) => setLocalFields(prev => (Array.isArray(prev) ? [item, ...prev] : [item])), [setLocalFields]);
	const removeLocal = React.useCallback((idx) => setLocalFields(prev => prev.filter((_, i) => i !== idx)), [setLocalFields]);
	if (control && typeof control._getFieldArray === 'function') {
		const res = useFieldArray({ control, name: `addresses.${nestIndex}.visits` });
		fields = res.fields;
		add = res.append;
		remove = res.remove;
	} else {
		fields = localFields;
		add = addLocal;
		remove = removeLocal;
	}
	const [calendarError, setCalendarError] = useState({});
	const watchedVisits = (control && typeof control._getFieldArray === 'function') ? useWatch({ control, name: `addresses.${nestIndex}.visits` }) : fields;
	const [collapsed, setCollapsed] = useState(fields.map(() => true));

	useEffect(() => {
		if (!fields.length) {
			add({ visitDate: null, notes: '' });
			return;
		}
		setCollapsed(prev => {
			if (fields.length === 1) return [false];

			if (prev && prev.length < fields.length) {
				return [false, ...Array.from({ length: fields.length - 1 }, () => true)];
			}

			if (prev && prev.length === fields.length) return prev;

			return fields.map(() => true);
		});
	}, [fields, add]);

	const toggleCollapse = (idx) => {
		setCollapsed(prev => prev.map((_, i) => i === idx ? false : true));
	};

	const collapseAll = () => {
		setCollapsed(prev => prev.map(() => true));
	};

	const addVisit = () => {
		let newVisit = { visitDate: null };
		if (fields.length) {
			const sorted = [...fields].sort((a, b) => {
				if (!a.visitDate && !b.visitDate) return 0;
				if (!a.visitDate) return 1;
				if (!b.visitDate) return -1;
				return b.visitDate.localeCompare(a.visitDate);
			});
			const mostRecent = sorted[0] || {};
			newVisit = {
				visitDate: null,
				notes: mostRecent.notes || '',
				recurrence: mostRecent.recurrence || 'does not reoccur',
				time: mostRecent.time || '',
				days: mostRecent.days || '',
				isInside: mostRecent.isInside || false,
				isFlexilbe: mostRecent.isFlexilbe || false
			};
		}
		add(newVisit, { at: 0 });
		setCollapsed(prev => [false, ...(Array.isArray(prev) ? prev.map(() => true) : [])]);
	};

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const minDateStr = tomorrow.toISOString().split('T')[0];

	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - 14);
	const cutoffStr = cutoff.toISOString().split('T')[0];

	const displayIndices = fields
		.map((f, i) => i)
		.filter(i => {
			const watched = watchedVisits?.[i] || {};
			const dateStr = watched.visitDate ?? fields[i]?.visitDate;
			if (!dateStr) return true;
			return dateStr >= cutoffStr;
		})
		.sort((ai, bi) => {
			const a = watchedVisits?.[ai] || fields[ai] || {};
			const b = watchedVisits?.[bi] || fields[bi] || {};
			const aDate = a.visitDate;
			const bDate = b.visitDate;
			if (!aDate && !bDate) return 0;
			if (!aDate) return -1;
			if (!bDate) return 1;
			return aDate.localeCompare(bDate);
		});

	return (
		<div className={styles['visits-root']}>
			<div className={styles['visits-caption-row']}>
				<span className={styles['visits-caption']}>Visits</span>
				<Button variant="secondary" size="sm" type="button" onClick={addVisit}>
					Add Visit
				</Button>
			</div>
			<div className={styles['visits-list-scroll']}>
				{displayIndices.map(idx => {
					const field = fields[idx];
					const watched = watchedVisits?.[idx] || {};
					return (
						<Visit
							key={field.id}
							field={field}
							idx={idx}
							nestIndex={nestIndex}
							watched={watched}
							collapsed={collapsed[idx]}
							toggleCollapse={toggleCollapse}
							remove={remove}
							register={register}
							createCalendarInvite={createCalendarInvite}
							calendarError={calendarError}
							setCalendarError={setCalendarError}
							collapseAll={collapseAll}
							minDateStr={minDateStr}
							styles={styles}
						/>
					);
				})}
			</div>
			{errors?.addresses?.[nestIndex]?.visits && typeof errors.addresses[nestIndex].visits.message === 'string' && (
				<Form.Text className="text-danger">{errors.addresses[nestIndex].visits.message}</Form.Text>
			)}
		</div>
	);
}
