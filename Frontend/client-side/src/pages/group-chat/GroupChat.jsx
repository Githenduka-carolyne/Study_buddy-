import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // For fetching group ID from URL and navigation
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const GroupChat = () => {
  const { groupId } = useParams(); // Get the groupId from URL params
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const navigate = useNavigate(); // For navigation

  // Debugging: Log groupId to verify it's coming from the URL
  useEffect(() => {
    console.log("Group ID from useParams:", groupId); // Log the groupId

    if (groupId && !isNaN(Number(groupId))) {
      fetchMessages(); // Fetch messages if groupId is valid
    } else {
      console.error("Invalid group ID:", groupId); // Debugging invalid groupId
    }
  }, [groupId]); // Ensure this effect runs whenever groupId changes

  // Fetch messages for the given groupId
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to view messages");

      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error(`Failed to fetch messages: ${response.statusText}`);

      const data = await response.json();
      console.log("Fetched messages:", data); // Debugging: Log fetched messages
      setMessages(data); // Set the fetched messages in state
    } catch (error) {
      console.error("Error fetching messages:", error);
      alert(error.message); // Show an alert with the error message
    }
  };

  // Send a message to the group chat
  const sendMessage = async () => {
    if (!messageContent.trim()) {
      alert("Message content cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to send messages");

      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: messageContent }),
        }
      );

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
          alert(data.message || "Something went wrong!");
          return;
        }

        // Attach the current user info to the new message
        const newMessage = {
          ...data,
          user: user, // Attach the logged-in user
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]); // Add new message to state
        setMessageContent(""); // Clear the input field
        fetchMessages(); // Refresh messages after sending
      } else {
        const text = await response.text();
        alert("Error sending message: Received non-JSON response");
      }
    } catch (error) {
      alert(error.message || "An unexpected error occurred!");
    }
  };

  // Handle leaving the group
  const leaveGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to leave the group");

      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }), // Send userId to leave the group
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Error leaving group:", data);
        throw new Error(data.message || "Failed to leave group");
      }

      alert("You have successfully left the group.");
      navigate("/group-chat"); // Navigate back to the study groups page after leaving the group
    } catch (error) {
      console.error("Error leaving group:", error);
      alert(error.message || "An error occurred while leaving the group.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-xl font-bold">Group Chat</h1>
        <button
          onClick={leaveGroup}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Leave Group
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && <p>No messages yet...</p>}
        {messages.map((message) => (
          <div key={message.id} className="message">
            <strong>{message.user?.name || "Unknown User"}:</strong>{" "}
            {message.content}
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
        ></textarea>
        <button
          className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
