import styles from "../../../../../styles/EventOrganizer.module.css"
import FaviconImage from "../../../../../assets/favicon/favicon-16.svg"

interface LeftSideHeaderProps {
    isDark: boolean;
}

function LeftSideHeader ({isDark}:LeftSideHeaderProps) {
    return(
        <div className={isDark?styles.leftHeader:styles.leftHeaderDark}>
            <div>
                <div className={isDark?styles.leftHeaderImage:styles.leftHeaderImageDark}>
                    <img
                        src={FaviconImage}
                        alt="Favicon Image"
                    />
                </div>
                <div>
                    <p>EventMind AI</p>
                </div>
            </div>
        </div>
    )
}

export default LeftSideHeader