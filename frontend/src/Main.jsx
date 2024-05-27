import { Routes, Route } from 'react-router-dom';
import Profile from './Profile';
import Register from './Register';
import PostAdd from './PostAdd';
import { useState } from 'react';
import Post from './Post';
import Prediction from './Prediction';
import Login from './Login';
import Feed from './Feed';

export default function Main({username, token, isAdmin, setUsername, setToken, setIsAdmin, userID, setUserID}) {
    return <Routes>
        <Route exact path="/" element={<Feed/>}/>
        <Route exact path='/profile' element={<Profile username={username} setUsername={setUsername} token={token} setToken={setToken} isAdmin={isAdmin} setIsAdmin={setIsAdmin} setUserID={setUserID}/>}/>
        <Route exact path='/register' element={<Register username={username} setUsername={setUsername} setToken={setToken} setIsAdmin={setIsAdmin} setUserID={setUserID}/>}/>
        <Route exact path='/post/create' element={<PostAdd token={token}/>}/>
        <Route exact path='/post/:post_id' element={<Post token={token} userID={userID}/>}/>
        <Route exact path='/predictions' element={<Prediction token={token} setUsername={setUsername} setToken={setToken} setIsAdmin={setIsAdmin} setUserID={setUserID}/>}/>
        <Route exact path='/login' element={<Login setUsername={setUsername} setToken={setToken} setIsAdmin={setIsAdmin} setUserID={setUserID}/>}/>
    </Routes>   
}