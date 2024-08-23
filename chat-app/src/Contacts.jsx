import UserAvatar from "./UserAvatar"

export default function Contacts({ id, username, onClick, selected, online }) {
    return (
        
        <div key={id} onClick={() => onClick(id)} className={`border-b border-gray-100 py-2 pl-4 flex 
            items-center gap-2 cursor-pointer ${(selected) ? 'bg-blue-100' : ''}`}>
            <UserAvatar username={username} userId={id} onlineStatus={online} />
            <span className="text-zinc-600 font-semibold text-lg">{username} </span>
        </div>

    );
}