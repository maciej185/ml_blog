import { useState, useEffect } from 'react'
import './styles/App.css'
import Nav from './Nav'
import Main from './Main'
import { getCookie } from './utils'

export default function App() {
  const [username, setUsername] = useState(null)
  const [userID, setUserID] = useState(null)
  const [token, setToken] = useState(null)
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    
    const usernameFromCookie = getCookie("username")
    const tokenFromCookie = getCookie("token")
    const isAdminFromCookie = getCookie("isAdmin")
    const userIDFromCookie = getCookie("userID")

    if (usernameFromCookie && tokenFromCookie && isAdminFromCookie && userIDFromCookie) {
      setUsername(usernameFromCookie)
      setToken(tokenFromCookie)
      setIsAdmin(isAdminFromCookie)
      setUserID(userIDFromCookie)
    }
  }, [])

  

  return <>
    <Nav username={username} setUsername={setUsername} setToken={setToken} setIsAdmin={setIsAdmin} setUserID={setUserID}/>
    <Main username={username} setUsername={setUsername} token={token} setToken={setToken} isAdmin={isAdmin} setIsAdmin={setIsAdmin} userID={userID} setUserID={setUserID}/>
  </>
}
