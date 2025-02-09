import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ThumbsUp, MessageSquare, ExternalLink } from 'lucide-react';
import { Tool, Comment } from '../types';

interface ToolDetailProps {
  tool: Tool;
  onClose: () => void;
  onAddComment?: (toolId: number, comment: string) => Promise<void>;
}

const ToolDetail: React.FC<ToolDetailProps> = ({ 
  tool, 
  onClose,
  onAddComment 
}) => {
  // State management
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tool.likes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!comment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      if (onAddComment) {
        await onAddComment(tool.id, comment);
      }

      const newComment: Comment = {
        id: Date.now(),
        text: comment,
        author: 'You',
        timestamp: new Date().toISOString()
      };

      setComments(prev => [...prev, newComment]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>';
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      style={{ position: 'fixed', inset: '0 0 0 auto', width: '100%', maxWidth: '28rem', backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src={tool.icon?.url} 
                alt={tool.name}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                onError={handleImageError}
              />
              <h2 className="text-2xl font-bold text-gray-900">{tool.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close details"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Overview</h3>
              <p className="text-gray-600">{tool.overview}</p>
            </div>

            {/* Features */}
            {tool.features && tool.features.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Key Features</h3>
                <ul className="space-y-2">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Website */}
            {tool.website && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Website</h3>
                <a 
                  href={tool.website.startsWith('http') ? tool.website : `https://${tool.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-600"
                >
                  <span>{tool.website}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Comments</h3>
              
              <div className="flex space-x-2 mb-6">
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

              <div className="space-y-4">
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
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-blue-500' : 'text-gray-600'}`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span className="font-medium">{likesCount}</span>
              </button>
              <div className="flex items-center space-x-1 text-gray-600">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">{comments.length}</span>
              </div>
            </div>
            {tool.website && (
              <a
                href={tool.website.startsWith('http') ? tool.website : `https://${tool.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Learn More
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ToolDetail;