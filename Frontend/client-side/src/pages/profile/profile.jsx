import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-8 py-6">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-3xl">
                {user.name ? user.name[0].toUpperCase() : '?'}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-indigo-100">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-8 py-6">
            <div className="space-y-6">
              {/* Study Statistics */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Study Hours</p>
                    <p className="text-2xl font-bold text-gray-900">48</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Study Groups</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">Completed Python Programming Session</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">Joined Web Development Group</p>
                    <p className="text-sm text-gray-500">5 hours ago</p>
                  </div>
                </div>
              </section>

              {/* Achievements */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <span className="text-2xl mr-3">🏆</span>
                    <div>
                      <p className="text-gray-900 font-medium">Study Streak</p>
                      <p className="text-sm text-gray-500">7 days in a row</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <span className="text-2xl mr-3">⭐</span>
                    <div>
                      <p className="text-gray-900 font-medium">Top Contributor</p>
                      <p className="text-sm text-gray-500">In Python Group</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
