export default function PostLoadingSkeleton() {
    const container = [];
    for (let i = 0; i < 7; ++i) {
        container.push(<PostSkeleton key={i}/>)
    }

    return (
        <>
            {container}
        </>);
}


function PostSkeleton() {
    return (
        <div
            className="relative w-full mx-auto my-6 p-4 rounded-2xl shadow-lg bg-white min-w-xs h-60 space-y-1.5 animate-pulse">
            <div className="w-1/2 h-6 font-semibold block bg-gray-200 rounded-xl"></div>
            <div className="h-4 !mb-2 w-40 bg-gray-200 rounded-xl"></div>
            <div className="w-full bg-gray-200 rounded-xl h-4"></div>
            <div className="w-full bg-gray-200 rounded-xl h-4"></div>
            <div className="w-full bg-gray-200 rounded-xl h-4"></div>
            <div className="w-full bg-gray-200 rounded-xl h-4"></div>
            <div className="w-full bg-gray-200 rounded-xl h-4"></div>
            <div className="w-full bg-gray-200 rounded-xl h-4"></div>
            <div className="w-full bg-gray-200 rounded-xl h-4"></div>
        </div>
    )
}