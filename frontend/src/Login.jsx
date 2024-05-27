import { useState } from "react"
import './styles/Login.css'
import { Link, useNavigate } from "react-router-dom"
import configData from './config.json'
import { setCookie } from "./utils"

export async function login(username, password, error, usernameSetter, tokenSetter, errorSetter, isAdminSetter, UserIDSetter) {
        const endpointUrl = configData.API_URL + ':' + configData.API_PORT + configData.LOGIN_ENDPOINT
        const data = new URLSearchParams()
        data.append("username", username)
        data.append("password", password)
        const res = await fetch(endpointUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
                },
            body: data
        })
        const resJSON = await res.json()
        if (res.status == 200) {
            usernameSetter(username)
            tokenSetter(resJSON.access_token)
            isAdminSetter(resJSON.is_admin)
            UserIDSetter(resJSON.user_id)
            
            setCookie("username", username)
            setCookie("token", resJSON.access_token)
            setCookie("isAdmin", resJSON.is_admin)
            setCookie("userID", resJSON.user_id)

            if (error) setError(null)

            return true
        } else if (res.status == 401) {
            errorSetter(resJSON["detail"])
            return false
        } else {
            errorSetter(resJSON["There was a network issue, please try again later."])
            return false
        }
}

export default function Login({setUsername, setToken, setIsAdmin, setUserID}) {
    const [inputUsername, setInputUsername] = useState("")
    const [inputPassword, setInputPassword] = useState("")
    const [error, setError] = useState(null)

    const navigate = useNavigate()


    function buttonHandleClick(e) {
        (async function() {
            const loginSuccessful = await login(inputUsername, inputPassword, error, setUsername, setToken, setError, setIsAdmin, setUserID)
            if (loginSuccessful) navigate("/")
        })()
    }

    return <div className="login">
        <div className="login-top">
            {error ? <div className="login-top-error">
                {error}
            </div> : <></>}
            <div className="login-top-form">
                <div className="login-top-form-username">
                    <div className="login-top-form-username-label login-top-form-input-label">Username</div>
                    <input type="text" value={inputUsername} onChange={(e) => {setInputUsername(e.target.value)}} name="username" id="username"/>
                </div>
                <div className="login-top-form-password">
                    <div className="login-top-form-password-label login-top-form-input-label">Password</div>
                    <input type="password" value={inputPassword} onChange={(e) => {setInputPassword(e.target.value)}} name="password" id="password"/>    
                </div>
                <div className="login-top-form-button">
                    <button onClick={buttonHandleClick}>Login</button>
                </div>
            </div>
        </div>
        <div className="login-bottom">
            If you don't already have an account, you can register <Link to="/register">here</Link>.
        </div>
    </div>
}