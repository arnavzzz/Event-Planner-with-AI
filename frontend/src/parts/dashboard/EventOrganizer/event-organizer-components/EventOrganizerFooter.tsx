import {useEffect, useState} from "react";
import {AI_METADATA_URL, API_DOCS_URL, checkAiHealth} from "../../../../api/aiService.ts";
import styles from "../../../../styles/EventOrganizer.module.css";

interface EventOrganizerFooterProps {
    isDark: boolean;
    activeLabel: string;
}

function EventOrganizerFooter({isDark, activeLabel}:EventOrganizerFooterProps) {
    const currentYear = new Date().getFullYear();
    const [connection, setConnection] = useState({
        backend: "checking" as "checking" | "connected" | "offline",
        aiml: "checking" as "checking" | "ready" | "unavailable" | "offline",
    });

    useEffect(() => {
        let isMounted = true;

        const refreshConnection = async () => {
            try {
                const health = await checkAiHealth();
                if (isMounted) {
                    setConnection({
                        backend: "connected",
                        aiml: health.ai_engine_ready ? "ready" : "unavailable",
                    });
                }
            } catch {
                if (isMounted) {
                    setConnection({backend: "offline", aiml: "offline"});
                }
            }
        };

        void refreshConnection();
        const intervalId = window.setInterval(refreshConnection, 30_000);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
        };
    }, []);

    const backendLabel = {
        checking: "Checking…",
        connected: "Connected",
        offline: "Offline",
    }[connection.backend];
    const aimlLabel = {
        checking: "Checking…",
        ready: "Connected",
        unavailable: "Model unavailable",
        offline: "Backend offline",
    }[connection.aiml];

    return(
        <footer className={isDark?styles.eventFooter:styles.eventFooterDark}>
            <div className={styles.footerContent}>
                <div className={styles.footerMeta}>
                    <p>Event Organizer &gt; {activeLabel}</p>
                    <p>&copy; {currentYear} EventMindAI. All rights reserved</p>
                </div>
                <div className={styles.footerConnections} aria-label="Service connections" aria-live="polite">
                    <div className={styles.footerConnection}>
                        <span className={`${styles.connectionIndicator} ${styles[`connection_${connection.backend}`]}`} aria-hidden="true" />
                        <span>Backend: {backendLabel}</span>
                        <a href={API_DOCS_URL} target="_blank" rel="noreferrer">API</a>
                    </div>
                    <div className={styles.footerConnection}>
                        <span className={`${styles.connectionIndicator} ${styles[`connection_${connection.aiml}`]}`} aria-hidden="true" />
                        <span>AIML: {aimlLabel}</span>
                        <a href={AI_METADATA_URL} target="_blank" rel="noreferrer">Integration</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default EventOrganizerFooter
