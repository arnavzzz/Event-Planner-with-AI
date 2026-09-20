import styles from "../../../../../styles/EventOrganizer.module.css"

interface MiddleSideHeaderProps{
    isDark: boolean;
}

function MiddleSideHeader ({isDark}:MiddleSideHeaderProps) {
    return(
        <div className={isDark? styles.middleHeader : styles.middleHeaderDark}>
            <div>
                <input type="search"/>
            </div>
        </div>
    )
}

export default MiddleSideHeader