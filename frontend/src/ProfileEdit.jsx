import './styles/ProfileEdit.css'
import { useState } from 'react'
import configData from './config.json'

export default function ProfileEdit({username, token, profileInfo, setEditing, setProfileInfo}) {
    const [inputFirstName, setInputFirstName] = useState(profileInfo['first_name'])
    const [inputLastName, setInputLastName] = useState(profileInfo['last_name'])
    const [inputCountry, setInputCountry] = useState(profileInfo['country'])
    const [inputDescription, setInputDescription] = useState(profileInfo['description'])
    const [inputDateOfBirth, setInputDateOfBirth] = useState(profileInfo['date_of_birth'])
    const [error, setError] = useState(null)

    function handleSubmitBtnClick(e) {
        (
            async function() {
                const endpointUrl = configData.API_URL + ':' + configData.API_PORT + configData.UPDATE_PROFILE_ENDPOINT
                const res = await fetch(endpointUrl, {
                    body: JSON.stringify(
                        {
                            "first_name": inputFirstName,
                            "last_name": inputLastName,
                            "country": inputCountry,
                            "description": inputDescription,
                            "date_of_birth": inputDateOfBirth
                        }
                    ),
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    method: "POST"
                })
                if (res.status == 200) {
                    setProfileInfo(
                        {
                            "first_name": inputFirstName,
                            "last_name": inputLastName,
                            "country": inputCountry,
                            "description": inputDescription,
                            "date_of_birth": inputDateOfBirth
                        }
                    )
                    setEditing(false)
                } else {
                    const resData = await res.json()
                    setError(resData["detail"])
                    console.log(resData["detail"])
                }
            }
        )()
    }

    return <div className="profile-edit">
    {error ? <div className='profile-edit-error'>
        There was an error.
    </div> : <></>}
    <div className="profile-edit-top">
        <div className="profile-edit-top-right">
            <div className="profile-edit-top-right-entry">
                <div className="profile-edit-top-right-entry-label">
                    Username
                </div>
                <div className="profile-edit-top-right-entry-value">
                    {username}
                </div>
            </div>

            <div className="profile-edit-top-right-entry">
                <div className="profile-edit-top-right-entry-label">
                    First name
                </div>
                <div className="profile-edit-top-right-entry-input">
                    <input type='text' className='profile-edit-top-right-entry-input' value={inputFirstName} onChange={(e) => setInputFirstName(e.currentTarget.value)} />
                </div>
            </div>
            
            <div className="profile-edit-top-right-entry">
                <div className="profile-edit-top-right-entry-label">
                    Last name
                </div>
                <div className="profile-edit-top-right-entry-input">
                    <input type='text' className='profile-edit-top-right-entry-input' value={inputLastName} onChange={(e) => setInputLastName(e.currentTarget.value)} />
                </div>
            </div>

            <div className="profile-edit-top-right-entry">
                <div className="profile-edit-top-right-entry-label">
                    Date of birth
                </div>
                <div className="profile-edit-top-right-entry-input">
                    <input type='date' className='profile-edit-top-right-entry-input' value={inputDateOfBirth} onChange={(e) => setInputDateOfBirth(e.currentTarget.value)} />
                </div>
            </div>

            <div className="profile-edit-top-right-entry">
                <div className="profile-edit-top-right-entry-label">
                    Country
                </div>
                <div className="profile-edit-top-right-entry-input">
                    <input type='text' className='profile-edit-top-right-entry-input' value={inputCountry} onChange={(e) => setInputCountry(e.currentTarget.value)} />
                </div>
            </div>

        </div>
    </div>
    <div className="profile-edit-bottom">
        <div className="profile-edit-bottom-desc">
            <div className="profile-edit-bottom-desc-header">
                Description
            </div>
            <div className="profile-edit-bottom-desc-main">
                <textarea className='profile-edit-top-right-entry-input' value={inputDescription} onChange={(e) => setInputDescription(e.currentTarget.value)}></textarea>
            </div>
        </div>
    </div>
    <div className='profile-edit-submit'>
        <div className='profile-edit-submit-btn' onClick={handleSubmitBtnClick}>
            Submit
        </div>
    </div>
</div>
}