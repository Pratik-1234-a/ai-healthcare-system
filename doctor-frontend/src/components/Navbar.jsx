import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar({ userRole, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    return userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to={getDashboardLink()} className="nav-logo">
          ⚕️ AI Healthcare System
        </Link>
        
        <div className="nav-links">
          {/* Role Badge */}
          <span className={`user-role-badge ${userRole}`}>
            {userRole === 'doctor' ? '👨‍⚕️ Doctor Portal' : userRole === 'patient' ? '👤 Patient Portal' : '⚙️ Admin Panel'}
          </span>
          
          {/* Admin Navigation */}
          {userRole === 'admin' && (
            <>
              <Link 
                to="/admin/dashboard" 
                className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
              >
                📊 Dashboard
              </Link>
              <div className="nav-divider"></div>
            </>
          )}
          
          {/* Doctor Navigation */}
          {userRole === 'doctor' && (
            <>
              <Link 
                to="/doctor/dashboard" 
                className={`nav-link ${isActive('/doctor/dashboard') ? 'active' : ''}`}
              >
                📊 Dashboard
              </Link>
              <Link 
                to="/doctor/appointments" 
                className={`nav-link ${isActive('/doctor/appointments') ? 'active' : ''}`}
              >
                📅 Appointments
              </Link>
              <Link 
                to="/doctor/whiteboard" 
                className={`nav-link ${isActive('/doctor/whiteboard') ? 'active' : ''}`}
              >
                📋 Whiteboard
              </Link>
              <div className="nav-divider"></div>
            </>
          )}

          {/* Patient Navigation */}
          {userRole === 'patient' && (
            <>
              <Link 
                to="/patient/dashboard" 
                className={`nav-link ${isActive('/patient/dashboard') ? 'active' : ''}`}
              >
                🏥 Dashboard
              </Link>
              <Link 
                to="/patient/book-appointment" 
                className={`nav-link ${isActive('/patient/book-appointment') ? 'active' : ''}`}
              >
                📅 Book Appointment
              </Link>
              <Link 
                to="/patient/my-appointments" 
                className={`nav-link ${isActive('/patient/my-appointments') ? 'active' : ''}`}
              >
                📋 My Appointments
              </Link>
              <div className="nav-divider"></div>
            </>
          )}
          
          {/* Logout Button */}
          <button className="logout-link" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
