import { useEffect, useState } from "react"
import configData from './config.json'
import ProfilePage from "./ProfilePage"
import ProfileEdit from "./ProfileEdit"
import "./styles/ProfileInfo.css"

export default function ProfileInfo({username, token, isAdmin}) {
    const [profileInfo, setProfileInfo] = useState(null)
    const [error, setError] = useState(null)
    const [editing, setEditing] = useState(false)

    useEffect(() => {
        if (!token) return
        
        (async function() {
            for (let i = 0 ; i < 3; i++) {
                const endpointUrl = configData.API_URL + ':' + configData.API_PORT + configData.DISPLAY_PROFILE_ENDPOINT
                const res = await fetch(
                    endpointUrl,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                )
                const res_data = await res.json()
                if (res.status == 200) {
                    setProfileInfo(res_data)
                    break
                } else if (res.status == 401) {
                    setError(res_data["error"])
                }
            }
        })()
    }, [])

    useEffect(() => {if (!username) setProfileInfo(null)}, [username])

    if (profileInfo) {
        return <div className="profile">
                <div className="profile-editing">
                    <div className="profile-editing-btn" onClick={(e) => setEditing(!editing)}>{editing ? "Cancel" : "Edit"}</div>
                </div>
                {editing ? <ProfileEdit username={username} token={token} profileInfo={profileInfo} setEditing={setEditing} setProfileInfo={setProfileInfo} /> : <ProfilePage username={username} profileInfo={profileInfo} isAdmin={isAdmin} token={token}/>}
            </div>   
    } else if (!profileInfo && error) {
        return <></>
    } else {
        return <></>
    }
}