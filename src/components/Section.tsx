import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { Toolkit, Tool, Comment } from '../types';
import ProcessMap from './ProcessMap';
import ToolDetail from './ToolDetail';

interface SectionProps {
  data: Toolkit;
  onAddComment?: (toolkitId: number, comment: string) => Promise<void>;
  onAddToolComment?: (toolId: number, comment: string) => Promise<void>;
}

const Section: React.FC<SectionProps> = ({ 
  data,
  onAddComment,
  onAddToolComment 
}) => {
  // State management
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(data?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(data?.comments || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!data) {
    return null;
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleAddComment = async () => {
    if (!comment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      if (onAddComment) {
        await onAddComment(data.id, comment);
      }

      const newComment: Comment = {
        id: Date.now(),
        text: comment,
        author: 'You',
        timestamp: new Date().toISOString()
      };

      setComments(prev => [...prev, newComment]);
      setCommentsCount(prev => prev + 1);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex flex-col space-y-4">
        {/* Tags and Engagement Section */}
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {data.industry}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              {data.projectType}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{commentsCount}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title and Description */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {data.title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}
            >
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !comment.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Process Map */}
        <div className="pt-4">
          <ProcessMap 
            data={data} 
            onToolClick={setSelectedTool} 
          />
        </div>
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