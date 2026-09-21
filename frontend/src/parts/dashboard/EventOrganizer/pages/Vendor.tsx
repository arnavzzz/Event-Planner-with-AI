import styles from "../../../../styles/event-organizer/overview.module.css"

interface VendorProps {
    isDark: boolean;
}

export default function Vendor ({isDark}:VendorProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Vendor Tab</h1>
        </div>
    )
}