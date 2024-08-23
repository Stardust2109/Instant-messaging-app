export default function UserAvatar(props){
    console.log(props.username);
    const colors = ['bg-red-200', 'bg-green-200', 'bg-yellow-200', 
        'bg-teal-200', 'bg-orange-200', 'bg-pink-200', 'bg-blue-200'];
    const userIdbase10 = parseInt(props.userId, 16);
    const avatarColorIndex = userIdbase10 % colors.length;
    const avatarColor = colors[avatarColorIndex];
    return(
        <div className={`w-8 h-8 relative bg-center rounded-full flex ${avatarColor} items-center`}>
            <div className="w-full text-center">
                {props.username[0]}
                
                {props.onlineStatus && 
                    <div className = "absolute w-2 h-2 bg-green-400 bottom-0 right-0 rounded-full border-0 border-white"></div>
                }
                {
                    !props.onlineStatus && 
                    <div className = "absolute w-2 h-2 bg-gray-400 bottom-0 right-0 rounded-full border-0 border-white"></div>
                }
                
            </div>
            
        </div>
    );
};