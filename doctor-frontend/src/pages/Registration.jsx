import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

function Registration() {
  const navigate = useNavigate();
  const [registrationType, setRegistrationType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    license: '',
    phone: '',
    address: '',
    age: '',
    bloodType: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (registrationType === 'doctor') {
      if (!formData.specialization.trim()) {
        newErrors.specialization = 'Specialization is required';
      }
      if (!formData.license.trim()) {
        newErrors.license = 'Medical license number is required';
      }
    }

    if (registrationType === 'patient') {
      if (!formData.age.trim()) {
        newErrors.age = 'Age is required';
      }
      if (!formData.bloodType.trim()) {
        newErrors.bloodType = 'Blood type is required';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        // Prepare registration data for API
        const registrationData = {
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
          role: registrationType,
          phone_number: formData.phone,
          ...(registrationType === 'doctor' && {
            specialization: formData.specialization,
            license_number: formData.license,
          }),
          ...(registrationType === 'patient' && {
            age: parseInt(formData.age),
          }),
        };

        // Call backend API to register user
        const response = await userAPI.register(registrationData);
        
        if (response.data) {
          console.log('✅ Registration successful:', response.data);
          setSubmitted(true);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.error || error.message;
        alert(`❌ Registration failed: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  if (submitted) {
    return (
      <div className="registration-success">
        <div className="success-card">
          <h1>✅ Registration Successful!</h1>
          <p>Your account has been created successfully.</p>
          <p className="status-text">Status: <strong>Pending Admin Approval</strong></p>
          <p className="info-text">An admin will review your registration and activate your account shortly.</p>
          <p className="redirect-text">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!registrationType) {
    return (
      <div className="registration-container">
        <div className="registration-header">
          <h1>⚕️ Create Your Account</h1>
          <p>Join our AI-powered healthcare system</p>
        </div>

        <div className="role-selection">
          <div className="role-card" onClick={() => setRegistrationType('doctor')}>
            <div className="role-icon">👨‍⚕️</div>
            <h2>Doctor Registration</h2>
            <p>Join as a healthcare professional</p>
            <ul className="role-benefits">
              <li>✓ Manage patient appointments</li>
              <li>✓ Access patient summaries</li>
              <li>✓ Digital whiteboard</li>
              <li>✓ Prescription management</li>
            </ul>
          </div>

          <div className="role-card" onClick={() => setRegistrationType('patient')}>
            <div className="role-icon">👤</div>
            <h2>Patient Registration</h2>
            <p>Register for healthcare services</p>
            <ul className="role-benefits">
              <li>✓ Book appointments</li>
              <li>✓ Voice symptom recording</li>
              <li>✓ Health records</li>
              <li>✓ Prescription access</li>
            </ul>
          </div>
        </div>

        <div className="registration-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-form-wrapper">
        <div className="registration-header">
          <button className="back-btn" onClick={() => setRegistrationType(null)}>← Back</button>
          <h1>{registrationType === 'doctor' ? '👨‍⚕️ Doctor Registration' : '👤 Patient Registration'}</h1>
        </div>

        <form className="registration-form" onSubmit={handleSubmit}>
          {/* Common Fields */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter a strong password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
            />
          </div>

          {/* Doctor-specific Fields */}
          {registrationType === 'doctor' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Specialization *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={errors.specialization ? 'error' : ''}
                  >
                    <option value="">Select a specialization</option>
                    <option value="General Practice">General Practice</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                  {errors.specialization && <span className="error-text">{errors.specialization}</span>}
                </div>

                <div className="form-group">
                  <label>Medical License Number *</label>
                  <input
                    type="text"
                    name="license"
                    value={formData.license}
                    onChange={handleInputChange}
                    placeholder="Enter your medical license number"
                    className={errors.license ? 'error' : ''}
                  />
                  {errors.license && <span className="error-text">{errors.license}</span>}
                </div>
              </div>
            </>
          )}

          {/* Patient-specific Fields */}
          {registrationType === 'patient' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    className={errors.age ? 'error' : ''}
                  />
                  {errors.age && <span className="error-text">{errors.age}</span>}
                </div>

                <div className="form-group">
                  <label>Blood Type *</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className={errors.bloodType ? 'error' : ''}
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {errors.bloodType && <span className="error-text">{errors.bloodType}</span>}
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="registration-submit-btn"
            disabled={loading}
          >
            {loading ? '⏳ Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="registration-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
}

export default Registration;
