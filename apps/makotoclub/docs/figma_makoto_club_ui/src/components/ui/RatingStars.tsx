import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export function RatingStars({ rating, size = 'md', showNumber = true }: RatingStarsProps) {
  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = rating - i;
    return (
      <div key={i} className="relative">
        <Star className={`${sizeMap[size]} text-gray-300`} />
        {filled > 0 && (
          <div 
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${Math.min(filled, 1) * 100}%` }}
          >
            <Star className={`${sizeMap[size]} text-yellow-400 fill-yellow-400`} />
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="flex items-center gap-1">
      {stars}
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
