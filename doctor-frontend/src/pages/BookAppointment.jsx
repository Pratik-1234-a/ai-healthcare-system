import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function BookAppointment() {
  const navigate = useNavigate();

  // Step management: 1 = Select Doctor, 2 = Record Symptoms, 3 = Review & Confirm
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specialization, setSpecialization] = useState('');

  // Step 2 state – Voice recorder
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Step 3 state – Date/time & booking
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [specialization, allDoctors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // ─── Step 1: Doctor Selection ─────────────────────────────────────────

  const loadDoctors = () => {
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    const approvedDoctors = approvedUsers.filter(user => user.type === 'doctor');

    const doctorsWithDetails = approvedDoctors.map((doctor, index) => ({
      id: doctor.id,
      name: doctor.fullName || doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
      license: doctor.license,
      yearsOfExperience: Math.floor(Math.random() * 20) + 1,
      rating: (Math.random() * 2 + 3).toFixed(1),
      availableSlots: Math.floor(Math.random() * 8) + 2
    }));

    setAllDoctors(doctorsWithDetails);
    filterDoctorsBySpecialization(doctorsWithDetails, '');
  };

  const filterDoctors = () => {
    filterDoctorsBySpecialization(allDoctors, specialization);
  };

  const filterDoctorsBySpecialization = (doctorsList, specializationFilter) => {
    if (!specializationFilter) {
      setDoctors(doctorsList);
    } else {
      const filtered = doctorsList.filter(doc =>
        doc.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
      );
      setDoctors(filtered);
    }
  };

  // ─── Step 2: Voice Recording with Web Speech API ──────────────────────

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    finalTranscriptRef.current = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalText) {
        finalTranscriptRef.current = finalText.trim();
      }

      // Show live preview: final + interim
      const liveText = (finalTranscriptRef.current + ' ' + interimTranscript).trim();
      setLiveTranscript(liveText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // Save the final transcript
      if (finalTranscriptRef.current) {
        setTranscript(finalTranscriptRef.current);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
      setLiveTranscript('');
      setAiSummary(null);
      finalTranscriptRef.current = '';

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      visualizeAudio(stream);

      // Start live speech recognition
      startSpeechRecognition();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const visualizeAudio = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Dark gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, width, 0);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const hue = (i / dataArray.length) * 200 + 160;
        ctx.fillStyle = `hsla(${hue}, 90%, 60%, 0.85)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    // Stop speech recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };

  // ─── Dynamic Symptom Analysis (runs on real transcript) ───────────────

  const analyzeTranscript = (text) => {
    const lower = text.toLowerCase();

    // ── Symptom Detection ──
    const symptomKeywords = {
      'Headache': ['headache', 'head pain', 'head hurts', 'migraine', 'head ache'],
      'Nausea': ['nausea', 'nauseous', 'feel sick', 'vomiting', 'throw up', 'queasy'],
      'Fever': ['fever', 'temperature', 'hot', 'chills', 'feverish'],
      'Chest Pain': ['chest pain', 'chest hurts', 'chest tightness', 'pressure in chest'],
      'Back Pain': ['back pain', 'back hurts', 'lower back', 'upper back', 'spine'],
      'Cough': ['cough', 'coughing', 'dry cough', 'wet cough', 'phlegm'],
      'Fatigue': ['tired', 'fatigue', 'exhausted', 'no energy', 'weak', 'weakness', 'lethargic'],
      'Dizziness': ['dizzy', 'dizziness', 'lightheaded', 'vertigo', 'spinning'],
      'Sore Throat': ['sore throat', 'throat hurts', 'throat pain', 'difficulty swallowing'],
      'Shortness of Breath': ['shortness of breath', 'can\'t breathe', 'breathing difficulty', 'breathless', 'breath'],
      'Joint Pain': ['joint pain', 'joints hurt', 'stiff joints', 'arthritis', 'knee pain', 'shoulder pain'],
      'Stomach Pain': ['stomach pain', 'stomach hurts', 'abdominal pain', 'belly pain', 'cramps'],
      'Insomnia': ['insomnia', 'can\'t sleep', 'trouble sleeping', 'sleepless', 'not sleeping'],
      'Anxiety': ['anxiety', 'anxious', 'panic', 'worried', 'stress', 'nervous'],
      'Skin Rash': ['rash', 'skin', 'itching', 'itchy', 'hives', 'irritation'],
      'Photophobia': ['light sensitive', 'light-sensitive', 'photophobia', 'bright light'],
      'Blurred Vision': ['blurred vision', 'blurry', 'vision problems', 'can\'t see clearly'],
      'Numbness': ['numb', 'numbness', 'tingling', 'pins and needles'],
      'Swelling': ['swelling', 'swollen', 'inflammation', 'inflamed'],
      'Loss of Appetite': ['no appetite', 'not eating', 'loss of appetite', 'don\'t feel like eating']
    };

    const detectedSymptoms = [];
    for (const [symptom, keywords] of Object.entries(symptomKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        detectedSymptoms.push(symptom);
      }
    }
    if (detectedSymptoms.length === 0) {
      detectedSymptoms.push('General Discomfort');
    }

    // ── Duration Detection ──
    const durationPatterns = [
      /(\d+)\s*(day|days)/i,
      /(\d+)\s*(week|weeks)/i,
      /(\d+)\s*(month|months)/i,
      /(\d+)\s*(hour|hours)/i,
      /(since|from)\s+(yesterday|last\s+\w+|this\s+morning)/i,
      /(few|couple|several)\s*(days|weeks|hours)/i
    ];
    let duration = 'Not specified';
    for (const pat of durationPatterns) {
      const match = lower.match(pat);
      if (match) {
        duration = match[0].charAt(0).toUpperCase() + match[0].slice(1);
        break;
      }
    }

    // ── Severity Detection ──
    let severity = 'Moderate';
    const severeWords = ['severe', 'extreme', 'unbearable', 'worst', 'terrible', 'intense', 'excruciating', 'constant', 'sharp'];
    const mildWords = ['mild', 'slight', 'minor', 'little', 'small', 'occasional'];
    if (severeWords.some(w => lower.includes(w))) severity = 'Severe';
    else if (mildWords.some(w => lower.includes(w))) severity = 'Mild';

    // ── Risk Level ──
    let riskLevel = 'Low';
    const highRiskIndicators = ['chest pain', 'can\'t breathe', 'shortness of breath', 'severe', 'blood', 'bleeding', 'unconscious', 'fainted', 'numbness'];
    const medRiskIndicators = ['fever', 'vomiting', 'persistent', 'constant', 'worsening', 'worse', 'days', 'week', 'moderate'];
    const highCount = highRiskIndicators.filter(w => lower.includes(w)).length;
    const medCount = medRiskIndicators.filter(w => lower.includes(w)).length;
    if (highCount >= 2 || detectedSymptoms.length >= 5) riskLevel = 'High';
    else if (highCount >= 1 || medCount >= 2 || detectedSymptoms.length >= 3) riskLevel = 'Medium';

    // ── Possible Diagnoses ──
    const diagnosisMap = {
      'Headache': ['Tension headache', 'Migraine', 'Cluster headache'],
      'Chest Pain': ['Angina', 'Costochondritis', 'Acid reflux'],
      'Cough': ['Upper respiratory infection', 'Bronchitis', 'Allergies'],
      'Fever': ['Viral infection', 'Flu', 'Bacterial infection'],
      'Stomach Pain': ['Gastritis', 'Food poisoning', 'IBS'],
      'Joint Pain': ['Osteoarthritis', 'Tendinitis', 'Bursitis'],
      'Back Pain': ['Muscle strain', 'Herniated disc', 'Sciatica'],
      'Anxiety': ['Generalized anxiety disorder', 'Panic disorder', 'Stress-related condition'],
      'Skin Rash': ['Contact dermatitis', 'Eczema', 'Allergic reaction'],
      'Dizziness': ['Vertigo', 'Low blood pressure', 'Inner ear disorder']
    };
    const possibleDiagnosis = [];
    for (const symptom of detectedSymptoms) {
      if (diagnosisMap[symptom]) {
        possibleDiagnosis.push(...diagnosisMap[symptom]);
      }
    }
    const uniqueDiagnoses = [...new Set(possibleDiagnosis)].slice(0, 4);
    if (uniqueDiagnoses.length === 0) uniqueDiagnoses.push('Further evaluation needed');

    // ── Recommended Specialist ──
    const specialistMap = {
      'Headache': 'Neurologist',
      'Chest Pain': 'Cardiologist',
      'Back Pain': 'Orthopedist',
      'Joint Pain': 'Orthopedist / Rheumatologist',
      'Stomach Pain': 'Gastroenterologist',
      'Skin Rash': 'Dermatologist',
      'Anxiety': 'Psychiatrist',
      'Shortness of Breath': 'Pulmonologist',
      'Blurred Vision': 'Ophthalmologist',
      'Dizziness': 'ENT Specialist',
      'Sore Throat': 'ENT Specialist'
    };
    let recommendedSpecialist = 'General Practitioner';
    for (const symptom of detectedSymptoms) {
      if (specialistMap[symptom]) {
        recommendedSpecialist = specialistMap[symptom];
        break;
      }
    }

    // ── Generate Summary Text ──
    const symptomsStr = detectedSymptoms.join(', ').toLowerCase();
    const summaryText = `Patient reports ${symptomsStr} with ${severity.toLowerCase()} intensity. ${
      duration !== 'Not specified' ? `Symptoms have persisted for ${duration.toLowerCase()}.` : 'Duration was not clearly specified.'
    } Based on reported symptoms, the condition is assessed as ${riskLevel.toLowerCase()} risk. ${
      uniqueDiagnoses.length > 0 ? `Possible conditions include ${uniqueDiagnoses.join(', ')}.` : ''
    } Consultation with a ${recommendedSpecialist} is recommended.`;

    return {
      summary: summaryText,
      symptoms: detectedSymptoms,
      duration,
      severity,
      possibleDiagnosis: uniqueDiagnoses,
      recommendedSpecialist,
      riskLevel,
      vitals: {
        bloodPressure: 'To be measured',
        temperature: 'To be measured',
        respirationRate: 'To be measured'
      },
      timestamp: new Date().toISOString()
    };
  };

  const handleProcessRecording = async () => {
    if (!recordedAudio) return;

    setIsProcessing(true);
    try {
      // Use the real transcript from Web Speech API
      const realTranscript = transcript || liveTranscript || finalTranscriptRef.current;

      if (!realTranscript || realTranscript.trim().length === 0) {
        alert('No speech was detected. Please try recording again and speak clearly into your microphone.');
        setIsProcessing(false);
        return;
      }

      setTranscript(realTranscript);

      // Simulate a brief analysis delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Analyze the REAL transcript dynamically
      const analysisResult = analyzeTranscript(realTranscript);
      setAiSummary(analysisResult);
    } catch (error) {
      console.error('Error processing recording:', error);
      alert('Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDiscardRecording = () => {
    setRecordedAudio(null);
    setTranscript('');
    setLiveTranscript('');
    setAiSummary(null);
    setRecordingTime(0);
    finalTranscriptRef.current = '';
  };

  // ─── Step 3: Confirm & Book ───────────────────────────────────────────

  const handleBookAppointment = () => {
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      alert('Please select a date and time');
      return;
    }

    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const newAppointment = {
      id: Date.now(),
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorSpecialization: selectedDoctor.specialization,
      patientName: localStorage.getItem('userName') || 'Current Patient',
      appointmentDate,
      appointmentTime,
      status: 'Scheduled',
      bookedAt: new Date().toLocaleDateString(),
      // ── Attach voice summary per-appointment ──
      voiceSummary: aiSummary || null,
      riskLevel: aiSummary ? aiSummary.riskLevel : 'Low'
    };

    appointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Also store as global patientSummary for backward-compat with PatientSummary page
    if (aiSummary) {
      localStorage.setItem('patientSummary', JSON.stringify(aiSummary));
    }

    setBooked(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Render: Success State ────────────────────────────────────────────

  if (booked) {
    return (
      <div className="book-appointment-container">
        <div className="success-message" style={styles.successCard}>
          <div style={styles.successIcon}>✅</div>
          <h2>Appointment Booked Successfully!</h2>
          <p>Your appointment with <strong>Dr. {selectedDoctor.name}</strong> has been confirmed.</p>
          <p>📅 {appointmentDate} at ⏰ {appointmentTime}</p>
          {aiSummary && (
            <p style={styles.successNote}>
              🎤 Your voice symptom summary has been attached and will be shared with your doctor.
            </p>
          )}
          <button
            className="confirm-button"
            style={{ marginTop: '20px' }}
            onClick={() => navigate('/patient/my-appointments')}
          >
            View My Appointments →
          </button>
        </div>
      </div>
    );
  }

  // ─── Render: Step Progress Bar ────────────────────────────────────────

  const renderStepIndicator = () => (
    <div style={styles.stepBar}>
      {[
        { num: 1, label: 'Select Doctor' },
        { num: 2, label: 'Record Symptoms' },
        { num: 3, label: 'Review & Confirm' }
      ].map((step, idx) => (
        <React.Fragment key={step.num}>
          {idx > 0 && (
            <div style={{
              ...styles.stepLine,
              background: currentStep > step.num - 1 ? 'linear-gradient(90deg, #06b6d4, #8b5cf6)' : '#334155'
            }} />
          )}
          <div
            style={{
              ...styles.stepCircle,
              background: currentStep >= step.num
                ? 'linear-gradient(135deg, #06b6d4, #8b5cf6)'
                : '#1e293b',
              border: currentStep >= step.num ? 'none' : '2px solid #475569',
              color: currentStep >= step.num ? '#fff' : '#94a3b8'
            }}
          >
            {currentStep > step.num ? '✓' : step.num}
          </div>
          <span style={{
            ...styles.stepLabel,
            color: currentStep >= step.num ? '#e2e8f0' : '#64748b'
          }}>
            {step.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  // ─── Render: Step 1 – Select Doctor ───────────────────────────────────

  const renderStep1 = () => (
    <>
      <div className="booking-form">
        <div className="form-group">
          <label htmlFor="specialization">Filter by Specialization</label>
          <select
            id="specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="specialization-select"
          >
            <option value="">-- All Specializations --</option>
            <option value="General Practice">General Practice</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Surgery">Surgery</option>
          </select>
        </div>
      </div>

      <div className="doctors-list">
        <h2>Available Doctors {specialization && `(${specialization})`}</h2>
        {doctors.length === 0 ? (
          <div className="empty-state">
            <p>No doctors available for this specialization yet.</p>
            <p>Please select a different specialization or check back later.</p>
          </div>
        ) : (
          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <div className="doctor-header">
                  <h3>Dr. {doctor.name}</h3>
                  <span className="rating">⭐ {doctor.rating}/5</span>
                </div>
                <div className="doctor-info">
                  <p><strong>Specialization:</strong> {doctor.specialization}</p>
                  <p><strong>Experience:</strong> {doctor.yearsOfExperience} years</p>
                  <p><strong>Available Slots:</strong> {doctor.availableSlots}</p>
                  <p><strong>Contact:</strong> {doctor.phone}</p>
                </div>
                {selectedDoctor?.id === doctor.id && (
                  <div className="selected-badge">✓ Selected</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDoctor && (
        <div style={styles.navButtons}>
          <div />
          <button className="confirm-button" onClick={() => setCurrentStep(2)}>
            Next: Record Symptoms →
          </button>
        </div>
      )}
    </>
  );

  // ─── Render: Step 2 – Voice Recording ─────────────────────────────────

  const renderStep2 = () => (
    <div style={styles.voiceSection}>
      <div style={styles.doctorBanner}>
        <span>🩺 Booking with <strong>Dr. {selectedDoctor.name}</strong> ({selectedDoctor.specialization})</span>
      </div>

      <div className="recorder-card" style={styles.recorderCard}>
        <div style={styles.recorderHeader}>
          <h2 style={{ margin: 0 }}>🎤 Record Your Symptoms</h2>
          {isRecording && <span className="recording-badge" style={styles.recordingBadge}>🔴 RECORDING</span>}
        </div>
        <p style={{ color: '#94a3b8', margin: '8px 0 20px' }}>
          Describe your symptoms naturally — what you feel, when it started, and how it affects you.
        </p>

        {/* Audio Visualizer */}
        <canvas
          ref={canvasRef}
          width={600}
          height={80}
          style={{
            ...styles.canvas,
            opacity: isRecording ? 1 : 0.3,
            display: isRecording || recordedAudio ? 'block' : 'none'
          }}
        />

        {/* Timer */}
        {(isRecording || recordingTime > 0) && (
          <div style={styles.timer}>{formatTime(recordingTime)}</div>
        )}

        {/* Live Transcript Preview */}
        {isRecording && liveTranscript && (
          <div style={styles.liveTranscript}>
            <span style={styles.liveLabel}>🔤 Live Transcript:</span>
            <p style={styles.liveText}>{liveTranscript}</p>
          </div>
        )}

        {/* Controls */}
        <div style={styles.recorderControls}>
          {!isRecording ? (
            <>
              <button
                className="confirm-button"
                onClick={handleStartRecording}
                disabled={recordedAudio !== null}
                style={recordedAudio ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                🎙️ {recordedAudio ? 'Recording Complete' : 'Start Recording'}
              </button>

              {recordedAudio && (
                <div style={styles.audioActions}>
                  <audio
                    controls
                    src={URL.createObjectURL(recordedAudio)}
                    style={styles.audioPlayer}
                  />
                  <div style={styles.processButtons}>
                    <button
                      className="confirm-button"
                      onClick={handleProcessRecording}
                      disabled={isProcessing}
                      style={{ background: isProcessing ? '#475569' : 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}
                    >
                      {isProcessing ? '⏳ Processing...' : '🤖 Process & Generate Summary'}
                    </button>
                    <button
                      className="action-btn cancel"
                      onClick={handleDiscardRecording}
                      style={styles.discardBtn}
                    >
                      ✕ Discard & Re-record
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button className="action-btn cancel" onClick={handleStopRecording} style={styles.stopBtn}>
              ⏹️ Stop Recording
            </button>
          )}
        </div>
      </div>

      {/* Transcript */}
      {transcript && (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>📝 Transcript</h3>
          <p style={styles.resultText}>{transcript}</p>
        </div>
      )}

      {/* AI Summary */}
      {aiSummary && (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>🤖 AI-Generated Summary</h3>
          <p style={styles.resultText}>{aiSummary.summary}</p>

          <div style={styles.summaryMeta}>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Symptoms:</span>
              <div style={styles.tagRow}>
                {aiSummary.symptoms.map((s, i) => (
                  <span key={i} style={styles.symptomTag}>{s}</span>
                ))}
              </div>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Duration:</span>
              <span style={styles.metaValue}>{aiSummary.duration}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Severity:</span>
              <span style={styles.metaValue}>{aiSummary.severity}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Possible Diagnosis:</span>
              <span style={styles.metaValue}>{aiSummary.possibleDiagnosis.join(', ')}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Recommended Specialist:</span>
              <span style={styles.metaValue}>{aiSummary.recommendedSpecialist}</span>
            </div>
          </div>

          <div style={{
            ...styles.riskBadge,
            background: aiSummary.riskLevel === 'High' ? '#dc2626' : aiSummary.riskLevel === 'Medium' ? '#f59e0b' : '#22c55e'
          }}>
            Risk Level: {aiSummary.riskLevel}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={styles.navButtons}>
        <button className="action-btn" onClick={() => setCurrentStep(1)} style={styles.backBtn}>
          ← Back to Doctor Selection
        </button>
        <button
          className="confirm-button"
          onClick={() => setCurrentStep(3)}
          disabled={!aiSummary}
          style={!aiSummary ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          Next: Review & Confirm →
        </button>
      </div>

      {/* Tips */}
      <div style={styles.tipsCard}>
        <h3>📋 Tips for Better Symptom Descriptions:</h3>
        <ul style={styles.tipsList}>
          <li>✓ Speak clearly and naturally</li>
          <li>✓ Describe the exact location and type of pain/discomfort</li>
          <li>✓ Mention when symptoms started and how they've evolved</li>
          <li>✓ Include medications you've tried</li>
          <li>✓ Record in a quiet environment for better transcription</li>
        </ul>
      </div>
    </div>
  );

  // ─── Render: Step 3 – Review & Confirm ────────────────────────────────

  const renderStep3 = () => (
    <div style={styles.reviewSection}>
      {/* Doctor Summary */}
      <div style={styles.reviewCard}>
        <h2 style={styles.reviewTitle}>🩺 Doctor</h2>
        <div style={styles.reviewGrid}>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Name:</span>
            <span style={styles.reviewValue}>Dr. {selectedDoctor.name}</span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Specialization:</span>
            <span style={styles.reviewValue}>{selectedDoctor.specialization}</span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Experience:</span>
            <span style={styles.reviewValue}>{selectedDoctor.yearsOfExperience} years</span>
          </div>
        </div>
      </div>

      {/* Voice Summary */}
      {aiSummary && (
        <div style={styles.reviewCard}>
          <h2 style={styles.reviewTitle}>🎤 Symptom Summary</h2>
          <p style={styles.resultText}>{aiSummary.summary}</p>
          <div style={styles.tagRow}>
            {aiSummary.symptoms.map((s, i) => (
              <span key={i} style={styles.symptomTag}>{s}</span>
            ))}
          </div>
          <div style={{
            ...styles.riskBadge,
            marginTop: '12px',
            background: aiSummary.riskLevel === 'High' ? '#dc2626' : aiSummary.riskLevel === 'Medium' ? '#f59e0b' : '#22c55e'
          }}>
            Risk: {aiSummary.riskLevel}
          </div>
        </div>
      )}

      {/* Date & Time Picker */}
      <div style={styles.reviewCard}>
        <h2 style={styles.reviewTitle}>📅 Schedule Appointment</h2>
        <div className="form-row" style={styles.dateTimeRow}>
          <div className="form-group" style={styles.formGroup}>
            <label htmlFor="appointmentDate" style={styles.formLabel}>Date</label>
            <input
              type="date"
              id="appointmentDate"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="date-input"
              style={styles.dateInput}
            />
          </div>
          <div className="form-group" style={styles.formGroup}>
            <label htmlFor="appointmentTime" style={styles.formLabel}>Time</label>
            <input
              type="time"
              id="appointmentTime"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="time-input"
              style={styles.dateInput}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={styles.navButtons}>
        <button className="action-btn" onClick={() => setCurrentStep(2)} style={styles.backBtn}>
          ← Back to Recording
        </button>
        <button
          className="confirm-button"
          onClick={handleBookAppointment}
          disabled={!appointmentDate || !appointmentTime}
          style={(!appointmentDate || !appointmentTime) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          ✓ Confirm Booking
        </button>
      </div>
    </div>
  );

  // ─── Main Render ──────────────────────────────────────────────────────

  return (
    <div className="book-appointment-container">
      <h1>📅 Book Appointment</h1>
      <p className="subtitle">Select a doctor, record your symptoms, and schedule your visit</p>

      {renderStepIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  );
}

// ─── Inline Styles (extend existing CSS) ──────────────────────────────────

const styles = {
  stepBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    margin: '24px 0 32px',
    flexWrap: 'wrap'
  },
  stepCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px',
    flexShrink: 0
  },
  stepLine: {
    width: '48px',
    height: '3px',
    borderRadius: '2px',
    flexShrink: 0
  },
  stepLabel: {
    fontSize: '13px',
    fontWeight: 500,
    marginRight: '12px'
  },
  navButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    gap: '12px'
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #475569',
    color: '#94a3b8',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  doctorBanner: {
    background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))',
    border: '1px solid rgba(6,182,212,0.3)',
    borderRadius: '12px',
    padding: '14px 20px',
    marginBottom: '20px',
    color: '#e2e8f0',
    fontSize: '15px'
  },
  voiceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  recorderCard: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '24px'
  },
  recorderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  recordingBadge: {
    background: 'rgba(239,68,68,0.2)',
    color: '#ef4444',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
    animation: 'pulse 1.5s infinite'
  },
  canvas: {
    width: '100%',
    height: '80px',
    borderRadius: '10px',
    marginBottom: '12px'
  },
  timer: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 700,
    color: '#06b6d4',
    fontFamily: 'monospace',
    margin: '8px 0'
  },
  recorderControls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  audioActions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  audioPlayer: {
    width: '100%',
    borderRadius: '8px'
  },
  processButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  discardBtn: {
    background: 'transparent',
    border: '1px solid #dc2626',
    color: '#f87171',
    padding: '10px 18px',
    borderRadius: '10px',
    cursor: 'pointer'
  },
  stopBtn: {
    background: '#dc2626',
    color: '#fff',
    padding: '12px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none'
  },
  resultCard: {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '20px'
  },
  resultTitle: {
    color: '#e2e8f0',
    margin: '0 0 12px'
  },
  resultText: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    fontSize: '15px'
  },
  summaryMeta: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  metaRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
  },
  metaLabel: {
    color: '#64748b',
    fontWeight: 600,
    minWidth: '160px',
    fontSize: '14px'
  },
  metaValue: {
    color: '#e2e8f0',
    fontSize: '14px'
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '4px'
  },
  symptomTag: {
    background: 'rgba(6,182,212,0.15)',
    border: '1px solid rgba(6,182,212,0.3)',
    color: '#06b6d4',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500
  },
  riskBadge: {
    display: 'inline-block',
    padding: '6px 18px',
    borderRadius: '20px',
    color: '#fff',
    fontWeight: 700,
    fontSize: '14px',
    marginTop: '8px'
  },
  tipsCard: {
    background: 'rgba(15,23,42,0.4)',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '8px'
  },
  tipsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    color: '#94a3b8',
    lineHeight: 2
  },
  reviewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  reviewCard: {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '24px'
  },
  reviewTitle: {
    color: '#e2e8f0',
    margin: '0 0 16px'
  },
  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  reviewItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  reviewLabel: {
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 600
  },
  reviewValue: {
    color: '#e2e8f0',
    fontSize: '15px'
  },
  dateTimeRow: {
    display: 'flex',
    gap: '20px'
  },
  formGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formLabel: {
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 500
  },
  dateInput: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#e2e8f0',
    fontSize: '15px'
  },
  successCard: {
    textAlign: 'center',
    padding: '48px',
    maxWidth: '500px',
    margin: '0 auto'
  },
  successIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  successNote: {
    background: 'rgba(6,182,212,0.1)',
    borderRadius: '10px',
    padding: '12px',
    marginTop: '16px',
    color: '#06b6d4',
    fontSize: '14px'
  },
  liveTranscript: {
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: '12px',
    padding: '14px 18px',
    margin: '12px 0'
  },
  liveLabel: {
    color: '#22c55e',
    fontWeight: 600,
    fontSize: '13px'
  },
  liveText: {
    color: '#cbd5e1',
    fontSize: '14px',
    lineHeight: 1.6,
    margin: '8px 0 0',
    fontStyle: 'italic'
  }
};

export default BookAppointment;
