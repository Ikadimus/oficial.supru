import React from 'react';

const StarRating: React.FC<{ rating: number; max?: number }> = ({ rating, max = 5 }) => {
    return (
        <div className="flex space-x-1">
            {[...Array(max)].map((_, i) => (
                <svg 
                    key={i} 
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            ))}
        </div>
    );
};

export default StarRating;