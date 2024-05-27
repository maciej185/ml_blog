import "./styles/Current.css"
import { formatDate } from "./utils"
import { condition_icon_map } from "./condition_icon_map"

export default function Current({current}) {
    return <div className="current">
            <div className="current-left">
                <div className="current-left-top">
                    <div className="current-left-top-temp">
                        {Math.round(current.feelslike_c)}
                    </div>
                    <div className="current-left-top-temp-deg">
                        °C
                    </div>
                </div>
                <div className="current-left-bottom">
                    <div className="current-left-bottom-precipitation">
                        Precipitation: {current.precip_mm}mm
                    </div>
                    <div className="current-left-bottom-humidity">
                        Humidity: {current.humidity}%
                    </div>
                    <div className="current-left-bottom-wind">
                        Wind: {current.wind_kph} km/h
                    </div>                            
                </div>
            </div>
            <div className="current-right">
                <div className="current-right-time">
                    {formatDate(current.last_updated)}
                </div>
                <div className="current-right-condition">
                    {current.condition.text}
                </div>
            </div>
        </div>
}