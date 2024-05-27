import './styles/CommentList.css'

export default function CommentsList({commentsArray, commentsError}) {
 
    return commentsArray ? <div className="comment-list">
        {commentsArray.map((comment, ind) => <div className="comment-list-comment" key={`comment-list-comment-${ind}`}>
            <div className="comment-list-comment-top">
                <div className="comment-list-comment-top-user">
                    {comment.author.username}
                </div>
                <div className="comment-list-comment-top-date">
                    {comment.create_date}
                </div>
            </div>
            <div className="comment-list-comment-bottom">
                {comment.text}
            </div>
        </div>)}
    </div> : <div className="comment-list_error">
        {commentsError}
    </div>
}