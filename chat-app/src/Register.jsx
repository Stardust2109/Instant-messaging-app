import { useContext, useState } from "react";
import axios from 'axios';
import { UserContext } from "./UserContext.jsx"

export default function Register() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [alreadyRegistered, setAlreadyRegistered] = useState('login');
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

    useContext(UserContext);

    const newOrNot = alreadyRegistered === 'register' ? 'register' : 'login';

    async function handleSubmit(ev) {
        ev.preventDefault();
        const { data } = await axios.post(`/` + newOrNot, { username, password });
        setLoggedInUsername(username);
        setId(data.id);
    }

    return <div className="bg-blue-50 h-screen flex items-center">
        <form className="w-72 mx-auto mb-12" onSubmit={handleSubmit}>

            <input value={username} onChange={ev => setUsername(ev.target.value)} type="text"
                placeholder="Username" className="block w-full rounded-md p-2 mb-2 border" />

            <input value={password} onChange={ev => setPassword(ev.target.value)}
                type="password" placeholder="Password" className="block w-full rounded-md p-2 mb-2 border" />

            <button className="bg-blue-500 text-white block w-full rounded-md p-2 mb-2 border">
                {alreadyRegistered === 'register' ? "Sign Up" : "Login"}
            </button>
            <div className="text-center mt-2">
                {
                    alreadyRegistered === 'register' && (
                        <div>
                            {`Already registered ? `}
                            <button className={"hover:underline"} onClick={() => setAlreadyRegistered('login')}>
                                Login here
                            </button>

                        </div>
                    )
                }

                {
                    alreadyRegistered === 'login' && (
                        <div>
                            {`New here? `}
                            <button className={"hover:underline"} onClick={() => setAlreadyRegistered('register')}>
                                Register Now
                            </button>

                        </div>
                    )
                }

            </div>
        </form>
    </div>
}
