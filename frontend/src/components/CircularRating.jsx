const CircularRating = ({ rating }) => {
    const percentage = (rating/10) * 100; 
    const radius = 45; 
    const circumference = 2 * Math.PI * radius; 
    const offset = circumference - (percentage / 100) * circumference; 

    // Determine the color based on the rating
    const getColor = (rating) => {
        if (rating >= 8) return '#4caf50'; // green
        if (rating >= 5) return '#ff9800'; // orange 
        return '#f44336'; // red 
    };

    return (
        <svg width="100" height="100">
            <path
                d={`M 50,5 
                   A 45,45 0 1,1 50,95 
                   A 45,45 0 1,1 50,5`}
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="10"
            />
            <path
                d={`M 50,5 
                   A 45,45 0 1,1 50,95 
                   A 45,45 0 1,1 50,5`}
                fill="none"
                stroke={getColor(rating)} 
                strokeWidth="10"
                strokeDasharray={circumference} 
                strokeDashoffset={offset} 
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} 
            />
        
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="#333"
                fontSize="16px"
                fontWeight="bold"
                fontFamily="'Arial', sans-serif"
            >
                {rating}/10
            </text>
            
            <text
                x="50%"
                y="65%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="#999"
                fontSize="12px"
                fontFamily="'Arial', sans-serif"
            >
                {percentage.toFixed(0)}%
            </text>
        </svg>
    );
};

export default CircularRating;