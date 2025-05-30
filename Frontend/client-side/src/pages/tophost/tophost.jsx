import React, { useState } from 'react';
import { StarIcon, UserGroupIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Pic1 from "../../assets/pic1.jpg";
import Pic2 from "../../assets/pic2.jpg";
import Pic3 from "../../assets/pic3.jpg";

const tophost = () => {
  const [hosts] = useState([
    {
      id: 1,
      name: "Alice Smith",
      avatar: Pic2,
      title: "Expert Host",
      rating: 4.9,
      totalGroups: 20,
      activeGroups: 5,
      specialties: ["Web Development", "Data Science"],
      recentGroups: [
        { name: "React Basics", members: 10 },
        { name: "Data Science Bootcamp", members: 15 },
      ],
    },
    {
      id: 2,
      name: "John Doe",
      avatar: Pic1,
      title: "Community Builder",
      rating: 4.7,
      totalGroups: 15,
      activeGroups: 3,
      specialties: ["Project Management", "Team Building"],
      recentGroups: [
        { name: "Effective Teamwork", members: 12 },
        { name: "Agile Methodologies", members: 8 },
      ],
    },
    {
      id: 3,
      name: "Emily Johnson",
      avatar: Pic3,
      title: "Tech Enthusiast",
      rating: 4.8,
      totalGroups: 18,
      activeGroups: 4,
      specialties: ["AI & ML", "Cybersecurity"],
      recentGroups: [
        { name: "Intro to AI", members: 20 },
        { name: "Cybersecurity Essentials", members: 10 },
      ],
    },
  ]);

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, index) => (
          <StarIcon key={index} className="h-5 w-5 text-yellow-400" />
        ))}
        {hasHalfStar && <StarIcon className="h-5 w-5 text-yellow-400" />}
        {[...Array(5 - Math.ceil(rating))].map((_, index) => (
          <StarIcon key={`empty-${index}`} className="h-5 w-5 text-gray-300" />
        ))}
        <span className="ml-2 text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">
          Top Hosts
        </h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {hosts.map((host) => (
            <div
              key={host.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="px-6 py-8">
                <div className="flex items-center">
                  <img
                    className="h-16 w-16 rounded-full object-cover"
                    src={host.avatar}
                    alt={host.name}
                  />
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {host.name}
                    </h3>
                    <p className="text-gray-600">{host.title}</p>
                    {renderRatingStars(host.rating)}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-6 w-6 text-indigo-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">
                          Total Groups
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {host.totalGroups}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-6 w-6 text-green-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">
                          Active Groups
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {host.activeGroups}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900">
                    Specialties
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {host.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900">
                    Recent Groups
                  </h4>
                  <div className="mt-2 space-y-2">
                    {host.recentGroups.map((group, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                      >
                        <span className="text-gray-700">{group.name}</span>
                        <div className="flex items-center text-gray-500">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          <span>{group.members}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={`/tophost/${host.id}`}>
                    <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200">
                      View Full Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default tophost;
