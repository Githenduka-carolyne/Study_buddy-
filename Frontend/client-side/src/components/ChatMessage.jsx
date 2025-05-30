import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimeAgo from 'react-timeago';

const REACTIONS = ['👍', '❤️', '😊', '😮', '😢', '😡'];

const ChatMessage = ({ 
  message, 
  isCurrentUser, 
  onReply, 
  onReact,
  onEdit,
  onDelete,
  replyingTo,
  showReplies = true,
  isReply = false
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message.message);
  const [showActions, setShowActions] = useState(false);

  const handleReaction = (emoji) => {
    onReact(message.id, emoji);
    setShowReactions(false);
  };

  const handleEdit = () => {
    if (typeof message.message !== 'string') return; // Can't edit file messages
    setIsEditing(true);
    setEditedMessage(message.message);
  };

  const handleSaveEdit = () => {
    if (editedMessage.trim() !== message.message) {
      onEdit(message.id, editedMessage);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedMessage(message.message);
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return <span className="text-blue-400">✓✓</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isReply ? 'ml-8' : ''}`}
    >
      <div 
        className="relative group"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Message Content */}
        <div
          className={`max-w-[70%] rounded-lg p-3 ${
            isCurrentUser
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-700 text-gray-200'
          }`}
        >
          {/* Reply Reference */}
          {replyingTo && (
            <div className="text-xs opacity-75 mb-2 pb-2 border-b border-gray-500">
              <span className="text-indigo-300">Replying to {replyingTo.sender}</span>
              <p className="truncate">{typeof replyingTo.message === 'string' ? replyingTo.message : replyingTo.message.filename}</p>
            </div>
          )}

          {/* Sender Name and Time */}
          <div className="flex justify-between items-center mb-1">
            {!isCurrentUser && (
              <span className="text-xs text-indigo-400 font-medium">
                {message.sender}
              </span>
            )}
            <div className="flex items-center space-x-1 text-xs opacity-70">
              <TimeAgo date={message.timestamp} />
              {isCurrentUser && getStatusIcon()}
            </div>
          </div>

          {/* Message Content */}
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-800 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={Math.min(editedMessage.split('\n').length, 5)}
                autoFocus
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-xs rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-xs bg-indigo-500 rounded hover:bg-indigo-600"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            typeof message.message === 'string' ? (
              <p className="whitespace-pre-wrap">
                {message.edited ? <span className="text-xs opacity-70">(edited) </span> : null}
                {message.message}
              </p>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <a
                  href={message.message.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 hover:text-indigo-200"
                >
                  {message.message.filename}
                </a>
              </div>
            )
          )}

          {/* Reactions Display */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="absolute -bottom-3 left-0 flex flex-wrap gap-1 bg-gray-800 rounded-full px-2 py-1 shadow-lg">
              {Object.entries(
                message.reactions.reduce((acc, reaction) => {
                  acc[reaction] = (acc[reaction] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]) => (
                <div
                  key={emoji}
                  className="flex items-center space-x-1 text-xs bg-gray-700 rounded-full px-2 py-0.5"
                >
                  <span>{emoji}</span>
                  {count > 1 && <span className="opacity-70">{count}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, x: isCurrentUser ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isCurrentUser ? 20 : -20 }}
              className={`absolute top-0 ${
                isCurrentUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
              } h-full flex items-center`}
            >
              <div className="flex items-center space-x-1 px-2">
                {/* Reply Button */}
                <button
                  onClick={() => onReply(message)}
                  className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
                  title="Reply"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>

                {/* React Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
                    title="Add reaction"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Reactions Picker */}
                  <AnimatePresence>
                    {showReactions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg p-2 flex space-x-2"
                      >
                        {REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className="hover:bg-gray-700 p-1 rounded transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Edit and Delete Buttons (only for current user's messages) */}
                {isCurrentUser && typeof message.message === 'string' && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
                      title="Edit message"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(message.id)}
                      className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
                      title="Delete message"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
