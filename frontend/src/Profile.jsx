import Login from "./Login"
import ProfileInfo from "./ProfileInfo"

export default function Profile({username, token, setUsername, setToken, isAdmin, setIsAdmin, setUserID}) {
    return username ? <ProfileInfo username={username} token={token} isAdmin={isAdmin} /> : <Login setUsername={setUsername} setToken={setToken} setIsAdmin={setIsAdmin} setUserID={setUserID}/>
}