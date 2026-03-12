import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI } from '../services/api';

function UnifiedLogin({ onLogin }) {
  const [loginType, setLoginType] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginType) {
      alert('Please select login type');
      return;
    }

    // Admin login (hardcoded for security)
    if (loginType === 'admin') {
      if (email === 'admin@healthcare.com' && password === 'admin123') {
        onLogin('admin');
        navigate('/admin/dashboard');
      } else {
        alert('❌ Invalid admin credentials');
        return;
      }
    }

    // Doctor and Patient login - Call backend API with Supabase
    if (loginType === 'doctor' || loginType === 'patient') {
      setLoading(true);
      try {
        const response = await userAPI.login(email, password, loginType);
        
        if (response.data && response.data.user) {
          const user = response.data.user;
          
          // Login successful - store user info
          console.log(`✅ ${loginType} login successful:`, user.name);
          
          // Store user info in localStorage
          localStorage.setItem('userEmail', user.email);
          localStorage.setItem('userName', user.name);
          localStorage.setItem('userRole', loginType);
          localStorage.setItem('userId', user.id);
          localStorage.setItem('isAuthenticated', 'true');
          if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
          }
          
          onLogin(loginType);
          navigate(loginType === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
        
        // Handle different error scenarios
        const errorMessage = error.response?.data?.error || error.message;
        
        if (errorMessage.includes('not found') || errorMessage.includes('not approved')) {
          alert(`❌ ${loginType === 'doctor' ? 'Doctor' : 'Patient'} account not found or not approved. Please register first.`);
        } else if (errorMessage.includes('Invalid credentials')) {
          alert('❌ Incorrect email or password');
        } else if (errorMessage.includes('not approved yet')) {
          alert('⏳ Your account is pending approval. Please wait for admin approval.');
        } else {
          alert(`❌ Login failed: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="unified-login-container">
      <div className="login-card">
        <h1>⚕️ AI Healthcare System</h1>
        <p className="subtitle">Select your role to continue</p>

        {!loginType ? (
          <>
            <div className="role-selection">
              <button
                className="role-button doctor-role"
                onClick={() => setLoginType('doctor')}
              >
                <span className="role-icon">👨‍⚕️</span>
                <span className="role-text">Doctor Login</span>
              </button>
              <button
                className="role-button patient-role"
                onClick={() => setLoginType('patient')}
              >
                <span className="role-icon">👤</span>
                <span className="role-text">Patient Login</span>
              </button>
              <button
                className="role-button admin-role"
                onClick={() => setLoginType('admin')}
              >
                <span className="role-icon">⚙️</span>
                <span className="role-text">Admin Login</span>
              </button>
            </div>

            <div className="registration-section">
              <p className="registration-text">New here?</p>
              <Link to="/register" className="register-link">
                📝 Create an account
              </Link>
            </div>
          </>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <div className="role-header">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setLoginType(null);
                  setEmail('');
                  setPassword('');
                }}
              >
                ← Back
              </button>
              <h2>
                {loginType === 'doctor' ? 'Doctor' : loginType === 'patient' ? 'Patient' : 'Admin'} Login
              </h2>
            </div>

            {loginType === 'admin' && (
              <div className="admin-demo-info">
                <p>📌 Demo Admin Credentials:</p>
                <p><strong>Email:</strong> admin@healthcare.com</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
            )}

            {loginType === 'doctor' && (
              <div className="admin-demo-info">
                <p>📌 Demo Doctor Credentials:</p>
                <p><strong>Email:</strong> doctor@hospital.com</p>
                <p><strong>Password:</strong> doctor123</p>
              </div>
            )}

            {loginType === 'patient' && (
              <div className="admin-demo-info">
                <p>📌 Demo Patient Credentials:</p>
                <p><strong>Email:</strong> patient@email.com</p>
                <p><strong>Password:</strong> patient123</p>
              </div>
            )}

            <div className="restriction-notice">
              <p>⚠️ <strong>Important:</strong> Only registered and admin-approved users can login.</p>
              {loginType !== 'admin' && <p>Register an account and wait for admin approval to access the system.</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? '⏳ Logging in...' : 'Login'}
            </button>

            {loginType !== 'admin' && (
              <div className="signup-link">
                Don't have an account? <Link to="/register">Sign up here</Link>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default UnifiedLogin;
