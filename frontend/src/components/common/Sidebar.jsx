import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export const Sidebar = ({ isOpen, onClose }) => {
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const isManagerOrAdmin = hasRole('ADMIN', 'MANAGER');

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
    { to: '/customers', label: 'Customers', icon: 'bi-buildings-fill' },
    { to: '/leads', label: 'Leads', icon: 'bi-person-lines-fill' },
    { to: '/opportunities', label: 'Opportunities', icon: 'bi-cash-coin' },
    { to: '/followups', label: 'Follow-Ups', icon: 'bi-calendar-check-fill' },
    { to: '/activities', label: 'Activities', icon: 'bi-activity' },
    { to: '/reports', label: 'Reports', icon: 'bi-bar-chart-line-fill' }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop d-lg-none" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-logo-text" onClick={onClose}>
            <i className="bi bi-diagram-3-fill text-primary"></i>
            <span>ACXIOM</span>CRM
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Navigation</div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <i className={`bi ${link.icon}`}></i>
              <span>{link.label}</span>
            </NavLink>
          ))}

          {/* Admin / Management Section */}
          {isAdmin && (
            <>
              <div className="nav-section-title mt-3">Administration</div>
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <i className="bi bi-people-fill"></i>
                <span>Users & Roles</span>
              </NavLink>
              <NavLink
                to="/audit-logs"
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <i className="bi bi-shield-lock-fill"></i>
                <span>Audit Logs</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-person-circle fs-4 text-light"></i>
            <div className="overflow-hidden">
              <div className="text-white small fw-bold text-truncate">{user?.email}</div>
              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                Role: <span className="text-info fw-semibold">{typeof user?.role === 'object' ? user?.role.name : user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
