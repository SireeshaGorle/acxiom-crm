import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div>
      <h5 className="fw-bold text-dark mb-3 text-center">Sign in to your account</h5>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label-custom" htmlFor="email">Email Address</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              id="email"
              type="email"
              className="form-control form-control-custom border-start-0"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label-custom" htmlFor="password">Password</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-lock"></i>
            </span>
            <input
              id="password"
              type="password"
              className="form-control form-control-custom border-start-0"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-in-right"></i>
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick Fill Box for Student/Reviewer Presentation */}
      <div className="mt-4 pt-3 border-top">
        <div className="text-muted small fw-bold text-uppercase mb-2 text-center" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
          <i className="bi bi-key-fill text-warning me-1"></i> Quick Demo Login
        </div>
        <div className="d-grid gap-1">
          <button
            type="button"
            className="btn btn-sm btn-outline-danger py-1 px-2 text-start d-flex justify-content-between align-items-center"
            onClick={() => handleQuickFill('admin@acxiomcrm.com', 'Admin@123456')}
          >
            <span><i className="bi bi-shield-lock-fill me-1"></i> <strong>Admin</strong> (Full Control)</span>
            <span className="small text-muted">admin@acxiomcrm.com</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-warning py-1 px-2 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => handleQuickFill('manager@acxiomcrm.com', 'Manager@123456')}
          >
            <span><i className="bi bi-person-badge-fill me-1"></i> <strong>Manager</strong> (Team Oversight)</span>
            <span className="small text-muted">manager@acxiomcrm.com</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-info py-1 px-2 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => handleQuickFill('sales@acxiomcrm.com', 'Sales@123456')}
          >
            <span><i className="bi bi-briefcase-fill me-1"></i> <strong>Sales Exec</strong> (Assigned Deals)</span>
            <span className="small text-muted">sales@acxiomcrm.com</span>
          </button>
        </div>
      </div>
    </div>
  );
};
