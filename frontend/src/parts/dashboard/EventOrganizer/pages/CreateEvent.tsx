import {useState, type FormEvent} from "react";
import type {EventRecord} from "../EventData.ts";
import styles from "../../../../styles/event-organizer/create-event.module.css";

interface CreateEventProps {
    isDark: boolean;
    onCreate: (event: EventRecord) => void;
}

interface EventFormValues {
    eventType: string;
    eventName: string;
    clientBudget: string;
    guestCount: string;
    startDate: string;
    endDate: string;
}

const initialValues: EventFormValues = {
    eventType: "",
    eventName: "",
    clientBudget: "",
    guestCount: "",
    startDate: "",
    endDate: "",
};

export default function CreateEvent({isDark, onCreate}: CreateEventProps) {
    const [values, setValues] = useState(initialValues);

    const updateField = (field: keyof EventFormValues, value: string) => {
        setValues((current) => ({...current, [field]: value}));
    };

    const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
        submitEvent.preventDefault();
        onCreate({
            id: `${Date.now()}`,
            eventType: values.eventType,
            eventName: values.eventName.trim(),
            clientBudget: Number(values.clientBudget),
            guestCount: Number(values.guestCount),
            startDate: values.startDate,
            endDate: values.endDate,
        });
        setValues(initialValues);
    };

    return (
        <div className={isDark ? styles.container : styles.containerLight}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Create Event</h1>
                    <p className={styles.description}>Add the essential details for your event.</p>
                </header>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fields}>
                        <label className={styles.field}>
                            <span>Event Type</span>
                            <select
                                required
                                value={values.eventType}
                                onChange={(event) => updateField("eventType", event.target.value)}
                            >
                                <option value="" disabled>Select an event type</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Corporate">Corporate</option>
                                <option value="Conference">Conference</option>
                                <option value="Festival">Festival</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>

                        <label className={styles.field}>
                            <span>Event Name</span>
                            <input
                                type="text"
                                required
                                maxLength={120}
                                placeholder="e.g. Annual Company Gala"
                                value={values.eventName}
                                onChange={(event) => updateField("eventName", event.target.value)}
                            />
                        </label>

                        <label className={styles.field}>
                            <span>Client Budget</span>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="Enter budget"
                                value={values.clientBudget}
                                onChange={(event) => updateField("clientBudget", event.target.value)}
                            />
                        </label>

                        <label className={styles.field}>
                            <span>Guest Count</span>
                            <input
                                type="number"
                                required
                                min="1"
                                step="1"
                                placeholder="Enter number of guests"
                                value={values.guestCount}
                                onChange={(event) => updateField("guestCount", event.target.value)}
                            />
                        </label>

                        <label className={styles.field}>
                            <span>Start Date</span>
                            <input
                                type="date"
                                required
                                value={values.startDate}
                                onChange={(event) => {
                                    updateField("startDate", event.target.value);
                                    if (values.endDate && event.target.value > values.endDate) {
                                        updateField("endDate", "");
                                    }
                                }}
                            />
                        </label>

                        <label className={styles.field}>
                            <span>End Date</span>
                            <input
                                type="date"
                                required
                                min={values.startDate || undefined}
                                value={values.endDate}
                                onChange={(event) => updateField("endDate", event.target.value)}
                            />
                        </label>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.submitButton}>Create Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
