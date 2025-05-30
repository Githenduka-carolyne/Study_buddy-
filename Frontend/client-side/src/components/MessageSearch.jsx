import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimeAgo from 'react-timeago';

const MessageSearch = ({ messages, onJumpToMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = messages.filter(message => 
      typeof message.message === 'string' && 
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(results);
  }, [searchTerm, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
        title="Search messages"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-gray-700">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search messages..."
                className="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => {
                      onJumpToMessage(message.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-4 hover:bg-gray-700 focus:outline-none focus:bg-gray-700 border-b border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-indigo-400">
                        {message.sender}
                      </span>
                      <span className="text-xs text-gray-500">
                        <TimeAgo date={message.timestamp} />
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                      {message.message}
                    </p>
                  </button>
                ))
              ) : searchTerm ? (
                <div className="p-4 text-center text-gray-500">
                  No messages found
                </div>
              ) : null}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageSearch;
