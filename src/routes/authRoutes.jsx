/**
 * Authentication Routes
 * 
 * Public and protected authentication-related routes
 */

import React from 'react';
import { Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import AuthRedirect from '../components/AuthRedirect';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminDashboard from '../pages/admin/Dashboard';
import DSRRequest from '../pages/DSRRequest';

export const authRoutes = [
  // Public auth routes
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="signup" path="/signup" element={<Signup />} />,
  
  // Root redirect
  <Route key="root" path="/" element={<AuthRedirect />} />,
  
  // Protected routes
  <Route 
    key="admin-dashboard" 
    path="/admin/dashboard" 
    element={
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="dsr-request" 
    path="/dsr-request" 
    element={
      <ProtectedRoute>
        <DSRRequest />
      </ProtectedRoute>
    } 
  />,
];
