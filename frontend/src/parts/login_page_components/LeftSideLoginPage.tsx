import FaviconImage from "../../assets/favicon/favicon-64.svg";
import styles from "../../styles/Login.module.css"
import AnimationLeftRight from "./AnimationLeftRight.tsx";
import React from "react";

interface LeftSideLoginPageProps {
    isDark: boolean;
}

function LeftSideLoginPage({isDark}: LeftSideLoginPageProps) {
    const events = ["Kumbh Mela", "Birthday", "BRICS Summit",
        "Diwali Utsav", "Anime Event", "Holi Utsav",
        "AI Fest", "Dauji ka Handa", "Rann Utsav",
        "Hackathons", "Product Launch", "Wedding",
        "Concert", "Ganesh Chaturthi", "Rath Yatra",
        "Tourism Festivals", "Kua Pujan", "Ghira Pravesh"
    ]

    const [index, setIndex] = React.useState(0)
    const [visible, setVisible] = React.useState(true)

    React.useEffect(() => {
        let timeout:number
        const interval = setInterval(() => {
            setVisible(false)

            timeout = window.setTimeout(() => {
                setIndex((prev) => (prev + 1) % events.length)
                setVisible(true)
            }, 500)
        }, 2500)

        return () => {clearInterval(interval); clearInterval(timeout)}
    }, [])

    return (
        <div className={isDark
            ? styles.leftSideLoginPage
            : `${styles.leftSideLoginPage} ${styles.leftSideLoginPageLight}`
        }>
            <div className={styles.leftSideContent}>
                <div className={styles.logoTop}>
                    <img src={FaviconImage} className={styles.logoImage} alt="" />
                    <h1 className={styles.logoTitle}>EventMind AI</h1>
                </div>
                <div className={styles.heroCopy}>
                    <p className={styles.heroEyebrow}>The event planning workspace</p>
                    <h2 className={styles.heroHeading}>
                        Make room for{" "}
                        <span
                            key={events[index]}
                            className={`${styles.eventName} ${visible ? "" : styles.eventNameHidden}`}
                        >
                            {events[index]}
                        </span>
                        {" "}and everything around it.
                    </h2>
                    <p className={styles.heroDescription}>
                        From a birthday party to a national summit, bring people, places and plans together in one place.
                    </p>
                </div>
                <div className={styles.heroBottom}>
                    <h3 className={styles.heroBottomTitle}>
                        One login. Every event running at once, none of them colliding.
                    </h3>
                    <p className={styles.heroBottomDescription}>
                        Venues, vendors, budgets and schedules, coordinated across every category from a birthday to a
                        Kumbh Mela.
                    </p>
                    <AnimationLeftRight events={events}/>
                </div>

            </div>
        </div>
    );
}

export default LeftSideLoginPage;
