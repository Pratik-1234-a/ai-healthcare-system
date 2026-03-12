import React from 'react';
import { useNavigate } from 'react-router-dom';

function AccessDenied({ userRole }) {
  const navigate = useNavigate();

  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <h1>⛔ Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        
        <div className="user-info">
          <p>Logged in as: <strong>{userRole === 'doctor' ? 'Doctor' : 'Patient'}</strong></p>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate(userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')}
          >
            → Go to Dashboard
          </button>
          <button 
            className="btn-secondary"
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          >
            ← Login as Different User
          </button>
        </div>

        <div className="help-text">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
