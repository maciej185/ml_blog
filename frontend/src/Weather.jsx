import { useState, useEffect } from 'react'
import configData from './config.json'
import './styles/Weather.css'
import Forecast from './Forecast'
import Current from './Current'

function getUserLocation() {
    return new Promise(function(resolve, reject)  {
        const success = (position) => {
            resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            })
        }
    
        const fail = (err) => reject(null)
    
        navigator.geolocation.getCurrentPosition(success, fail)
    })
}

async function getUserPlace(location) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&accept-language=en-US`)
    const data = await res.json()
    return {
        city_village: data.address.city ? data.address.city : data.address.village,
        country: data.address.country
    }
} 

async function fetchWeatherData(location) {
    const res = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${configData.WEATHER_API_KEY}&q=${location.lat},${location.lng}&days=${configData.FORECAST_DAYS}`)
    const data = await res.json()
    return {
        current: data.current,
        forecast: data.forecast.forecastday
    }

}

export default function Weather() {
    const [location, setLocation] = useState(null)
    const [place, setPlace] = useState(null)
    const [weatherInfo, setWeatherInfo] = useState(null)

    useEffect(() => {
        (async function() {
            const userLocation = await getUserLocation()
            setLocation(userLocation)

            const userPlace = await getUserPlace(userLocation)
            setPlace(userPlace)

            const weatherData = await fetchWeatherData(userLocation)
            setWeatherInfo(weatherData)

        })()
    }, [])

    return weatherInfo ? <div className="weather">
        {place ? <div className='place'>
            {place.city_village}, {place.country}
        </div> : <></>}
        {weatherInfo ? <Current current={weatherInfo.current} /> : <></>}
        <div className="forecasts">
            {weatherInfo ? weatherInfo.forecast.map((forecast, ind) => <Forecast key={`forecast-${ind}`} forecast={forecast}/>) : <></>}
        </div>
    </div> : <></>
}