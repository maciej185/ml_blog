import './styles/ProfilePage.css'
import { Link } from "react-router-dom"
import { useState, useEffect } from 'react'
import configData from './config.json'

export default function ProfilePage({username, profileInfo, isAdmin, token}) {
    const [postList, setPostList] = useState([])
    const [postListError, setPostListError] = useState(null)

    useEffect(() => {
        (async function() {
            const endpointURL = configData.API_URL + ':' + configData.API_PORT + configData.LIST_POSTS_ENDPOINT
            const res = await fetch(endpointURL,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
            const resJSON = await res.json()
            if (res.status == 200) {
                if (postListError) {
                    setPostListError(null)
                }
                setPostList(resJSON)
            } else {
                try {
                    setPostListError(resJSON.detail)
                } catch {
                    setPostListError("There was an error when trying to fetch the posts.")
                }
            }
        })()
    }, [])

    return <div className="profile-page">
        <div className="profile-page-top">
            <div className="profile-page-top-right">
                <div className="profile-page-top-right-entry">
                    <div className="profile-page-top-right-entry-label">
                        Username
                    </div>
                    <div className="profile-page-top-right-entry-value">
                        {username}
                    </div>
                </div>

                <div className="profile-page-top-right-entry">
                    <div className="profile-page-top-right-entry-label">
                        First name
                    </div>
                    <div className="profile-page-top-right-entry-value">
                        {profileInfo["first_name"]}
                    </div>
                </div>
                
                <div className="profile-page-top-right-entry">
                    <div className="profile-page-top-right-entry-label">
                        Last name
                    </div>
                    <div className="profile-page-top-right-entry-value">
                        {profileInfo["last_name"]}
                    </div>
                </div>

                <div className="profile-page-top-right-entry">
                    <div className="profile-page-top-right-entry-label">
                        Date of birth
                    </div>
                    <div className="profile-page-top-right-entry-value">
                        {profileInfo["date_of_birth"]}
                    </div>
                </div>

                <div className="profile-page-top-right-entry">
                    <div className="profile-page-top-right-entry-label">
                        Country
                    </div>
                    <div className="profile-page-top-right-entry-value">
                        {profileInfo["country"]}
                    </div>
                </div>

                <div className="profile-page-top-right-entry">
                    <div className="profile-page-top-right-entry-label">
                        Is admin
                    </div>
                    <div className="profile-page-top-right-entry-value">
                        {isAdmin ? "Yes" : "No"}
                    </div>
                </div>

            </div>
        </div>
        <div className="profile-page-middle">
            <div className="profile-page-middle-header">
                Predictions
            </div>
            <div className="profile-page-middle-link">
                <Link to="/predictions">See your predictions</Link>
            </div>
        </div>
        <div className="profile-page-bottom">
            <div className="profile-page-bottom-desc">
                <div className="profile-page-bottom-desc-header">
                    Description
                </div>
                <div className="profile-page-bottom-desc-main">
                    {profileInfo["description"]}
                </div>
            </div>
        </div>
        <div className="profile-page-posts">
            <div className="profile-page-posts-header">
                Posts
            </div>
            <div className='profile-page-posts-add'>
                <div className='profile-page-posts-add-btn'>
                    <Link to="/post/create">Add post</Link>
                </div>
            </div>
            <div className="profile-page-posts-list">
                {(!postList && postListError) ? <div className="profile-page-posts-list">{postListError}</div> : <></>}
                {postList.map((post, ind) => <div className="profile-page-posts-list-post" key={`profile-page-posts-list-post-${ind}`}>
                        <div className="profile-page-posts-list-post-title">
                            <Link to={`/post/${post.id}`}>{post.title}</Link>
                        </div>
                    </div>)}
            </div>
        </div>
    </div>
}