import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import {
  UsersIcon,
  UserGroupIcon,
  BookOpenIcon,
  ClockIcon,
  ChartBarIcon,
//   CalendarIcon,
//   ChatOutlineIcon,
} from "@heroicons/react/24/outline";

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    userStats: {
      totalUsers: 0,
      newUsersThisMonth: 0,
      activeUsersToday: 0,
      userGrowth: [],
    },
    activityStats: {
      totalActivities: 0,
      completedActivities: 0,
      averageCompletionRate: 0,
      activityTypes: [],
    },
    groupStats: {
      totalGroups: 0,
      activeGroups: 0,
      averageGroupSize: 0,
      messageCount: 0,
    },
    timeStats: {
      averageSessionDuration: 0,
      peakUsageTimes: [],
      userRetention: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("month"); // 'week', 'month', 'year'

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/analytics?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render a stat card
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Analytics Dashboard
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              timeRange === "week"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              timeRange === "month"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              timeRange === "year"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* User Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          User Statistics
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={analytics.userStats.totalUsers}
            icon={UsersIcon}
            color="bg-blue-500"
          />
          <StatCard
            title="New Users"
            value={analytics.userStats.newUsersThisMonth}
            icon={UsersIcon}
            color="bg-green-500"
          />
          <StatCard
            title="Active Today"
            value={analytics.userStats.activeUsersToday}
            icon={UsersIcon}
            color="bg-indigo-500"
          />
          <StatCard
            title="Retention Rate"
            value={`${analytics.timeStats.userRetention}%`}
            icon={UsersIcon}
            color="bg-purple-500"
          />
        </div>

        {/* User Growth Chart (placeholder) */}
        <div className="mt-5 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            User Growth
          </h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">
              User growth chart would be displayed here
            </p>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Activity Statistics
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Activities"
            value={analytics.activityStats.totalActivities}
            icon={BookOpenIcon}
            color="bg-indigo-500"
          />
          <StatCard
            title="Completed Activities"
            value={analytics.activityStats.completedActivities}
            icon={BookOpenIcon}
            color="bg-green-500"
          />
          <StatCard
            title="Completion Rate"
            value={`${analytics.activityStats.averageCompletionRate}%`}
            icon={ChartBarIcon}
            color="bg-yellow-500"
          />
          <StatCard
            title="Avg. Session Duration"
            value={`${analytics.timeStats.averageSessionDuration} min`}
            // icon={ClockIcon}
            color="bg-red-500"
          />
        </div>

        {/* Activity Types Chart (placeholder) */}
        <div className="mt-5 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Activity Types Distribution
          </h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">
              Activity types chart would be displayed here
            </p>
          </div>
        </div>
      </div>

      {/* Group Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Group Statistics
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Groups"
            value={analytics.groupStats.totalGroups}
            icon={UserGroupIcon}
            color="bg-indigo-500"
          />
          <StatCard
            title="Active Groups"
            value={analytics.groupStats.activeGroups}
            icon={UserGroupIcon}
            color="bg-green-500"
          />
          <StatCard
            title="Avg. Group Size"
            value={analytics.groupStats.averageGroupSize}
            icon={UsersIcon}
            color="bg-yellow-500"
          />
          <StatCard
            title="Total Messages"
            value={analytics.groupStats.messageCount}
            // icon={ChatIcon}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Usage Patterns */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Usage Patterns
        </h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Peak Usage Times
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, index) => (
                <div key={day} className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-sm font-medium text-gray-700">{day}</p>
                  <div className="mt-2 h-24 bg-indigo-100 rounded relative overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-indigo-500"
                      style={{
                        height: `${
                          analytics.timeStats.peakUsageTimes[index] || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {analytics.timeStats.peakUsageTimes[index] || 0}%
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
