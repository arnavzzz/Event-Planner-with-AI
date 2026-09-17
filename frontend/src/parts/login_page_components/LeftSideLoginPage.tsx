import FaviconImage from "../../assets/favicon/favicon-128.svg";
import styles from "../../styles/Login.module.css"

function LeftSideLoginPage() {
    return(
        <div className={styles.leftSideLoginPage}>
            <div className="header-left-side">
                <img src={FaviconImage} className="favicon-image" alt="Favicon Image"/>
                <h1 className="heading-title">EventMind AI</h1>

                `<div className="app-info-top">
                <h2>
                    Plan any event, anywhere in India
                </h2>
                <p>
                    From a Birthday Part to National Summit, One Platform runs its end to end
                </p>
            </div>
                <div className="app-info-bottom">
                    <h2>
                        One login. Every event running at once, none of them colliding.
                    </h2>
                    <p>
                        Venues, vendors, budgets and schedules, coordinated across every category from a birthday to a Kumbh Mela.
                    </p>
                    `</div>
            </div>
        </div>
    );
}

export default LeftSideLoginPage;