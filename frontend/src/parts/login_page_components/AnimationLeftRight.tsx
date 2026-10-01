import styles from "../../styles/Login.module.css"

interface AnimationLeftRightProps {
    events: string[]
}

function AnimationLeftRight({events}: AnimationLeftRightProps) {
    const middle = Math.ceil(events.length / 2)

    const firstPart = events.slice(0, middle)
    const secondPart = events.slice(middle)
    return (

        <div>
            <div className={styles.eventTickerLeft}>
                <div className={styles.eventTrackLeft}>
                    {[...firstPart, ...firstPart].map((name, index) => (
                        <div key={index} className={styles.eventCard}>
                            {name}
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.eventTickerRight}>
                <div className={styles.eventTrackRight}>
                    {[...secondPart, ...secondPart].map((name, index) => (
                        <div key={index} className={styles.eventCard}>
                            {name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AnimationLeftRight