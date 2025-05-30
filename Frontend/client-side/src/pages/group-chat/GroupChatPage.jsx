import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { socket, connectSocket, emitMessage } from "../../utils/socket";
import { API_BASE_URL } from "../../config/api";

const GroupChat = ({ groupId: propGroupId, onLeaveGroup }) => {
  const { groupId: routeGroupId } = useParams(); // Get groupId from URL if available
  const groupId = propGroupId || routeGroupId; // Use prop if available, otherwise fallback to URL param
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!groupId || !user) return;

    async function checkMembership() {
      try {
        // Check if the user is a member of the group
        const response = await fetch(
          `${API_BASE_URL}/groups/${groupId}/membership-status`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();

        if (data.isMember) {
          // Connect socket and join room
          connectSocket(user.id);
          socket.emit("join_room", groupId);

          // Listen for incoming messages from socket
          socket.on("receive_message", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
          });

          // Fetch existing messages for the group
          const messageResponse = await fetch(
            `${API_BASE_URL}/groups/${groupId}/messages`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!messageResponse.ok) {
            throw new Error("Failed to fetch group messages");
          }

          const messageData = await messageResponse.json();

          // Ensure messageData is an array
          if (Array.isArray(messageData)) {
            setMessages(messageData);
          } else {
            console.error(
              "Expected an array of messages, received:",
              messageData
            );
            setMessages([]); // Set to empty array if not an array
          }
        } else {
          // If not a member, navigate to study groups page
          navigate("/study-groups");
        }
      } catch (error) {
        console.error("Error checking membership status:", error);
        navigate("/study-groups");
      }
    }

    checkMembership();

    return () => {
      // Cleanup socket connection when the component unmounts
      socket.off("receive_message");
      socket.emit("leave_room", groupId);
    };
  }, [groupId, user, navigate]);
// send message function
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage.trim(),
      userId: user.id,
      groupId,
      createdAt: new Date().toISOString(),
      user: { id: user.id, name: "You" },
    };

    // Emit the message to the server
    emitMessage(groupId, messageData);
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
  };

  const handleLeaveGroup = async () => {
    const confirmLeave = window.confirm(
      "Are you sure you want to leave this group?"
    );
    if (!confirmLeave) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token?.trim().replace(/['"]+/g, "")}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.message || "Failed to leave the group");
        } else {
          const text = await response.text();
          throw new Error(`Server error: ${text}`);
        }
      }

      alert("Successfully left the group");
      if (onLeaveGroup) onLeaveGroup(); // Call the callback if provided
      navigate("/study-groups");
    } catch (error) {
      console.error("Error leaving group:", error);
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-xl font-bold">Group Chat</h1>
        <button
          onClick={handleLeaveGroup}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Leave Group
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${
              msg.userId === user.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.userId === user.id
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <div className="text-sm font-semibold mb-1">
                {msg.userId === user.id ? "You" : msg.user?.name || "Unknown"}
              </div>
              <div>{msg.content}</div>
              <div className="text-xs mt-1 text-gray-500">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat;
