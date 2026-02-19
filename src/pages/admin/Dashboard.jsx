import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ROOT } from '../../lib/apiConfig';


const AdminDashboard = () => {
  const { session, authenticated } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authenticated || !session?.access_token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    fetchAnalytics();
  }, [authenticated, session]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ROOT}/api/admin/analytics/overview?period=7d`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Admin access required');
        } else {
          setError(`Failed to load analytics: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(`Failed to load analytics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <h3 className="font-semibold">Access Denied</h3>
            <p className="mt-2">{error}</p>
            <p className="mt-2 text-sm">Contact administrator to grant admin access.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage users, view analytics, and track activity</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Users</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {analytics?.total_users || 0}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {analytics?.tier_breakdown && (
                <>
                  {analytics.tier_breakdown.free || 0} free, {analytics.tier_breakdown.pro || 0} pro,{' '}
                  {analytics.tier_breakdown.enterprise || 0} enterprise
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Active Users</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {analytics?.active_users || 0}
            </div>
            <div className="mt-2 text-sm text-gray-600">Last 7 days</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">New Users</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {analytics?.new_users || 0}
            </div>
            <div className="mt-2 text-sm text-gray-600">This period</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">API Requests</div>
            <div className="mt-2 text-3xl font-bold text-purple-600">
              {analytics?.total_requests?.toLocaleString() || 0}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {analytics?.requests_today || 0} today
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/users"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">Manage Users</div>
              <div className="text-sm text-gray-600 mt-1">View and manage user accounts</div>
            </a>
            <a
              href="/admin/analytics"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-600 mt-1">Detailed usage analytics</div>
            </a>
            <a
              href="/admin/activity"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">Activity Logs</div>
              <div className="text-sm text-gray-600 mt-1">View user activity and logs</div>
            </a>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">Activity logs will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;








