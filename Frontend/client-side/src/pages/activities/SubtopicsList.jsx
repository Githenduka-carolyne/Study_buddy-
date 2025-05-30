import React from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

const SubtopicsList = ({ subtopics, selectedSubtopic, onSelectSubtopic }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-sm font-medium text-gray-500">Course Content</h3>
        <p className="text-xs text-gray-400 mt-1">
          {subtopics.filter(s => s.isCompleted).length} of {subtopics.length} completed
        </p>
      </div>
      <div className="divide-y">
        {subtopics.map((subtopic, index) => (
          <button
            key={subtopic.id}
            onClick={() => onSelectSubtopic(subtopic)}
            className={`w-full px-4 py-3 flex items-center text-left hover:bg-gray-50 transition-colors ${
              selectedSubtopic?.id === subtopic.id ? 'bg-indigo-50' : ''
            }`}
          >
            <div className="mr-3 flex-shrink-0">
              {subtopic.isCompleted ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <div className="flex items-center justify-center h-5 w-5 rounded-full border-2 border-gray-300 text-xs font-medium text-gray-500">
                  {index + 1}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium truncate ${
                  subtopic.isCompleted ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {subtopic.title}
                </p>
              </div>
              {selectedSubtopic?.id === subtopic.id && (
                <p className="mt-1 text-xs text-gray-500">
                  Currently viewing
                </p>
              )}
            </div>
            {!subtopic.isCompleted && selectedSubtopic?.id === subtopic.id && (
              <div className="ml-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubtopicsList;
