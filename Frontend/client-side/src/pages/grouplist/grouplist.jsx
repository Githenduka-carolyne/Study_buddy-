import React, { useState, useEffect } from "react";

const GroupList = ({ user }) => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:5001/groups", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }

        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error.message);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div>
      <h2>Study Groups</h2>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            {group.name} - {group.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
