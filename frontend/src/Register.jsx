import './styles/Register.css'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import configData from './config.json'
import { login } from './Login'

export default function Register({username, setUsername, setToken, setIsAdmin, setUserID}) {
    const [inputEmail, setInputEmail] = useState("")
    const [inputUsername, setInputUsername] = useState("")
    const [inputPassword, setInputPassword] = useState("")
    const [error, setError] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {if (username) navigate("/")}, [])

    function buttonHandleClick(e) {
        (async function() {
            const endpointUrl = configData.API_URL + ":" + configData.API_PORT + configData.REGISTER_ENDPOINT
            const res = await fetch(endpointUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                  },
                body: JSON.stringify(
                    {
                        email: inputEmail,
                        username: inputUsername,
                        password: inputPassword
                    }
                )
            })
            if (res.status == 200) {
                setUsername(inputUsername)
                if (error) setError(null)
                await login(inputUsername, inputPassword, error, setUsername, setToken, setError, setIsAdmin, setUserID)
                navigate("/")
            } else {
                const resJSON = await res.json()
                setError(resJSON["detail"])
            }
        })()
    }

    return <div className="register">
        <div className="register-top">
            {error ? <div className="register-top-error">
                {error}
            </div> : <></>}
            <div className="register-top-form">
                <div className="register-top-form-email">
                    <div className="register-top-form-email-label register-top-form-input-label">E-mail</div>
                    <input type="email" value={inputEmail} onChange={(e) => {setInputEmail(e.target.value)}} name="email" id="email"/>
                </div>
                <div className="register-top-form-username">
                    <div className="register-top-form-username-label register-top-form-input-label">Username</div>
                    <input type="text" value={inputUsername} onChange={(e) => {setInputUsername(e.target.value)}} name="username" id="username"/>
                </div>
                <div className="register-top-form-password">
                    <div className="register-top-form-password-label register-top-form-input-label">Password</div>
                    <input type="password" value={inputPassword} onChange={(e) => {setInputPassword(e.target.value)}} name="password" id="password"/>    
                </div>
                <div className="register-top-form-button">
                    <button onClick={buttonHandleClick}>Register</button>
                </div>
            </div>
        </div>
        <div className="register-bottom">
            If you already have an account, you can login <Link to="/">here</Link>.
        </div>
    </div>
}