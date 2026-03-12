import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get pending users from API
      const pendingResponse = await userAPI.getPendingUsers();
      setPendingUsers(pendingResponse.data || []);

      // Get approved users from API
      const approvedResponse = await userAPI.getApprovedUsers();
      setApprovedUsers(approvedResponse.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error loading user data: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (userId) => {
    const user = pendingUsers.find(u => u.id === userId);
    if (!user) return;

    try {
      const response = await userAPI.approveUser(userId);
      if (response.data) {
        alert(`✅ ${user.name} approved successfully! They can now login.`);
        loadData(); // Reload the data
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user: ' + (error.response?.data?.error || error.message));
    }
  };

  const rejectRegistration = async (userId) => {
    const user = pendingUsers.find(u => u.id === userId);
    if (!user) return;

    if (!window.confirm('Are you sure you want to reject this registration?')) return;

    try {
      const response = await userAPI.rejectUser(userId);
      if (response.data) {
        alert(`❌ ${user.name} rejected.`);
        loadData(); // Reload the data
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting user: ' + (error.response?.data?.error || error.message));
    }
  };

  const removeUser = async (userId) => {
    const user = approvedUsers.find(u => u.id === userId);
    if (!user) return;

    if (!window.confirm('Are you sure you want to remove this user?')) return;

    try {
      const response = await userAPI.deleteUser(userId);
      if (response.data || response.status === 200) {
        alert(`👤 ${user.name} removed from system`);
        loadData(); // Reload the data
      }
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Error removing user: ' + (error.response?.data?.error || error.message));
    }
  };

  const filterData = (data) => {
    return data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || item.role === filterType;
      return matchesSearch && matchesFilter;
    });
  };

  const pendingCount = pendingUsers.length;
  const doctorCount = approvedUsers.filter(u => u.role === 'doctor').length;
  const patientCount = approvedUsers.filter(u => u.role === 'patient').length;

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Manage system users and registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card pending">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Pending Registrations</h3>
            <p className="stat-number">{pendingCount}</p>
          </div>
        </div>

        <div className="stat-card doctor">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>Approved Doctors</h3>
            <p className="stat-number">{doctorCount}</p>
          </div>
        </div>

        <div className="stat-card patient">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Approved Patients</h3>
            <p className="stat-number">{patientCount}</p>
          </div>
        </div>

        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{doctorCount + patientCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          📋 Pending Registrations ({pendingCount})
        </button>
        <button
          className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          ✅ Approved Users ({doctorCount + patientCount})
        </button>
      </div>

      {/* Search & Filter */}
      <div className="admin-controls">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="doctor">Doctors Only</option>
          <option value="patient">Patients Only</option>
        </select>
      </div>

      {/* Content */}
      <div className="admin-content">
        {loading ? (
          <div className="loading">Loading user data...</div>
        ) : activeTab === 'pending' ? (
          <div className="pending-section">
            <h2>Pending Registrations</h2>
            {filterData(pendingUsers).length === 0 ? (
              <div className="empty-state">
                <p>No pending registrations</p>
              </div>
            ) : (
              <div className="registrations-table">
                {filterData(pendingUsers).map(user => (
                  <div key={user.id} className="registration-item">
                    <div className="reg-header">
                      <div className="reg-type-badge">
                        {user.role === 'doctor' ? '👨‍⚕️ Doctor' : '👤 Patient'}
                      </div>
                      <div className="reg-date">
                        Applied: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="reg-details">
                      <div className="detail-row">
                        <span className="label">Name:</span>
                        <span className="value">{user.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Email:</span>
                        <span className="value">{user.email}</span>
                      </div>
                      {user.phone_number && (
                        <div className="detail-row">
                          <span className="label">Phone:</span>
                          <span className="value">{user.phone_number}</span>
                        </div>
                      )}

                      {user.role === 'doctor' && (
                        <>
                          {user.specialization && (
                            <div className="detail-row">
                              <span className="label">Specialization:</span>
                              <span className="value">{user.specialization}</span>
                            </div>
                          )}
                          {user.license_number && (
                            <div className="detail-row">
                              <span className="label">License:</span>
                              <span className="value">{user.license_number}</span>
                            </div>
                          )}
                        </>
                      )}

                      {user.role === 'patient' && (
                        <>
                          {user.age && (
                            <div className="detail-row">
                              <span className="label">Age:</span>
                              <span className="value">{user.age}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="reg-actions">
                      <button
                        className="btn-approve"
                        onClick={() => approveRegistration(user.id)}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => rejectRegistration(user.id)}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="approved-section">
            <h2>Approved Users</h2>
            {filterData(approvedUsers).length === 0 ? (
              <div className="empty-state">
                <p>No approved users yet</p>
              </div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Details</th>
                      <th>Approved</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterData(approvedUsers).map(user => (
                      <tr key={user.id}>
                        <td>
                          <span className="type-badge">
                            {user.role === 'doctor' ? '👨‍⚕️ Doctor' : '👤 Patient'}
                          </span>
                        </td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone_number || 'N/A'}</td>
                        <td>
                          {user.role === 'doctor'
                            ? `${user.specialization || 'N/A'}`
                            : `${user.age || 'N/A'} yrs`}
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn-remove"
                            onClick={() => removeUser(user.id)}
                          >
                            🗑️ Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
