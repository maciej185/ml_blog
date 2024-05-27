import { useState, useEffect } from "react"
import configData from './config.json'
import './styles/PredictionInfo.css'

export default function PredictionInfo({token}) {
    const [predictionData, setPredictionData] = useState(null)
    const [predictionDataError, setPredictionDataError] = useState(null)

    useEffect(() => {
        (async function() {
            const endpointURL = configData.API_URL + ':' + configData.API_PORT + configData.GET_PREDICTIONS_ENDPOINT
            const res = await fetch(endpointURL, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const resJSON = await res.json()
            if (res.status == 200) {
                if (predictionDataError) {
                    setPredictionDataError(null)
                }
                setPredictionData(resJSON)
                console.log(resJSON)
            } else {
                try {
                    setPredictionDataError(resJSON.detail)
                } catch {
                    setPredictionDataError("There was an error when trying to fetch the predictions.")
                }
            }
        })()
    }, [])

    return <div className="predictions">
        <div className="predictions-header">
            PREDICTIONS
        </div>
        <div className="predictions-values">
            <table className="predictions-values-table">
                <tbody>
                <tr className="predictions-values-table-header">
                    <th>Model</th>
                    <th>Input</th>
                    <th>Output</th>
                    <th>Date</th>
                </tr>
                {
                    predictionData ? predictionData.map((predictionDataObj, ind) => {
                        return <tr className="predictions-values-table-row" key={`predictions-values-table-row-${ind}`}>
                            <td>
                                {predictionDataObj.model_name}
                            </td>
                            <td>
                                <div className="predictions-values-table-row-inputs">
                                    {Object.entries(predictionDataObj.input_params).map(([param_name, param_value], ind) => {
                                        return <div className="predictions-values-table-row-inputs-input" key={`predictions-values-table-row-inputs-input-${ind}`}>
                                            {param_name} : {param_value}
                                        </div>
                                    })}
                                </div>
                                
                            </td>
                            <td>
                                {predictionDataObj.output}
                            </td>
                            <td>
                                    {new Date(predictionDataObj.prediction_time).toLocaleDateString()}
                            </td>
                        </tr>
                    }) : <></>
                }
                </tbody>
                
            </table>
        </div>
    </div>
}