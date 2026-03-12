const supabase = require('../config/supabase');

// Create prescription
exports.createPrescription = async (req, res) => {
  try {
    const { appointment_id, doctor_id, patient_id, medicines, precautions, recommended_tests, follow_up_instructions, notes } = req.body;

    if (!appointment_id || !doctor_id || !patient_id || !medicines) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .insert([{
        appointment_id,
        doctor_id,
        patient_id,
        medicines,
        precautions,
        recommended_tests,
        follow_up_instructions,
        notes,
        status: 'created'
      }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Prescription created successfully',
      prescription: data[0]
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
};

// Get all prescriptions
exports.getAllPrescriptions = async (req, res) => {
  try {
    const { doctor_id, patient_id, appointment_id, status } = req.query;
    let query = supabase.from('prescriptions').select('*');

    if (doctor_id) query = query.eq('doctor_id', doctor_id);
    if (patient_id) query = query.eq('patient_id', patient_id);
    if (appointment_id) query = query.eq('appointment_id', appointment_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
};

// Get prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
};

// Update prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('prescriptions')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    return res.status(200).json({
      message: 'Prescription updated successfully',
      prescription: data[0]
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ error: 'Failed to update prescription' });
  }
};

// Send prescription via email
exports.sendPrescriptionEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // Get prescription
    const { data: prescription, error: fetchError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Update status to sent
    const { data, error } = await supabase
      .from('prescriptions')
      .update({ status: 'sent' })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // TODO: Send email using email service

    return res.status(200).json({
      message: 'Prescription sent successfully',
      prescription: data[0]
    });
  } catch (error) {
    console.error('Error sending prescription:', error);
    res.status(500).json({ error: 'Failed to send prescription' });
  }
};

// Delete prescription
exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
};
