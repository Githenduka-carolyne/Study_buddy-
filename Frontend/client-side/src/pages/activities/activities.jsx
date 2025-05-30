import React, { useState, useEffect } from "react";
import { PlusIcon, UserGroupIcon, CheckCircleIcon, XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import SubtopicsList from "./SubtopicsList";
import ActivityContent from "./ActivityContent";
import QuizQuestion from "../../components/QuizQuestion/QuizQuestion";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
      title: "",
      description: "",
      type: "",
      subtopics: [{ title: '', content: '' }],
      data: {},
    });
  const [error, setError] = useState(null);
  const [userMessage, setUserMessage] = useState(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      fetchActivities();
    }
  }, [user, authLoading]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token?.replace(/['"]+/g, '')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  };
// Fetches the activities from the server
  const fetchActivities = async () => {
    try {
      if (!user) {
        setError('Please log in to view activities');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/activities`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Please log in to view activities');
        }
        throw new Error(errorData.message || 'Failed to fetch activities');
      }
      
      const data = await response.json();
      setActivities(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError(error.message);
      setActivities([]);
    }
  };

   useEffect(() => {
     fetchActivities();
   }, []);
  //  Handles selecting an activity
  const handleSelectActivity = async (activity) => {
    try {
      if (!user) {
        setError('Please log in to view activity details');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/activities/${activity.id}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Please log in to view activity details');
        }
        throw new Error(errorData.message || 'Failed to fetch activity details');
      }
      
      const data = await response.json();
      setSelectedActivity(data);
      setSelectedSubtopic(null);
      setError(null);
    } catch (error) {
      console.error('Error fetching activity details:', error);
      setError(error.message);
    }
  };
  // Handles selecting a subtopic
  const handleSelectSubtopic = async (subtopic) => {
    try {
      if (!user) {
        setError('Please log in to view subtopic details');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/activities/${selectedActivity.id}/subtopics/${subtopic.id}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Please log in to view subtopic details');
        }
        throw new Error(errorData.message || 'Failed to fetch subtopic details');
      }
      
      const data = await response.json();
      setSelectedSubtopic(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching subtopic details:', error);
      setError(error.message);
    }
  };
// handles marking a subtopic as complete
  const handleMarkComplete = async (subtopicId) => {
    try {
      if (!user) {
        setError('Please log in to mark subtopic as complete');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to mark subtopic as complete');
        return;
      }

      console.log('Marking subtopic complete:', subtopicId);
      console.log('User:', user);
      console.log('Token:', token);

      const response = await fetch(`${API_BASE_URL}/activities/subtopics/${subtopicId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.trim().replace(/['"]+/g, '')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', response.status, errorData);
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Please log in to mark subtopic as complete');
        }
        throw new Error(errorData.message || 'Failed to mark subtopic as complete');
      }
      
      const data = await response.json();
      console.log('Mark complete response:', data);

      // Update the selected activity with new progress
      if (selectedActivity) {
        setSelectedActivity(prev => ({
          ...prev,
          progress: data.progress
        }));
      }

      // Update the selected subtopic's completion status
      if (selectedSubtopic && selectedSubtopic.id === subtopicId) {
        setSelectedSubtopic(prev => ({
          ...prev,
          isCompleted: true
        }));
      }

      // Refresh activities list to update progress
      fetchActivities();
      setError(null);
    } catch (error) {
      console.error('Error marking subtopic as complete:', error);
      setError(error.message);
    }
  };

  const handleBack = () => {
    if (selectedSubtopic) {
      setSelectedSubtopic(null);
    } else if (selectedActivity) {
      setSelectedActivity(null);
    }
  };
      const handleSubtopicChange = (index, field, value) => {
        setNewActivity((prevActivity) => {
          const updatedSubtopics = [...prevActivity.subtopics];
          updatedSubtopics[index] = {
            ...updatedSubtopics[index],
            [field]: value,
          };
          return { ...prevActivity, subtopics: updatedSubtopics };
        });
      };

       const addSubtopic = () => {
         setNewActivity((prevActivity) => ({
           ...prevActivity,
           subtopics: [...prevActivity.subtopics, { title: "", content: "" }],
         }));
       };

         const removeSubtopic = (index) => {
           setNewActivity((prevActivity) => ({
             ...prevActivity,
             subtopics: prevActivity.subtopics.filter((_, i) => i !== index),
           }));
         };
  // Handles creating a new activity
const handleCreateActivity = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newActivity),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating activity:", errorData.message);
      throw new Error(errorData.message || "Failed to create activity");
    }
    const data = await response.json();
    // Add new activity to the list of activities
    setActivities((prevActivities) => [...prevActivities, data]);
    setShowCreateForm(false);
    setNewActivity({
      title: '', description: '', subtopics: [{ title: '', content: '' }],
      type: "",
    });
  } catch (error) {
    console.error("Error creating activity:", error);
  }
};

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewActivity((prevActivity) => ({ ...prevActivity, [name]: value }));
  };
  // Handles deleting an activity
