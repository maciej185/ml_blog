import { useState } from 'react'
import './styles/CommentAdd.css'
import configData from './config.json'

export default function CommentAdd({token, commentsArray, setCommentsArray, postData}) {
    const [commentInput, setCommentInput] = useState('')
    const [postCommentError, setPostCommentError] = useState(null)

    function handleSubmitBtnClick(e) {
        (async function() {
            const endpointURL = configData.API_URL + ':' + configData.API_PORT + configData.POST_COMMENT_ENDPOINT
            const res = await fetch(endpointURL,
                {   
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(
                        {
                            text: commentInput,
                            post_id: postData.id
                        }
                    )
                }
            )
            
            if (res.status == 200) {
                const resJSON = await res.json()
                if (postCommentError) setPostCommentError(null)
                const newCommentsArray = [...commentsArray, resJSON]
                setCommentsArray(newCommentsArray)
                setCommentInput('')
            } else {
                setPostCommentError("There was an error, try again later.")
            }
        })()
    }

    return <div className="comments-add">
        {postCommentError ? <div className="comments-error">
            {postCommentError}
        </div> : <></>} 
        <div className="comments-add-input">
            <textarea className="comments-add-input-textarea" value={commentInput} onChange={e => setCommentInput(e.currentTarget.value)}>

            </textarea>
        </div>  
        <div className="comments-add-submit">
            <div className="comments-add-submit-btn" onClick={handleSubmitBtnClick}>
                Comment
            </div>  
        </div>  
    </div>  
}