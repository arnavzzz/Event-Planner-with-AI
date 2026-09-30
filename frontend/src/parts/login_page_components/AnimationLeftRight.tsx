import {Fragment} from "react"

interface AnimationLeftRightProps {
    events: string[]
}

function AnimationLeftRight({events}: AnimationLeftRightProps) {
    const middle = Math.ceil(events.length / 2)

    const firstPart = events.slice(0, middle)
    const secondPart = events.slice(middle)
    return (
        <Fragment>
            <div>
                <ul>
                    {firstPart.map((event, index) => (
                        <li key={index}>
                            {event}
                        </li>
                    ))}
                </ul>
                <ul>
                    {secondPart.map((event, index) => (
                        <li key={index}>
                            {event}
                        </li>
                    ))}
                </ul>
            </div>
        </Fragment>
    )
}

export default AnimationLeftRight