const handleDeleteActivity = async (activityId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
     console.log("Response:", response);
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        setUserMessage("You do not have permission to delete this activity.");
      } else if (response.status === 404) {
        setError("Activity not found.");
      } else {
        setError(errorData.message || "Failed to delete activity");
      }
      return;
    }
    // Update the activities list
    setActivities((prevActivities) =>
      prevActivities.filter((activity) => activity.id !== activityId)
    );
  } catch (error) {
    console.error("Error deleting activity:", error);
  }
}; 

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShowCreateForm(true)}
          >
            Create New Activity
          </button>
        </div>
        {showCreateForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Create New Activity
            </h2>
            <form
              onSubmit={handleCreateActivity}
              className=" bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
            >
              <h2 className="text-xl font-semibold mb-4">
                Create New Activity
              </h2>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="title"
                >
                  Title
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="title"
                  type="text"
                  name="title"
                  value={newActivity.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="description"
                  name="description"
                  value={newActivity.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Subtopics */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Subtopics</h3>
                {newActivity.subtopics.map((subtopic, index) => (
                  <div key={index} className="mb-4 p-4 border rounded">
                    <div className="mb-2">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor={`subtopic-title-${index}`}
                      >
                        Subtopic Title
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id={`subtopic-title-${index}`}
                        type="text"
                        value={subtopic.title}
                        onChange={(e) =>
                          handleSubtopicChange(index, "title", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor={`subtopic-content-${index}`}
                      >
                        Subtopic Content
                      </label>
                      <textarea
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id={`subtopic-content-${index}`}
                        value={subtopic.content}
                        onChange={(e) =>
                          handleSubtopicChange(index, "content", e.target.value)
                        }
                        required
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeSubtopic(index)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Remove Subtopic
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSubtopic}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Add Subtopic
                </button>
              </div>

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Create Activity
              </button>
            </form>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button className="absolute top-0 right-0 px-4 py-3">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        {userMessage && ( // Display user message
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Message!</strong>
            <span className="block sm:inline"> {userMessage}</span>
            <button
              className="absolute top-0 right-0 px-4 py-3"
              onClick={() => setUserMessage(null)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        {!selectedActivity ? (
          // Activities List View

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div
                key={activity.id} // Ensure this key is unique and correctly assigned
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{activity.description}</p>
                  <p className="text-gray-600 mb-4">Type: {activity.type}</p>
                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {activity.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${activity.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Activity Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-500">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      <span>{activity.totalSubtopics} subtopics</span>
                    </div>
                    {activity.isJoined && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        In Progress
                      </span>
                    )}
                  </div>

                  {/* Start Learning Button */}

                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => handleSelectActivity(activity)}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                      <span className="mr-2">Start Learning</span>
                      {activity.progress > 0 && activity.progress < 100 ? (
                        <ArrowLeftIcon className="h-5 w-5 transform rotate-180" />
                      ) : activity.progress === 100 ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <PlusIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="mb-6 inline-flex items-center text-red-600 hover:text-gray-900"
                    >
                      <XMarkIcon className="h-5 w-5 mr-2 text-red-500" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Activity Detail View
          <div key="activity-detail-view">
            <button
              onClick={handleBack}
              className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedActivity.title}
                </h2>
                <p className="mt-2 text-gray-600">
                  {selectedActivity.description}
                </p>
                {selectedActivity.progress > 0 && (
                  <div className="mt-4 flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 rounded-full h-2"
                        style={{ width: `${selectedActivity.progress}%` }}
                      ></div>
                    </div>
                    <span className="ml-4 text-sm text-gray-600">
                      {selectedActivity.progress}% Complete
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/4 border-r">
                  <SubtopicsList
                    subtopics={selectedActivity.subtopics}
                    selectedSubtopic={selectedSubtopic}
                    onSelectSubtopic={handleSelectSubtopic}
                  />
                </div>
              </div>

              <div className="lg:w-3/4">
                <ActivityContent
                  subtopic={selectedSubtopic}
                  onMarkComplete={handleMarkComplete}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
