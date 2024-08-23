export default function Logo(){
    return (
        <>
        <div className="text-orange-500 flex gap-2 font-bold text-2xl mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                    </svg>
                    InstaChat
        
        </div>
        <hr className="w-3/4 flex self-center h-1 bg-gray-200 mb-2"/>
        </>
    );
}