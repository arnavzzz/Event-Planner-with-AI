import styles from "../../../../../../styles/event-organizer/overview.module.css"
import WalletIcon from "../../../../../../assets/event organizer/wallet.svg"

interface Card1Props {
    isDark: boolean;
}

export default function  Card1({isDark}:Card1Props) {
    let budget = 18000
    let budget_spend = 95312

    return (
        <div className={isDark?styles.card1Container:styles.card1ContainerDark}>
            <div>
                <img src={WalletIcon} alt="Wallet Icon"/>
            </div>
            <div>
                <p>Total Budget</p>
                <h1>{budget}</h1>
                <p>{budget_spend} spend</p>
            </div>
        </div>
    )
}