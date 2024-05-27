import './styles/Feed.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import configData from './config.json'
import Weather from './Weather'

export default function Feed() {
    const [postsList, setPostsList] = useState(null)
    const [postsListError, setPostsListError] = useState(null)
    
    useEffect(() => {
        (async function() {
            const endpointUrl = 'http://' + process.env.REACT_APP_BACKEND_HOST + ':' + configData.API_PORT + configData.LIST_ALL_POSTS_ENDPOINT
            const res = await fetch(endpointUrl)
            if (res.status == 200) {
                const resJSON = await res.json()
                setPostsList(resJSON)
                if (postsListError) setPostsListError(null)
            } else {
                setPostsListError("There was an error when trying to fetch Posts.")
            }
        })()
    }, [])

    return <div className="feed">
        <div className='feed-posts'>
            {postsList ? postsList.map(
                (post, ind) => <div className='feed-posts-post' key={`feed-posts-post-${ind}`}>
                    <div className='feed-posts-post-top'>
                        <div className='feed-posts-post-author'>
                            {post.author.username}
                        </div>
                        <div className='feed-posts-post-date'>
                            {post.create_date}
                        </div>
                    </div>
                    <div className='feed-posts-post-bottom'>
                        <Link to={`/post/${post.id}`}>{post.title}</Link>
                    </div>
                </div>
            ) : <div className='feed-posts-error'>
                    {postsListError ? postsListError : ''}
                </div>}
        </div>
        <div className='feed-side'>
            <Weather/>
        </div>
    </div>
}