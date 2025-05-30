import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }
  
  const stats = [
    { name: 'Active Study Groups', value: '12', trend: '+2', color: 'text-green-500' },
    { name: 'Hours Studied', value: '48', trend: '+5', color: 'text-blue-500' },
    { name: 'Completed Sessions', value: '24', trend: '+3', color: 'text-purple-500' },
    { name: 'Upcoming Sessions', value: '3', trend: '0', color: 'text-gray-500' }
  ];

  const studyData = [
    { name: 'Mon', hours: 2 },
    { name: 'Tue', hours: 4 },
    { name: 'Wed', hours: 3 },
    { name: 'Thu', hours: 5 },
    { name: 'Fri', hours: 4 },
    { name: 'Sat', hours: 6 },
    { name: 'Sun', hours: 4 },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Advanced Mathematics Study Group',
      date: 'Today at 3:00 PM',
      type: 'Group Study',
      participants: 5,
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Physics Problem Solving',
      date: 'Tomorrow at 2:00 PM',
      type: 'Workshop',
      participants: 8,
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Computer Science Project Discussion',
      date: 'Feb 2nd at 4:00 PM',
      type: 'Project Meeting',
      participants: 4,
      status: 'pending'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Completed Python Programming Session',
      time: '2 hours ago',
      icon: '🎯',
      color: 'bg-green-100'
    },
    {
      id: 2,
      action: 'Joined Web Development Group',
      time: '5 hours ago',
      icon: '👥',
      color: 'bg-blue-100'
    },
    {
      id: 3,
      action: 'Submitted Assignment Review',
      time: 'Yesterday',
      icon: '📝',
      color: 'bg-purple-100'
    }
  ];

  const quickActions = [
    {
      id: 1,
      name: 'Create Study Group',
      icon: '👥',
      link: '/create-group',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      id: 2,
      name: 'Join Session',
      icon: '🎯',
      link: '/join-session',
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      id: 3,
      name: 'Schedule Meeting',
      icon: '📅',
      link: '/schedule',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      id: 4,
      name: 'Resource Library',
      icon: '📚',
      link: '/resources',
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name || "Student"}! 👋
              </h1>
              <p className="text-indigo-100 text-lg">
                Your learning journey continues. Here's your progress overview.
              </p>
            </div>
            <Link to="/profile">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                View Profile
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <span className={`${stat.color} text-sm font-semibold`}>
                  {stat.trend}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Study Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-6 lg:col-span-2"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Study Progress
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studyData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ fill: "#4f46e5" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  to={action.link}
                  className={`${action.color} rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:shadow-lg hover:-translate-y-1`}
                >
                  <span className="text-2xl mb-2">{action.icon}</span>
                  <span className="text-sm font-medium text-white text-center">
                    {action.name}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Events
              </h2>
              <Link
                to="/events"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="border-l-4 border-indigo-500 bg-gray-50 rounded-r-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{event.date}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      {event.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {event.participants} participants
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`${activity.color} p-3 rounded-full text-xl`}
                  >
                    {activity.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;