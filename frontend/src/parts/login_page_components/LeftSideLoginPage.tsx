import FaviconImage from "../../assets/favicon/favicon-128.svg";
import styles from "../../styles/Login.module.css"
import AnimationLeftRight from "./AnimationLeftRight.tsx";

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

    return (
        <div className={isDark ? styles.leftSideLoginPage : styles.leftSideLoginPageDark}>
            <div className="header-left-side">
                <img src={FaviconImage} className="favicon-image" alt="Favicon Image"/>
                <h1 className="heading-title">EventMind AI</h1>
                <div className="app-info-top">
                    <h2>Plan you event</h2>
                    {events.map((event, index) => (
                        <h2 key={index}>{event}</h2>
                    ))}
                    <h2>anywhere in India</h2>
                    <p>
                        From a Birthday Part to National Summit, One Platform runs its end to end
                    </p>
                </div>
                <div className="app-info-bottom">
                    <h2>
                        One login. Every event running at once, none of them colliding.
                    </h2>
                    <p>
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