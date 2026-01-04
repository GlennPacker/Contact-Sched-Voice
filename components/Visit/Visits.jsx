import { Button, Form } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';

import Visit from './Visit';
import styles from './Visits.module.scss';
import {
	getTomorrowMinDate,
	makeNewVisitFromMostRecent,
	orderVisits,
	defaultCollapsedFor,
} from '../../lib/visitFormService';

export default function Visits({ nestIndex, control, register, errors, createCalendarInvite }) {
	let fields = [];
	let add = () => { };
	let remove = () => { };
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
	const [collapsed, setCollapsed] = useState(defaultCollapsedFor(fields.length));

	useEffect(() => {
		if (!fields.length) {
			add({ visitDate: null, notes: '' });
			return;
		}
		setCollapsed(prev => {
			if (prev && prev.length === fields.length) return prev;
			return defaultCollapsedFor(fields.length);
		});
	}, [fields, add]);

	const toggleCollapse = (idx) => {
		setCollapsed(prev => prev.map((_, i) => i === idx ? false : true));
	};

	const collapseAll = () => {
		setCollapsed(prev => prev.map(() => true));
	};

	const addVisit = () => {
		const newVisit = makeNewVisitFromMostRecent(fields);
		add(newVisit, { at: 0 });
		setCollapsed(prev => [false, ...(Array.isArray(prev) ? prev.map(() => true) : [])]);
	};

	const minDateStr = getTomorrowMinDate();

	const orderedVisits = orderVisits({ fields, watchedVisits, cutoffDays: 14 });

	return (
		<div className={styles['visits-root']}>
			<div className={styles['visits-caption-row']}>
				<span className={styles['visits-caption']}>Visits</span>
				<Button variant="secondary" size="sm" type="button" onClick={addVisit}>
					Add Visit
				</Button>
			</div>
			<div className={styles['visits-list-scroll']}>
				{orderedVisits.map(idx => {
					const field = fields[idx];
					return (
						<Visit
							key={field.id ?? idx}
							field={field}
							idx={idx}
							nestIndex={nestIndex}
							watched={watchedVisits?.[idx] || {}}
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
