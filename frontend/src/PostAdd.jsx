import './styles/PostAdd.css'
import { useState, useEffect } from "react"
import configData from './config.json'
import { useNavigate } from "react-router-dom";


export default function PostAdd({token}) {
    const [title, setTitle] = useState('')
    const [modelList, setModelList] = useState([{_id: '', name: null, input_types: null, output_type: null}])
    const [modelListError, setModelListError] = useState(null)
    const [submitError, setSubmitError] = useState(null)
    const [currentModel, setCurrentModel] = useState('')
    const [currentModelObject, setCurrentModelObject] = useState(null)
    const [paragraphList, setParagraphList] = useState([''])

    const navigate = useNavigate()

    useEffect(() => {
        (async function() {
            const endpointURL = configData.API_URL + ':' + configData.API_PORT + configData.GET_MONGO_COLLECTION_ENDPOINT + '/' + configData.COLLECTION_WITH_MODELS_NAME
            const res = await fetch(endpointURL,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
            const resJSON = await res.json()
            if (res.status == 200) {
                const newModelList = [...modelList, ...resJSON.documents]
                setModelList(newModelList)
            } else {
                setModelListError(resJSON["detail"])
            }

        })();
    }, [])

    const handleAddParagraphBtnClick = (e) => setParagraphList([...paragraphList, ''])

    const handleModelSelectChange = (e) => {
        const newCurrentModel = e.currentTarget.value
        setCurrentModel(newCurrentModel)
        if (e.currentTarget.value == '') {
            setCurrentModelObject(null)
            return
        }
        setCurrentModelObject(modelList.filter(modelObj => modelObj._id == newCurrentModel)[0])
    }

    const submitBtnClickHandling = (e) => {
        (async function() {
            const endpointURL = configData.API_URL + ':' + configData.API_PORT + configData.POST_CREATE_ENDPOINT
            const res = await fetch(endpointURL,
                {   
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(
                        {
                            "title": title,
                            "model_interface_id": currentModel ? currentModel : null,
                            "paragraphs": paragraphList
                        }
                    )
                }
            )
            if (res.status == 200) {
                if (submitError) setSubmitError(null)
                navigate("/")
            } else {
                setSubmitError("There was an error, try again later")
            }
        })()
        

    }
    
    return <div className="post-add">
        {submitError ? <div className='post-add-error'>
            {submitError}
        </div> : <></>}
        <div className="post-add-title">
            <div className="post-add-title-label post-add-field-label">
                Title
            </div>
            <div className="post-add-title-input">
                <input value={title} onChange={(e) => {setTitle(e.target.value)}}  type="text" className="post-add-title-input"/>
            </div>
        </div>
        <div className="post-add-text">
            <div className="post-add-text-label post-add-field-label">
                Text
            </div>
            <div className="post-add-text-paragraphs">
                {paragraphList.map((paragraph, ind) => <textarea value={paragraph} onChange={e => {
                    const index = e.currentTarget.id.split('-').at(-1)
                    const newParagraphList = [...paragraphList]
                    newParagraphList[index] = e.currentTarget.value
                    setParagraphList(newParagraphList)
                }} key={`paragraph-${ind}`} id={`paragraph-${ind}`}></textarea>)}
            </div>
            <div className="post-add-text-add_paragraph">
                <div className="post-add-text-add_paragraph-btn" onClick={handleAddParagraphBtnClick}>
                    Add paragraph
                </div>
            </div>
        </div>
        <div className="post-add-model">
            <div className="post-add-model-label post-add-field-label">
                Model
            </div>
            <div className="post-add-model-select">
                <select className="post-add-model-select" value={currentModel} onChange={handleModelSelectChange}>
                    {modelList.map((modelObject, ind) => <option key={`model-${ind}`} value={modelObject._id}>{modelObject.name}</option>)}
                </select>
            </div>
            {currentModelObject ? <div className="post-add-model-desc">
                <div className="post-add-model-desc-inputs">
                    <div className="post-add-model-desc-inputs-name post-add-model-desc-field-name">
                        Inputs:
                    </div>
                    <div className="post-add-model-desc-inputs-value post-add-model-desc-field-value">
                        <ul>
                            {currentModelObject.args.map((arg, ind) => <li key={`post-add-model-desc-inputs-value-input-${ind}`} >{arg.param_name}:{arg.type}</li>)}
                        </ul>
                    </div>
                </div>
                <div className="post-add-model-desc-output post-add-model-desc-field">
                    <div className="post-add-model-desc-output-name post-add-model-desc-field-name">
                        Output type:
                    </div>
                    <div className="post-add-model-desc-output-value post-add-model-desc-field-value">
                        <ul>
                            {currentModelObject.output_types.map((output_type, ind) => <li key={`post-add-model-desc-output-value-output-${ind}`} >{output_type}</li>)}
                        </ul>
                    </div>
                </div>
            </div> : <></>}
        </div>
        <div className="post-add-submit">
            <div className="post-add-submit-btn" onClick={submitBtnClickHandling}>
                Submit
            </div>
        </div>
    </div>
}