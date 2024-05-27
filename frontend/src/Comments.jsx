import CommentAdd from "./CommentAdd";
import CommentsList from "./CommentsList";
import './styles/Comments.css'
import { Link } from "react-router-dom"
import { useState, useEffect } from 'react'
import configData from './config.json'

export default function Comments({token, postData}) {
    const [commentsArray, setCommentsArray] = useState(null)
    const [commentsError, setCommentsError] = useState(null)

    useEffect(() => {
        (async function() {
            const endpointURL = configData.API_URL + ':' + configData.API_PORT + configData.GET_COMMENTS_ENDPOINT.replace('{post_id}', postData.id)
            const res = await fetch(endpointURL)
            const resJSON = await res.json()
            if (res.status == 200) {
                if (commentsError) setCommentsError(null)
                setCommentsArray(resJSON)
            } else {
                setCommentsError("There was an error when trying to fetch the comments.")
            }
        })()
    }, [])

    return <div className="comments">
        <div className="comments-header">
            Comments
        </div>
        {token ? <CommentAdd token={token} commentsArray={commentsArray} setCommentsArray={setCommentsArray} postData={postData}/> : <div className="comments-log_in">
                If you'd like to be able to post a comment, please <Link to="/login">log in</Link>
            </div>}
        <CommentsList commentsArray={commentsArray} commentsError={commentsError}/>
    </div>
}