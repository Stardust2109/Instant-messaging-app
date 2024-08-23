import axios from "axios";

import { createContext, useState, useEffect } from "react";

// const UserContext = createContext({});

export const UserContext = createContext({});

export function UserContextProvider({children}){
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);

    useEffect(() =>{
        try{
            axios.get('/profile').then(response => {
            setId(response.data.userId);
            setUsername(response.data.username);
        })}
        catch{
            json.response("Something snapped");
        }
    }, []);

    return (
        <UserContext.Provider value={{username, setUsername, id, setId}}>
            {children}
        </UserContext.Provider>
    );
    
    
}