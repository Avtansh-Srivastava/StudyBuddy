import React, { useState } from 'react';
import { Flashcard } from '../contexts/FlashcardContext';
import { Trash2 } from 'lucide-react';

interface FlashcardItemProps {
  flashcard: Flashcard;
  onDelete: (id: string) => void;
  onReview: (id: string) => void;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({ flashcard, onDelete, onReview }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      onReview(flashcard.id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="h-64 w-full perspective-1000">
      <div 
        className={`flip-card h-full w-full ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        {/* Front of card */}
        <div className="flip-card-front bg-white rounded-lg shadow-md p-6 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-500">
              Created: {formatDate(flashcard.createdAt)}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(flashcard.id);
              }}
              className="text-error hover:text-error/80 transition-colors"
              aria-label="Delete flashcard"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <h3 className="text-xl font-medium text-center">{flashcard.question}</h3>
          </div>
          <div className="text-center mt-4">
            <span className="text-sm text-primary-600">Click to reveal answer</span>
          </div>
        </div>
        
        {/* Back of card */}
        <div className="flip-card-back bg-primary-50 rounded-lg shadow-md p-6 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-500">
              {flashcard.lastReviewed 
                ? `Last reviewed: ${formatDate(flashcard.lastReviewed)}` 
                : 'Not reviewed yet'}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(flashcard.id);
              }}
              className="text-error hover:text-error/80 transition-colors"
              aria-label="Delete flashcard"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="flex-grow overflow-auto">
            <p className="text-center">{flashcard.answer}</p>
          </div>
          <div className="text-center mt-4">
            <span className="text-sm text-primary-600">Click to see question</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardItem;