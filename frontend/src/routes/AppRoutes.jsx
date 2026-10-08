import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

// Pages
import { LoginPage } from '../pages/Login/LoginPage.jsx';
import { DashboardPage } from '../pages/Dashboard/DashboardPage.jsx';
import { CustomerListPage } from '../pages/Customers/CustomerListPage.jsx';
import { CustomerDetailPage } from '../pages/Customers/CustomerDetailPage.jsx';
import { LeadListPage } from '../pages/Leads/LeadListPage.jsx';
import { LeadDetailPage } from '../pages/Leads/LeadDetailPage.jsx';
import { OpportunityListPage } from '../pages/Opportunities/OpportunityListPage.jsx';
import { OpportunityDetailPage } from '../pages/Opportunities/OpportunityDetailPage.jsx';
import { FollowUpListPage } from '../pages/FollowUps/FollowUpListPage.jsx';
import { ActivityListPage } from '../pages/Activities/ActivityListPage.jsx';
import { UserListPage } from '../pages/Users/UserListPage.jsx';
import { ReportsPage } from '../pages/Reports/ReportsPage.jsx';
import { AuditLogsPage } from '../pages/AuditLogs/AuditLogsPage.jsx';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes inside Main Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Customers */}
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />

          {/* Leads */}
          <Route path="/leads" element={<LeadListPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />

          {/* Opportunities */}
          <Route path="/opportunities" element={<OpportunityListPage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />

          {/* Follow-Ups */}
          <Route path="/followups" element={<FollowUpListPage />} />

          {/* Activities */}
          <Route path="/activities" element={<ActivityListPage />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/users" element={<UserListPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* 404 Inside Layout */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
