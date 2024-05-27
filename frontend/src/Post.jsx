import {useParams} from "react-router-dom"
import configData from './config.json'
import { useState, useEffect } from 'react'
import './styles/Post.css'
import ModelInterface from "./ModelInterface"
import Comments from "./Comments"

async function getPostData(post_id, postDataError, postDataSetter, postDataErrorSetter) {
    const endpointURL = configData.API_URL + ':' + configData.API_PORT + configData.GET_POST_ENDPOINT + "/" + post_id 
    const res = await fetch(endpointURL)
    const resJSON = await res.json()
    if (res.status == 200) {
        if (postDataError) {
            postDataErrorSetter(null)
        }
        postDataSetter(resJSON)
    } else {
        try {
            postDataErrorSetter(resJSON.detail)
        } catch {
            postDataErrorSetter("There was an error, please try again later.")
        }
        return null
    }
    return resJSON
}



export default function Post({token, userID}) {
    const [postData, setPostData] = useState(null)
    const [postDataError, setPostDataError] = useState(null)
    
    const { post_id } = useParams();

    useEffect(() => {
        (async function() {
            const fetchedPostData = await getPostData(post_id, postDataError, setPostData, setPostDataError)
        })()
    }, [])

    return <div className="post">
        {postDataError ? <div className='post-error'>
            {postDataError}
        </div> : <></>}
        {postData ? <>
            <div className="post-title">
                <div className="post-title-label post-field-label">
                    {postData.title}
                </div>
            </div>
            <div className="post-text">
                {postData.paragraphs.map((paragraph, ind) => <div key={`post-text-paragraph-${ind}`} className="post-text-paragraph">
                        {paragraph.text}
                    </div>)}
            </div>
            {postData.model_interface_id ? <ModelInterface model_id={postData.model_interface_id} token={token} userID={userID}/> : <></>}
        </> : <></>}
        {postData ? <Comments token={token} postData={postData}/> : <></>}
    </div>

}