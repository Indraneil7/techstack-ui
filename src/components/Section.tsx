import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2, ChevronDown, ChevronUp, Wand2, X } from 'lucide-react';
import { Toolkit, Tool, Comment, ProcessStep } from '../types/index';
import ProcessMap from './ProcessMap';
import ToolDetail from './ToolDetail';
import { api } from '../utils/api';

interface SectionProps {
  data: Toolkit;
  onAddComment?: (toolkitId: number, comment: string) => Promise<void>;
  onAddToolComment?: (toolId: number, comment: string) => Promise<void>;
  title: string;
  processes?: ProcessStep[];
}

const Section: React.FC<SectionProps> = ({ 
  data,
  onAddComment,
  onAddToolComment,
  title,
  processes = []
}) => {
  // State management
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(data?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState<{[key: string]: boolean}>({});
  const [isCommentsLoaded, setIsCommentsLoaded] = useState(false);

  // Debug log to see what data we're receiving
  console.log('Section data:', data);
  console.log('Process stages:', data?.processstages_id);

  useEffect(() => {
    const loadComments = async () => {
      if (!isCommentsLoaded && data?.id) {
        try {
          const toolkitComments = await api.getToolkitComments(data.id);
          if (Array.isArray(toolkitComments?.items)) {
            setComments(toolkitComments.items.map((comment: { id: any; comment: any; created_at: string | number | Date; }) => ({
              id: comment.id,
              text: comment.comment,
              author: 'Anonymous',
              timestamp: new Date(comment.created_at).toISOString()
            })));
            setCommentsCount(toolkitComments.items.length);
          }
          setIsCommentsLoaded(true);
        } catch (error) {
          console.error('Error loading comments:', error);
        }
      }
    };

    loadComments();
  }, [data?.id, isCommentsLoaded]);

  useEffect(() => {
    if (comments.length >= 2) {
      setShowComments(true);
    }
  }, [comments]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  const handleExplainAll = () => {
    console.log('Current process stages:', data?.processstages_id);
    
    if (!data?.processstages_id?.length) return;
    
    if (Object.keys(expandedExplanations).length > 0) {
      setExpandedExplanations({});
      setIsExplaining(false);
    } else {
      // Ensure we're handling the correct data structure
      const processStages = Array.isArray(data.processstages_id[0])
        ? (data.processstages_id[0] as unknown) as ProcessStep[]
        : (data.processstages_id as unknown) as ProcessStep[];
        
      const newExpandedState = processStages.reduce((acc, process) => {
        if (process && typeof process === 'object' && 'id' in process) {
          // Convert number to string explicitly
          acc[process.id.toString()] = true;
        }
        return acc;
      }, {} as {[key: string]: boolean});
      
      console.log('New expanded state:', newExpandedState);
      setExpandedExplanations(newExpandedState);
      setIsExplaining(true);
    }
  };

  if (!data) {
    return null;
  }

  // Ensure processstages_id is always a flat array of ProcessStep
  const processStages = Array.isArray(data.processstages_id) 
    ? (Array.isArray(data.processstages_id[0])
        ? (data.processstages_id[0] as unknown) as ProcessStep[]
        : (data.processstages_id as unknown) as ProcessStep[])
    : [];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      {/* Title, Description, and Actions Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h2>
            <p className="text-gray-600">{data.description}</p>
        </div>

          {/* Social Actions */}
          <div className="flex items-center space-x-4 ml-4">
          <button
            onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-blue-500' : 'text-gray-600'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>
          <button
            onClick={handleShare}
              className="text-gray-600"
          >
            <Share2 className="w-5 h-5" />
          </button>
          </div>
        </div>
      </div>

      {/* Process Map section with AI Explain button */}
      <div className="pt-4">
        {processStages.length > 0 && (
          <>
            <div className="mb-3">
              <button
                onClick={handleExplainAll}
                className={`
                  flex items-center space-x-2 px-4 py-2 
                  bg-gradient-to-r from-purple-500 to-blue-500 
                  text-white rounded-full shadow-md 
                  hover:from-purple-600 hover:to-blue-600 
                  transition-all duration-200 
                  ${isExplaining ? 'opacity-75' : ''}
                `}
              >
                <Wand2 className={`w-4 h-4 ${isExplaining ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">
                  {Object.keys(expandedExplanations).length > 0 
                    ? 'Hide AI Explanations' 
                    : 'Explain with AI'
                  }
                </span>
              </button>
            </div>
            <ProcessMap 
              data={{ 
                processSteps: processStages
              }} 
              onToolClick={setSelectedTool}
              explanations={expandedExplanations}
            />
          </>
        )}
      </div>

      {/* Comments Section */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({commentsCount})
          </h3>
          {comments.length > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showComments ? 'Hide Comments' : 'Show Comments'}
            </button>
          )}
        </div>
        
          {showComments && (
          <>
            {/* Comment Input */}
            <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => onAddComment?.(data.id, comment)}
                    disabled={isSubmitting || !comment.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </button>
                </div>

            {/* Comments List */}
                <div className="space-y-4">
              {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                  <p className="mt-1 text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
          </>
          )}
      </div>

      {/* Tool Detail Sidebar */}
      <AnimatePresence>
        {selectedTool && (
          <ToolDetail 
            tool={selectedTool} 
            onClose={() => setSelectedTool(null)}
            onAddComment={onAddToolComment}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Section;