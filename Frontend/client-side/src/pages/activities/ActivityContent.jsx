import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircleIcon, ArrowRightIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'http://localhost:5001';

const QuizQuestion = ({ question, choices, correctAnswer, onAnswerSubmit }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    const correct = selectedAnswer === correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswerSubmit(correct);
  };

  return (
    <div className="mb-8 p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">{question}</h3>
      <div className="space-y-2">
        {choices.map((choice, index) => (
          <div key={index} className="flex items-center">
            <input
              type="radio"
              id={`choice-${index}`}
              name={question}
              value={choice}
              checked={selectedAnswer === choice}
              onChange={(e) => {
                setSelectedAnswer(e.target.value);
                setShowFeedback(false);
              }}
              className="mr-2"
            />
            <label htmlFor={`choice-${index}`}>{choice}</label>
          </div>
        ))}
      </div>
      {!showFeedback && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          Submit Answer
        </button>
      )}
      {showFeedback && (
        <div className={`mt-4 p-3 rounded-md ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isCorrect ? (
            <p>Correct! Well done!</p>
          ) : (
            <p>Incorrect. The correct answer is: {correctAnswer}</p>
          )}
        </div>
      )}
    </div>
  );
};

const ActivityContent = ({ subtopic, onMarkComplete }) => {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [activityStats, setActivityStats] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const activityStartTime = useRef(new Date());
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchQuizQuestions = async () => {
      if (!subtopic?.id || authLoading) return;
      
      if (!user) {
        setError('Please log in to access quiz questions');
        setQuizQuestions([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found in localStorage');
          throw new Error('Please log in to access quiz questions');
        }

        console.log('Making request with token:', token);
        const response = await fetch(`${BASE_URL}/api/activities/subtopics/${subtopic.id}/quiz`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token.trim().replace(/['"]+/g, '')}`,
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.log('Error response:', response.status, errorData);
          
          if (response.status === 401) {
            // Clear token and user data if authentication fails
            localStorage.removeItem('token');
            throw new Error(errorData.message || 'Please log in to access quiz questions');
          } else if (response.status === 404) {
            throw new Error(errorData.message || 'Quiz questions not found for this topic');
          }
          throw new Error(errorData.message || 'Failed to fetch quiz questions');
        }
        
        const data = await response.json();
        console.log('Received quiz data:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format from server');
        }
        setQuizQuestions(data);
      } catch (err) {
        console.error('Error fetching quiz questions:', err);
        setError(err.message || 'Failed to load quiz questions. Please try again later.');
        setQuizQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizQuestions();
  }, [subtopic?.id, user, authLoading]);

  // Fetch recommendations when subtopic changes
  useEffect(() => {
    if (subtopic?.id && user) {
      fetchRecommendations();
      fetchActivityStats();

      // Reset activity start time when subtopic changes
      activityStartTime.current = new Date();

      // Return cleanup function to log activity duration when leaving
      return () => {
        logUserActivity();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtopic?.id, user]);

  // Log user activity
  const logUserActivity = async () => {
    if (!subtopic?.id || !user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const duration = Math.floor((new Date() - activityStartTime.current) / 1000); // Duration in seconds

      await fetch(`${BASE_URL}/api/ml-activity/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim().replace(/['"]+/g, '')}`
        },
        body: JSON.stringify({
          activityType: 'study_session',
          activityId: subtopic.activity_id,
          subtopicId: subtopic.id,
          duration,
          completionRate: subtopic.isCompleted ? 100 : 0,
          metadata: {
            contentLength: subtopic.content.length,
            quizAttempted: quizQuestions.length > 0,
            correctAnswers
          }
        })
      });

      console.log('Activity logged successfully');
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Fetch personalized recommendations
  const fetchRecommendations = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/api/ml-activity/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token.trim().replace(/['"]+/g, '')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Fetch user activity statistics
  const fetchActivityStats = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/api/ml-activity/stats`, {
        headers: {
          'Authorization': `Bearer ${token.trim().replace(/['"]+/g, '')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivityStats(data);
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error);
    }
  };

  const handleAnswerSubmit = (isCorrect) => {
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Log quiz activity
    try {
      const token = localStorage.getItem('token');
      if (!token || !subtopic?.id) return;

      fetch(`${BASE_URL}/api/ml-activity/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim().replace(/['"]+/g, '')}`
        },
        body: JSON.stringify({
          activityType: 'quiz',
          activityId: subtopic.activity_id,
          subtopicId: subtopic.id,
          score: isCorrect ? 1 : 0,
          metadata: {
            questionAttempted: true,
            result: isCorrect ? 'correct' : 'incorrect'
          }
        })
      });
    } catch (error) {
      console.error('Error logging quiz activity:', error);
    }
  };

  if (!subtopic) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Welcome to the course!</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a topic from the list to start learning
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{subtopic.title}</h2>
          {!subtopic.isCompleted ? (
            <button
              onClick={() => onMarkComplete(subtopic.id)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <span>Mark as Complete</span>
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          ) : (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="h-5 w-5 mr-1.5" />
              Completed
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="prose prose-indigo max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                    <code className={`${className} text-sm text-gray-100`} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-gray-100 rounded px-1 py-0.5 text-sm text-gray-800" {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-bold mb-2 mt-4">{children}</h3>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
            }}
          >
            {subtopic.content}
          </ReactMarkdown>
        </div>

        {/* ML-based Recommendations Section */}
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Smart Recommendations</h3>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <LightBulbIcon className="h-5 w-5 mr-1" />
              {showRecommendations ? 'Hide' : 'Show'} Recommendations
            </button>
          </div>

          {showRecommendations && (
            <div className="bg-indigo-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-indigo-800 mb-3">Personalized for You</h4>

              {recommendations.length === 0 ? (
                <p className="text-gray-600">Continue learning to get personalized recommendations.</p>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                      <div className="flex items-start">
                        <div className="bg-indigo-100 rounded-full p-2 mr-3">
                          <LightBulbIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium">{rec.recommendationType === 'next_topic' ? 'Suggested Next Topic' :
                                                     rec.recommendationType === 'similar_content' ? 'Similar Content' :
                                                     'Group Suggestion'}</p>
                          <p className="text-sm text-gray-600">{rec.reason}</p>
                          <div className="mt-2">
                            <button className="text-sm text-indigo-600 hover:text-indigo-800">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activityStats && (
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <h4 className="font-medium text-indigo-800 mb-2">Your Learning Stats</h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="bg-white p-3 rounded-md">
                      <p className="text-xs text-gray-500">Total Time</p>
                      <p className="font-medium">{activityStats.totalTimeSpent ? Math.floor(activityStats.totalTimeSpent / 60) : 0} mins</p>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <p className="text-xs text-gray-500">Completion Rate</p>
                      <p className="font-medium">{activityStats.avgCompletionRate ? Math.round(activityStats.avgCompletionRate) : 0}%</p>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <p className="text-xs text-gray-500">Study Sessions</p>
                      <p className="font-medium">
                        {activityStats.activityCounts && Array.isArray(activityStats.activityCounts)
                          ? activityStats.activityCounts.find(a => a.activityType === 'study_session')?._count?.id || 0
                          : 0}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <p className="text-xs text-gray-500">Quizzes Taken</p>
                      <p className="font-medium">
                        {activityStats.activityCounts && Array.isArray(activityStats.activityCounts)
                          ? activityStats.activityCounts.find(a => a.activityType === 'quiz')?._count?.id || 0
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Practice Questions Section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-6">Practice Questions</h3>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading questions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-600">
              {error}
            </div>
          ) : quizQuestions.length === 0 ? (
            <div className="text-center py-4 text-gray-600">
              No practice questions available for this topic.
            </div>
          ) : (
            quizQuestions.map((q, index) => (
              <QuizQuestion
                key={q.id}
                question={q.question}
                choices={q.choices}
                correctAnswer={q.correctAnswer}
                onAnswerSubmit={handleAnswerSubmit}
              />
            ))
          )}
        </div>

        {!subtopic.isCompleted && (
          <div className="mt-8 border-t pt-6">
            <button
              onClick={() => onMarkComplete(subtopic.id)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <span>Complete and Continue</span>
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityContent;
