import { useState, useEffect } from "react";
import configData from './config.json'
import { Link } from "react-router-dom"
import './styles/ModelInterface.css'

async function getModelData(model_id, token, modelDataError, modelDataSetter, modelDataErrorSetter) {
    const endpointURL = configData.API_URL + ':' + configData.API_PORT + configData.GET_MODEL_ENDPOINT + "/" + model_id 
    const res = await fetch(endpointURL, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    const resJSON = await res.json()
    if (res.status == 200) {
        if (modelDataError) {
            modelDataErrorSetter(null)
        }
        modelDataSetter(resJSON)
    } else {
        try {
            modelDataErrorSetter(resJSON.detail)
        } catch {
            modelDataErrorSetter("There was an error, please try again later.")
        }
        return null
    }
    return resJSON
}

export default function ModelInterface({model_id, token,userID}) {
    const [modelData, setModelData] = useState(null)
    const [modelDataError, setModelDataError] = useState(null)
    const [modelInputs, setModelInputs] = useState([])
    const [prediction, setPrediction] = useState(null)
    const [predictionError, setPredictionError] = useState(null)

    useEffect(() => {
        (async function() {
            if (token) {
                const fetchedModelData = await getModelData(model_id, token, modelDataError, setModelData, setModelDataError)
                if (fetchedModelData) {
                    const newModelInputs = []
                    fetchedModelData.args.forEach(argObj => {
                        switch (argObj.type) {
                            case 'number':
                                newModelInputs.push(0)
                                break;
                            case "text":
                                newModelInputs.push('')
                                break;
                        }
                    })
                    setModelInputs(newModelInputs)
                }
            }
        })()
    }, [])

    function handleParameterInputChange(e) {
        const inputId = e.currentTarget.id.split('-').at(-1)
        const newModelInputs = [...modelInputs]
        newModelInputs[inputId] = e.currentTarget.value
        setModelInputs(newModelInputs)
    }

    async function savePrediction(model_name, input_params, output) {
        (async function() {
            const endpointURL = configData.API_URL + ':' + configData.API_PORT + configData.SAVE_PREDICTION_ENDPOINT 
            const reqBody = {
                model_name: model_name,
                user_id: userID,
                input_params: input_params,
                output: output,
            }
            await fetch(endpointURL,
                {
                    body: JSON.stringify(reqBody),
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    method: "POST"
                }
            )
        })()
    }

    function handlePredictBtnClick(e) {
        (async function() {
            if (!modelData) return
            const reqBody = {}
            modelData.args.forEach((argObj, ind) => reqBody[argObj.param_name] = modelInputs[ind])
            const res = await fetch(modelData.url,
                {
                    body: JSON.stringify(reqBody),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "POST"
                })
            const resJSON = await res.json()
            if (res.status == 200) {
                if (predictionError) setPredictionError(null)
                setPrediction(resJSON)
                await savePrediction(modelData.name, reqBody, resJSON)
            }  else {
                setPredictionError("There was an error when trying to fetch the prediction.")
            }
        })()
    }

    const modelInterfaceHTML = (modelData) => {
        return <>
        <div className="post-model-info">
            <div className="post-model-info-name">
                {modelData.name}
            </div>
            <div className="post-model-info-description">
                {modelData.description}
            </div>
            <div className="post-model-info-args">
                {modelData.args.map((argObj, ind) => <div className="post-model-info-args-arg" key={`post-model-info-args-arg-${ind}`}>
                    <div className="post-model-info-args-arg-parameter">
                        {argObj.param_name}
                    </div>
                    <div className="post-model-info-args-arg-input">
                        <input type={argObj.type} id={`post-model-info-args-arg-input-${ind}`}  key={`post-model-info-args-arg-input-${ind}`} value={modelInputs[ind]} onChange={handleParameterInputChange}/>
                    </div>
                </div>)}
            </div>
            <div className="post-model-info-predict">
                <button className="post-model-info-predict-btn" onClick={handlePredictBtnClick}>
                    Predict
                </button>
            </div>
            
        </div>
    </>
    }

    return <div className="post-model">
        <div className="post-model-label post-field-label">
            Model
        </div>
        {token ? <>
            {modelDataError || !modelData ? <div className="post-model-error">
                {modelDataError}
            </div> : <></>}
            {!modelDataError && modelData ? <div className="post-model-info">
                {modelInterfaceHTML(modelData)}
            </div>  : <></>}
        </> : <div className="post-model-not_logged_in">
                Please {<Link to="/login">log in</Link>} to use the model.
            </div>}
        {prediction ? <>
            <div className="post-model-prediction post-field-label">
                Prediction
            </div>
            <div className="post-model-prediction-value">
                {prediction}
            </div>

        </> 
         : <></>}
        
        

    </div>
}