import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useFieldArray, useWatch } from 'react-hook-form';
import Visit from './Visit';
import styles from './Visits.module.scss';

export default function Visits({ nestIndex, control, register, errors, createCalendarInvite }) {
	const { fields, append: add, remove } = useFieldArray({
		control,
		name: `addresses.${nestIndex}.visits`
	});
	const [calendarError, setCalendarError] = useState({});
	const watchedVisits = useWatch({ control, name: `addresses.${nestIndex}.visits` });
	const [collapsed, setCollapsed] = useState(fields.map(() => true));

	useEffect(() => {
		if (!fields.length) {
			add({ date: '', note: '' });
		}
		if (fields.length === 1) {
			setCollapsed([false]);
		} else {
			setCollapsed(fields.map(() => true));
		}
	}, [fields, add]);

	const toggleCollapse = (idx) => {
		setCollapsed(prev => prev.map((_, i) => i === idx ? false : true));
	};

	const collapseAll = () => {
		setCollapsed(prev => prev.map(() => true));
	};

	const addVisit = () => {
		let newVisit = { date: '' };
		if (fields.length > 0) {
			const sorted = [...fields].sort((a, b) => {
				if (!a.date && !b.date) return 0;
				if (!a.date) return 1;
				if (!b.date) return -1;
				return b.date.localeCompare(a.date);
			});
			const mostRecent = sorted[0] || {};
			newVisit = {
				date: '',
				note: mostRecent.note || '',
				recurrence: mostRecent.recurrence || 'does not reoccur',
				time: mostRecent.time || '',
				days: mostRecent.days || '',
				isInside: mostRecent.isInside || false,
				isFlexilbe: mostRecent.isFlexilbe || false
			};
		}
		add(newVisit, { at: 0 });
		setTimeout(() => {
			const arrLen = fields.length + 1;
			setCollapsed(Array.from({ length: arrLen }, (_, i) => i !== 0));
		}, 0);
	};

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const minDateStr = tomorrow.toISOString().split('T')[0];

	return (
		<div className={styles['visits-root']}>
			<div className={styles['visits-caption-row']}>
				<span className={styles['visits-caption']}>Visits</span>
				<Button variant="secondary" size="sm" type="button" onClick={addVisit}>
					Add Visit
				</Button>
			</div>
			<div className={styles['visits-list-scroll']}>
				{fields.map((field, idx) => {
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
