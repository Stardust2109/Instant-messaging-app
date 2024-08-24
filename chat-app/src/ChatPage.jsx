import { useEffect, useState, useContext, useRef } from "react";
import UserAvatar from "./UserAvatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext"
import { uniqBy } from "lodash";
import axios from "axios";
import Contacts from "./Contacts";

export default function ChatPage() {
    const [ws, setWs] = useState(null);
    const [uniqueOnline, setUniqueOnline] = useState({});
    const [offlineUsers, setOfflineUsers] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [allMessages, setAllMessages] = useState([]);

    const { username, id, setId, setUsername } = useContext(UserContext);
    const divUnderMessages = useRef();

    useEffect(() => {
        autoReconnect();
    }, []);

    function autoReconnect() {
        const ws = new WebSocket('wss://instant-messaging-app-backend.onrender.com');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log("Ws disconnected...Trying to reconnect..")
                autoReconnect();
            }, 1000)

        });
    }

    function showOnlineUsers(usersArray) {
        const uniqueUsers = {};
        usersArray.forEach(({ userId, username }) => {
            uniqueUsers[userId] = username;
        });
        
        setUniqueOnline(uniqueUsers);
    }


    function handleMessage(ev) {
        const messageData = JSON.parse(ev.data);
        
        if ('onlineUsers' in messageData) {
            showOnlineUsers(messageData.onlineUsers);
        }
        else if ('text' in messageData) {
            if (messageData.sender === selectedUser) {
                setAllMessages(prev => ([...prev, { ...messageData }]));
            }
        }
        
    }

    const uniqueExcludingSelf = { ...uniqueOnline };
    delete uniqueExcludingSelf[id];

    function sendMessage(ev, file = null) {

        if (ev) ev.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUser,
            text: messageText,
            file,
        }))

        if (file) {
            axios.get(`/messages`).then(res => {
                setAllMessages(res.data);
            });
        }
        else {

            setMessageText("");
            setAllMessages(prev => ([...prev, {
                text: messageText,
                sender: id,
                recipient: selectedUser,
                _id: Date.now(),
            }]));
        }
    }

    function logout() {
        axios.get(`/logout`).then(() => {
            setId(null);
            setUsername(null);
            setWs(null);
        });
    };

    function sendAttachment(ev) {
        const reader = new FileReader();
        reader.readAsDataURL(ev.target.files[0]);
        reader.onload = () => {
            sendMessage(null, {
                name: ev.target.files[0].name,
                data: reader.result,
            });
        }

    };

    useEffect(() => {
        const div = divUnderMessages.current;
        if (div) {
            div.scrollIntoView({ behaviour: 'smooth', block: 'end' });
        }
    }, [allMessages]);

    useEffect(() => {
        if (selectedUser)
            axios.get(`/messages/` + selectedUser).then(res => {
                
                setAllMessages(res.data);

            })
    }, [selectedUser]);

    useEffect(() => {
        axios.get(`/people`).then(res => {
            const offlineUsersArr = res.data
                .filter(p => p._id !== id)
                .filter(p => !Object.keys(uniqueOnline).includes(p._id));
            const OfflineUsers = {};
            offlineUsersArr.forEach(p => {
                OfflineUsers[p._id] = p;
            });
            setOfflineUsers(OfflineUsers);
        });
    }, [uniqueOnline]);



    const uniqueMessages = uniqBy(allMessages, '_id');

    return (
        <div className="flex h-screen">
            <div className="bg-blue-200 w-1/3 p-4 flex flex-col">
                <div className="flex-grow">
                    <Logo />
                    {Object.keys(uniqueExcludingSelf).map(userId => (
                        <Contacts
                            key={userId}
                            id={userId}
                            username={uniqueExcludingSelf[userId]}
                            onClick={() => setSelectedUser(userId)}
                            selected={userId === selectedUser}
                            online={true}
                        />
                    ))}

                    {Object.keys(offlineUsers).map(userId => (
                        <Contacts
                            key={userId}
                            id={userId}
                            username={offlineUsers[userId].username}
                            onClick={() => setSelectedUser(userId)}
                            selected={userId === selectedUser}
                            online={false}
                        />
                    ))}
                </div>


                <div className="p-2 text-center flex justify-between">
                    <div className="flex items-center">

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                        </svg>




                        <span className="ml-2 text-lg text-gray-600">Hello, {username}!</span>
                    </div>

                    <div onClick={logout} className="flex bg-blue-100 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
                        </svg>
                        <button className=" py-1 px-2 border rounded-sm text-gray-500 text-xl font-bold">Logout</button>

                    </div>



                </div>

            </div>
            <div className="flex flex-col bg-blue-50 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUser && (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-gray-500 text-xl font-semibold">
                                Select a contact to view messages
                            </div>
                        </div>
                    )}
                    {!!selectedUser && (

                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                                {uniqueMessages.map(message => (
                                    <div key={message._id} className={message.sender === id ? 'text-right' : 'text-left'}>
                                        <div className={`text-left inline-block p-2 my-2 rounded-md text-sm ${message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}>
                                            {message.text}
                                            {message.file && (
                                                <div>
                                                    <a target="_blank" className="flex items-center gap-1 border-b " href={axios.defaults.baseURL + "/Attachments/" + message.file}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                                                            <path fillRule="evenodd" d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z" clipRule="evenodd" />
                                                        </svg>
                                                        {message.file}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMessages}> </div>

                            </div>
                        </div>


                    )}

                </div>
                {!!selectedUser && (
                    <form className="flex gap-2 " onSubmit={sendMessage}>
                        <input type="text"
                            value={messageText}
                            onChange={ev => setMessageText(ev.target.value)}
                            placeholder="Type your message here"
                            className="bg-white flex-grow border p-2 rounded-sm"
                        />
                        <label type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-600 p-2 rounded-sm cursor-pointer">
                            <input type="file" className="hidden" onChange={sendAttachment} />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                                <path fillRule="evenodd" d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z" clipRule="evenodd" />
                            </svg>

                        </label>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>

                        </button>
                    </form>
                )}

            </div>

        </div>
    )
}
