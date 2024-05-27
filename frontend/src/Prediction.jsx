import Login from "./Login"
import PredictionInfo from "./PredictionInfo"

export default function Prediction({token, setUsername, setToken, setIsAdmin, setUserID}) {
    return token ? <PredictionInfo token={token}/> : <Login setUsername={setUsername} setToken={setToken} setIsAdmin={setIsAdmin} setUserID={setUserID}/>
}