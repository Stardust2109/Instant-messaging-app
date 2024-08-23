import { useContext } from "react";
import { UserContext, UserContextProvider} from "./UserContext.jsx";
import Register from "./Register";
import ChatPage from "./ChatPage.jsx";

export default function Routes(){
    const {username, id} = useContext(UserContext);

    if(username){
        return <ChatPage/>
    }

    return(
        <Register />
    )
}