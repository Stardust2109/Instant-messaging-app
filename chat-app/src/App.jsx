import { useState } from 'react'
import './App.css'
import axios from 'axios';
import {UserContext, UserContextProvider} from "./UserContext.jsx";

import Routes from './Routes.jsx';

function App() {
  axios.defaults.baseURL = "https://instant-messaging-app-backend.onrender.com";
  axios.defaults.withCredentials = true;
  
  return (
    <UserContextProvider>
      <Routes/>
    </UserContextProvider>
      
    
  )
}

export default App
