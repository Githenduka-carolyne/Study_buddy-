import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Pic1 from '../../assets/pic1.jpg';
import Pic2 from "../../assets/pic2.jpg";
import Pic3 from "../../assets/pic3.jpg";
import { StarIcon, UserGroupIcon, TrophyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const HostProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // This would typically come from an API, but for now we'll use static data
  const hosts = [
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
        { name: "Data Science Bootcamp", members: 15 }
      ],
      bio: "Passionate about helping others learn and grow in the tech industry. Specialized in web development and data science with 5+ years of teaching experience.",
      achievements: [
        "Best Mentor Award 2024",
        "100+ Students Mentored",
        "4.9 Average Rating"
      ],
      expertise: [
        { skill: "Web Development", level: 95 },
        { skill: "Data Science", level: 90 },
        { skill: "Teaching", level: 95 },
        { skill: "Project Management", level: 85 }
      ]
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
        { name: "Agile Methodologies", members: 8 }
      ],
      bio: "Dedicated to building strong, collaborative learning communities. Expert in project management and team building methodologies.",
      achievements: [
        "Community Leader Award",
        "50+ Teams Guided",
        "15 Successful Projects"
      ],
      expertise: [
        { skill: "Project Management", level: 95 },
        { skill: "Team Building", level: 90 },
        { skill: "Agile Methodologies", level: 85 },
        { skill: "Leadership", level: 90 }
      ]
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
        { name: "Cybersecurity Essentials", members: 10 }
      ],
      bio: "Technology enthusiast with a focus on AI, ML, and cybersecurity. Committed to making complex topics accessible to all learners.",
      achievements: [
        "Innovation in Teaching Award",
        "20+ AI Projects Guided",
        "Security Certification Mentor"
      ],
      expertise: [
        { skill: "Artificial Intelligence", level: 90 },
        { skill: "Machine Learning", level: 85 },
        { skill: "Cybersecurity", level: 95 },
        { skill: "Python Programming", level: 90 }
      ]
    }
  ];

  const host = hosts.find(h => h.id === parseInt(id));

  if (!host) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Host not found</h2>
          <button
            onClick={() => navigate('/tophost')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Top Hosts
          </button>
        </div>
      </div>
    );
  }

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
          <StarIcon key={`empty-${index}`} className="h-5 w-5 text-white opacity-50" />
        ))}
        <span className="ml-2 text-white font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/tophost')}
          className="mb-6 inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Top Hosts
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8">
            <div className="flex items-center">
              <img
                className="h-24 w-24 rounded-full object-cover border-4 border-white"
                src={host.avatar}
                alt={host.name}
              />
              <div className="ml-6 text-white">
                <h1 className="text-3xl font-bold">{host.name}</h1>
                <p className="text-xl opacity-90">{host.title}</p>
                <div className="mt-2">{renderRatingStars(host.rating)}</div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-8">
            {/* Bio Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{host.bio}</p>
            </section>

            {/* Statistics */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-6 w-6 text-indigo-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Groups</p>
                      <p className="text-lg font-semibold text-gray-900">{host.totalGroups}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrophyIcon className="h-6 w-6 text-indigo-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Active Groups</p>
                      <p className="text-lg font-semibold text-gray-900">{host.activeGroups}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Expertise */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Expertise</h2>
              <div className="space-y-4">
                {host.expertise.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">{item.skill}</span>
                      <span className="text-sm text-gray-500">{item.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {host.achievements.map((achievement, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <TrophyIcon className="h-6 w-6 text-yellow-500 mr-3" />
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Groups */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Groups</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {host.recentGroups.map((group, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.members} members</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostProfile;
