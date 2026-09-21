import styles from "../../../../styles/event-organizer/overview.module.css"

interface DocumentsProps {
    isDark: boolean;
}

export default function Documents({isDark}:DocumentsProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Document Tab</h1>
        </div>
    )
}