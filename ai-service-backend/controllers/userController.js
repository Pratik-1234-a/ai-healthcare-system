const supabase = require('../config/supabase');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { email, password, name, role, specialization, license_number, age, phone_number } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password (in production, use bcrypt)
    const password_hash = password; // TODO: use bcrypt

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash,
        name,
        role,
        specialization,
        license_number,
        age,
        phone_number,
        status: 'pending'
      }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'User registered successfully. Awaiting admin approval.',
      user: { id: data[0].id, email, name, role, status: 'pending' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Get all users with optional filters
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = supabase.from('users').select('*');

    if (role) query = query.eq('role', role);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Approve user (admin only)
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .update({ status: 'approved' })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'User approved successfully',
      user: data[0]
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// Reject user (admin only)
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'User rejected',
      user: data[0]
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find user by email and role
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', role)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials or user not found' });
    }

    // Verify password
    if (data.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is approved
    if (data.status !== 'approved') {
      return res.status(403).json({ error: 'Account not approved yet. Please wait for admin approval.' });
    }

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = data;

    return res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token: `token_${data.id}` // Simple token generation, use JWT in production
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get pending users (admin dashboard)
exports.getPendingUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
};

// Get approved users (admin dashboard)
exports.getApprovedUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching approved users:', error);
    res.status(500).json({ error: 'Failed to fetch approved users' });
  }
};
