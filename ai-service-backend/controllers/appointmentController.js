const supabase = require('../config/supabase');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctor_id, patient_id, appointment_date, reason_for_visit, risk_level } = req.body;

    if (!doctor_id || !patient_id || !appointment_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        doctor_id,
        patient_id,
        appointment_date,
        reason_for_visit,
        risk_level: risk_level || 'low',
        status: 'scheduled'
      }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Appointment created successfully',
      appointment: data[0]
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const { doctor_id, patient_id, status } = req.query;
    let query = supabase.from('appointments').select('*');

    if (doctor_id) query = query.eq('doctor_id', doctor_id);
    if (patient_id) query = query.eq('patient_id', patient_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('appointment_date', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Ensure voice_summary_url is included
    return res.status(200).json(data.map(appointment => ({
      ...appointment,
      voice_summary_url: appointment.voice_summary_url || null
    })));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    return res.status(200).json({
      message: 'Appointment updated successfully',
      appointment: data[0]
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    return res.status(200).json({
      message: 'Appointment cancelled successfully',
      appointment: data[0]
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};

// Complete appointment
exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'completed', notes })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    return res.status(200).json({
      message: 'Appointment completed successfully',
      appointment: data[0]
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};
