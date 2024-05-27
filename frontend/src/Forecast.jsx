import { condition_icon_map } from "./condition_icon_map"
import { getShortDay } from "./utils"
import "./styles/Forecast.css"

export default function Forecast({forecast}) {
    return <div className="forecast">
        <div className="forecast-day">
            {getShortDay(forecast.date)}
        </div>
        <div className="forecast-condition">
            {forecast.day.condition.text}
        </div>
        <div className="forecast-temp">
            {Math.round(forecast.day.mintemp_c)}° - {Math.round(forecast.day.maxtemp_c)}°
        </div>
    </div>
}