import { Button, Form } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import {
	defaultCollapsedFor,
	getTomorrowMinDate,
	makeNewVisitFromMostRecent,
	orderVisits,
} from '../../lib/visitFormService';
import { useFieldArray, useWatch } from 'react-hook-form';

import Visit from './Visit';
import styles from './Visits.module.scss';

export default function Visits({ nestIndex, control, register, errors, createCalendarInvite }) {
	let fields = [];
	let add = () => { };
	let remove = () => { };
	let insert = null;
	const [localFields, setLocalFields] = useState([{ visitDate: null, notes: '' }]);
	const addLocal = React.useCallback(item => setLocalFields(prev => (Array.isArray(prev) ? [item, ...prev] : [item])), [setLocalFields]);
	const removeLocal = React.useCallback(idx => setLocalFields(prev => prev.filter((_, i) => i !== idx)), [setLocalFields]);
	if (control && typeof control._getFieldArray === 'function') {
		const res = useFieldArray({ control, name: `addresses.${nestIndex}.visits` });
		fields = res.fields;
		add = res.append;
		remove = res.remove;
		insert = res.insert;
	} else {
		fields = localFields;
		add = addLocal;
		remove = removeLocal;
		insert = item => setLocalFields(prev => {
			const arr = [...prev];
			arr.push(item);
			return arr;
		});
	}
	const [calendarError, setCalendarError] = useState({});
	const watchedVisits = (control && typeof control._getFieldArray === 'function') ? useWatch({ control, name: `addresses.${nestIndex}.visits` }) : fields;
	const [collapsed, setCollapsed] = useState(defaultCollapsedFor(fields.length));
	const didOrder = useRef(false);

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

	let orderedVisits = fields.map((_, i) => i);
	if (!didOrder.current) {
		orderedVisits = orderVisits({ fields, watchedVisits, cutoffDays: 14 });
		didOrder.current = true;
	}

	const toggleCollapse = idx => {
		setCollapsed(prev => prev.map((_, i) => i === idx ? false : true));
	};

	const collapseAll = () => {
		setCollapsed(prev => prev.map(() => true));
	};

	const lastVisitRef = useRef(null);
	const addVisit = () => {
		const newVisit = makeNewVisitFromMostRecent(fields);
		add(newVisit); 
		setCollapsed(prev => {
			const arr = prev || [];
			return arr.map(() => true).concat(false);
		});
		setTimeout(() => {
			if (lastVisitRef.current) {
				lastVisitRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 200);
	};

	const minDateStr = getTomorrowMinDate();

	return (
		<div className={styles['visits-root']}>
			<div className={styles['visits-caption-row']}>
				<span className={styles['visits-caption']}>Visits</span>
				<Button
					variant="secondary"
					size="sm"
					type="button"
					onClick={addVisit}>
					Add Visit
				</Button>
			</div>
			<div className={styles['visits-list-scroll']}>
				{orderedVisits.map((idx, i) => {
					const field = fields[idx];
					const isLast = i === orderedVisits.length - 1;
					return (
						<Visit
							key={field.id || idx}
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
							ref={isLast ? lastVisitRef : undefined}
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
