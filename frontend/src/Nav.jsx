import './styles/Nav.css'
import { deleteCookie } from './utils'
import { Link } from "react-router-dom"

export default function Nav({username, setUsername, setToken, setIsAdmin, setUserID}) {

    function logoutHandleClick(e) {
        setUsername(null)
        setToken(null)
        setIsAdmin(null)
        setUserID(null)

        deleteCookie("username")
        deleteCookie("token")
        deleteCookie("isAdmin")
        deleteCookie("userID")
    }

    return <div className='nav'>
        <div className='nav-logo'>
            <Link to="/">ML Blog</Link>
        </div>
        {username ? <div className='nav-user'>
            <div className='nav-user-username'><Link to="/profile">{username}</Link></div>
            <div className='nav-user-logout' onClick={logoutHandleClick}>Logout</div>
        </div> : <div>
                <Link to="/login">Login</Link>
            </div>}
    </div>
}