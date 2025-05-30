import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinedGroups, setJoinedGroups] = useState([]); // Store joined groups
  const { user } = useAuth();
  const navigate = useNavigate();

  // States for creating a new group
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetching available groups
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to view study groups");

      const response = await fetch(`${API_BASE_URL}/groups`, {
        headers: {
          Authorization: `Bearer ${token.trim().replace(/['"]+/g, "")}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch study groups");

      const data = await response.json();
      setGroups(data);

      // Fetch groups the user has already joined
      const userGroupsResponse = await fetch(`${API_BASE_URL}/groups/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userGroupsResponse.ok) {
        const userGroups = await userGroupsResponse.json();
        setJoinedGroups(userGroups.map((group) => group.id)); // Store joined group IDs
      }

      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to join a group
  const handleJoinGroup = async (groupId) => {
    if (joinedGroups.includes(groupId)) {
      alert("You are already a member of this group.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to join a study group");

      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId, userId: user?.id }),
      });

      if (!user?.id) {
        alert("User information is missing. Please log in again.");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        console.error("Join group response error:", data);
        throw new Error(data.message || "Failed to join group");
      }

      alert("Successfully joined the group");

      // Update state immediately to prevent duplicate joins
      setJoinedGroups((prevGroups) => [...prevGroups, groupId]);

      navigate(`/group-chat/${groupId}`); // Navigate to chat page after joining
    } catch (error) {
      console.error("Error joining group:", error);
      alert(error.message);
      setError(error.message);
    }
  };

  const handleGoToChat = (groupId) => {
    // Navigate to the group chat if the user is part of the group
    if (joinedGroups.includes(groupId)) {
      navigate(`/group-chat/${groupId}`);
    } else {
      alert("You must join the group before you can access the chat.");
    }
  };

  // Handle create group form submission
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!newGroupName || !newGroupDescription) {
      alert("Please fill in both fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to create a group");

      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Error creating group:", data);
        throw new Error(data.message || "Failed to create group");
      }

      alert("Group created successfully!");
      setIsCreatingGroup(false); // Close the form after submission
      fetchGroups(); // Refresh the list of groups
    } catch (error) {
      console.error("Error creating group:", error);
      alert(error.message);
      setError(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view study groups</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Study Groups</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCreatingGroup(true)}
            className="flex bg-green-500 text-white px-4 py-2 rounded"
          >
            <PlusIcon className="h-6 w-6" />
            Add Group
          </button>
        </div>
      </div>

      {isCreatingGroup && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Create New Study Group</h3>
          <form onSubmit={handleCreateGroup}>
            <div className="mb-4">
              <label
                htmlFor="groupName"
                className="block text-sm font-medium text-gray-700"
              >
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="groupDescription"
                className="block text-sm font-medium text-gray-700"
              >
                Group Description
              </label>
              <textarea
                id="groupDescription"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create Group
            </button>
          </form>
        </div>
      )}

      {error && <div className="text-red-500">{error}</div>}

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <p>{group.description}</p>
            {joinedGroups.includes(group.id) ? (
              <div className="flex justify-between items-center">
                <button
                  className="bg-gray-300 text-white px-4 py-2 rounded mt-2"
                  disabled
                >
                  Joined
                </button>
                <button
                  onClick={() => handleGoToChat(group.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                >
                  Go to Chat
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleJoinGroup(group.id)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Join
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyGroups;
