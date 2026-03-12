const supabase = require('../config/supabase');

// Create voice recording
exports.createVoiceRecording = async (req, res) => {
  try {
    const { patient_id, appointment_id, transcript, symptoms, duration, severity, possible_diagnosis, recommended_specialist, risk_level, vitals, audio_url } = req.body;

    if (!patient_id || !transcript) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('voice_recordings')
      .insert([{
        patient_id,
        appointment_id,
        transcript,
        symptoms: symptoms || [],
        duration,
        severity,
        possible_diagnosis,
        recommended_specialist,
        risk_level: risk_level || 'low',
        vitals: vitals || {},
        audio_url
      }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Voice recording created successfully',
      recording: data[0]
    });
  } catch (error) {
    console.error('Error creating voice recording:', error);
    res.status(500).json({ error: 'Failed to create voice recording' });
  }
};

// Get all voice recordings
exports.getAllVoiceRecordings = async (req, res) => {
  try {
    const { patient_id, appointment_id } = req.query;
    let query = supabase.from('voice_recordings').select('*');

    if (patient_id) query = query.eq('patient_id', patient_id);
    if (appointment_id) query = query.eq('appointment_id', appointment_id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching voice recordings:', error);
    res.status(500).json({ error: 'Failed to fetch voice recordings' });
  }
};

// Get voice recording by ID
exports.getVoiceRecordingById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('voice_recordings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Voice recording not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching voice recording:', error);
    res.status(500).json({ error: 'Failed to fetch voice recording' });
  }
};

// Get latest voice recording for patient
exports.getLatestVoiceRecording = async (req, res) => {
  try {
    const { patient_id } = req.params;

    const { data, error } = await supabase
      .from('voice_recordings')
      .select('*')
      .eq('patient_id', patient_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'No voice recordings found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching latest voice recording:', error);
    res.status(500).json({ error: 'Failed to fetch voice recording' });
  }
};

// Update voice recording
exports.updateVoiceRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('voice_recordings')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Voice recording not found' });
    }

    return res.status(200).json({
      message: 'Voice recording updated successfully',
      recording: data[0]
    });
  } catch (error) {
    console.error('Error updating voice recording:', error);
    res.status(500).json({ error: 'Failed to update voice recording' });
  }
};

// Delete voice recording
exports.deleteVoiceRecording = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('voice_recordings')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Voice recording deleted successfully' });
  } catch (error) {
    console.error('Error deleting voice recording:', error);
    res.status(500).json({ error: 'Failed to delete voice recording' });
  }
};
