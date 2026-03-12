import React, { useRef, useState, useEffect } from 'react';

function DigitalWhiteboard() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [context, setContext] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);

  // Send-to-patient state
  const [showSendPanel, setShowSendPanel] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setContext(ctx);
    }

    // Load appointments from localStorage + backend DB
    const loadAppointments = async () => {
      // Get localStorage appointments
      const localAppointments = JSON.parse(localStorage.getItem('appointments')) || [];

      // Also try fetching from database
      try {
        const res = await fetch('http://localhost:5000/api/appointments');
        const dbAppointments = await res.json();
        if (Array.isArray(dbAppointments) && dbAppointments.length > 0) {
          // Merge: prefer DB appointments, add local ones that aren't in DB
          const dbIds = new Set(dbAppointments.map(a => a.id));
          const merged = [
            ...dbAppointments.map(a => ({
              id: a.id,
              patientName: a.patient_name || a.patientName || 'Patient',
              patientEmail: a.patient_email || a.patientEmail || '',
              doctorName: a.doctor_name || a.doctorName || 'Doctor',
              doctorSpecialization: a.specialization || a.doctorSpecialization || '',
              appointmentDate: a.appointment_date || a.appointmentDate || '',
              appointmentTime: a.appointment_time || a.appointmentTime || '',
              status: a.status || 'Scheduled'
            })),
            ...localAppointments.filter(a => !dbIds.has(a.id))
          ];
          setAppointments(merged);
        } else {
          setAppointments(localAppointments);
        }
      } catch (err) {
        // If backend is unavailable, use localStorage
        setAppointments(localAppointments);
      }
    };

    loadAppointments();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        if (context) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [context]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (context) {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;

    const { offsetX, offsetY } = e.nativeEvent;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = color;
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    if (context) {
      context.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const saveNote = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      const newNote = {
        id: Date.now(),
        image: imageData,
        timestamp: new Date().toLocaleTimeString()
      };
      setSavedNotes([...savedNotes, newNote]);
      clearCanvas();
      alert('Note saved successfully!');
    }
  };

  const downloadNote = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `medical-note-${Date.now()}.png`;
      link.click();
    }
  };

  const deleteNote = (id) => {
    setSavedNotes(savedNotes.filter(note => note.id !== id));
  };

  // ─── Send to Patient ──────────────────────────────────────────────────

  const generatePrescriptionPDF = () => {
    // Generate a PDF-like document by creating a hidden canvas that combines
    // the whiteboard image + prescription text into a single downloadable image
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const pdfCanvas = document.createElement('canvas');
    const pdfCtx = pdfCanvas.getContext('2d');
    const whiteboardImage = canvas.toDataURL('image/png');

    // Set PDF canvas size
    const pdfWidth = 800;
    const textLines = prescriptionText ? prescriptionText.split('\n') : [];
    const textHeight = Math.max(200, textLines.length * 28 + 200);
    const pdfHeight = 600 + textHeight;

    pdfCanvas.width = pdfWidth;
    pdfCanvas.height = pdfHeight;

    // White background
    pdfCtx.fillStyle = '#ffffff';
    pdfCtx.fillRect(0, 0, pdfWidth, pdfHeight);

    // Header
    pdfCtx.fillStyle = '#1e293b';
    pdfCtx.fillRect(0, 0, pdfWidth, 80);
    pdfCtx.fillStyle = '#ffffff';
    pdfCtx.font = 'bold 28px Arial';
    pdfCtx.fillText('⚕️ AI Healthcare System — Medical Notes', 30, 52);

    // Patient info
    pdfCtx.fillStyle = '#334155';
    pdfCtx.font = '16px Arial';
    const patientName = selectedAppointment?.patientName || 'Patient';
    const doctorName = selectedAppointment?.doctorName || 'Doctor';
    const dateStr = new Date().toLocaleDateString();
    pdfCtx.fillText(`Patient: ${patientName}    |    Doctor: Dr. ${doctorName}    |    Date: ${dateStr}`, 30, 115);

    // Divider
    pdfCtx.strokeStyle = '#e2e8f0';
    pdfCtx.lineWidth = 1;
    pdfCtx.beginPath();
    pdfCtx.moveTo(30, 135);
    pdfCtx.lineTo(pdfWidth - 30, 135);
    pdfCtx.stroke();

    // Whiteboard drawing title
    pdfCtx.fillStyle = '#1e293b';
    pdfCtx.font = 'bold 18px Arial';
    pdfCtx.fillText('📋 Whiteboard Notes:', 30, 165);

    // Draw the whiteboard content (scaled to fit)
    const img = new Image();
    img.src = whiteboardImage;

    return new Promise((resolve) => {
      img.onload = () => {
        const drawStartY = 180;
        const maxDrawWidth = pdfWidth - 60;
        const maxDrawHeight = 350;
        const scale = Math.min(maxDrawWidth / img.width, maxDrawHeight / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;

        // Border around whiteboard image
        pdfCtx.strokeStyle = '#cbd5e1';
        pdfCtx.lineWidth = 2;
        pdfCtx.strokeRect(29, drawStartY - 1, drawWidth + 2, drawHeight + 2);
        pdfCtx.drawImage(img, 30, drawStartY, drawWidth, drawHeight);

        // Prescription text section
        const textStartY = drawStartY + drawHeight + 40;

        if (prescriptionText.trim()) {
          pdfCtx.fillStyle = '#1e293b';
          pdfCtx.font = 'bold 18px Arial';
          pdfCtx.fillText('💊 Prescription:', 30, textStartY);

          // Divider
          pdfCtx.strokeStyle = '#e2e8f0';
          pdfCtx.beginPath();
          pdfCtx.moveTo(30, textStartY + 10);
          pdfCtx.lineTo(pdfWidth - 30, textStartY + 10);
          pdfCtx.stroke();

          pdfCtx.fillStyle = '#334155';
          pdfCtx.font = '15px Arial';
          let y = textStartY + 35;
          for (const line of textLines) {
            pdfCtx.fillText(line, 40, y);
            y += 24;
          }
        }

        // Footer
        pdfCtx.fillStyle = '#94a3b8';
        pdfCtx.font = '12px Arial';
        pdfCtx.fillText('Generated by AI Healthcare System — This is a digital medical document', 30, pdfHeight - 20);

        resolve(pdfCanvas.toDataURL('image/png'));
      };

      img.onerror = () => resolve(null);
    });
  };

  const handleSendToPatient = async () => {
    if (!selectedAppointment) {
      alert('Please select a patient/appointment first.');
      return;
    }
    if (!prescriptionText.trim()) {
      alert('Please enter prescription details.');
      return;
    }

    setIsSending(true);
    setSendSuccess(false);
    setSendError('');

    try {
      // Get the raw whiteboard canvas image
      const canvas = canvasRef.current;
      const whiteboardImage = canvas ? canvas.toDataURL('image/png') : null;

      // Prepare the email content
      const patientEmail = selectedAppointment.patientEmail || 'patient@example.com';
      const doctorName = selectedAppointment.doctorName || 'Doctor';
      const patientName = selectedAppointment.patientName || 'Patient';

      // Send via backend email API
      const response = await fetch('http://localhost:5000/api/mail/send-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientEmail,
          prescriptionData: {
            doctorName,
            prescriptionDetails: prescriptionText,
            whiteboardImage
          }
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Save prescription record locally
        const prescriptions = JSON.parse(localStorage.getItem('prescriptions')) || [];
        prescriptions.push({
          id: Date.now(),
          appointmentId: selectedAppointment.id,
          patientName,
          patientEmail,
          doctorName,
          createdDate: new Date().toLocaleDateString(),
          createdTime: new Date().toLocaleTimeString(),
          prescriptionText,
          status: 'Sent',
          source: 'whiteboard'
        });
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));

        setSendMessage(result.message || 'Email sent!');
        setPreviewUrl(result.previewUrl || '');
        setSendSuccess(true);
        setTimeout(() => { setSendSuccess(false); setSendMessage(''); setPreviewUrl(''); }, 15000);
      } else {
        // Email sending failed — show specific error
        const errorMsg = result.error || 'Email sending failed. Please check your email configuration.';
        setSendError(errorMsg);
        setTimeout(() => setSendError(''), 8000);
      }

    } catch (error) {
      console.error('Error sending to patient:', error);
      setSendError('Could not connect to the email server. Please make sure the backend is running.');
      setTimeout(() => setSendError(''), 8000);
    } finally {
      setIsSending(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-header">
        <h1>📋 Digital Whiteboard</h1>
        <p>Draw diagrams and notes during consultation</p>
      </div>

      <div className="whiteboard-content">
        {/* Toolbar */}
        <div className="whiteboard-toolbar">
          <div className="toolbar-section">
            <label>Pen Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-picker"
            />
          </div>

          <div className="toolbar-section">
            <label>Brush Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(e.target.value)}
              className="brush-slider"
            />
            <span className="brush-value">{brushSize}px</span>
          </div>

          <div className="toolbar-section buttons">
            <button className="btn-action clear" onClick={clearCanvas}>
              🗑️ Clear
            </button>
            <button className="btn-action save" onClick={saveNote}>
              💾 Save Note
            </button>
            <button className="btn-action download" onClick={downloadNote}>
              ⬇️ Download
            </button>
            <button
              className="btn-action save"
              onClick={() => setShowSendPanel(!showSendPanel)}
              style={{
                background: showSendPanel ? '#8b5cf6' : 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              📧 Send to Patient
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="whiteboard-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>

      {/* ─── Send to Patient Panel ─────────────────────────────────────── */}
      {showSendPanel && (
        <div style={styles.sendPanel}>
          <div style={styles.sendHeader}>
            <h2 style={styles.sendTitle}>📧 Send Whiteboard & Prescription to Patient</h2>
            <button
              onClick={() => setShowSendPanel(false)}
              style={styles.closeBtn}
            >✕</button>
          </div>

          {/* Success Banner */}
          {sendSuccess && (
            <div style={styles.successBanner}>
              ✅ {sendMessage || 'Prescription email sent successfully!'}
              {previewUrl && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#22c55e', textDecoration: 'underline', fontWeight: 700 }}
                  >
                    📩 Click here to preview the email
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {sendError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '14px 20px',
              marginBottom: '20px',
              color: '#ef4444',
              fontWeight: 600,
              fontSize: '14px'
            }}>
              ❌ {sendError}
            </div>
          )}

          {/* Patient Selector */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Patient (from appointments)</label>
            <select
              style={styles.select}
              value={selectedAppointment ? selectedAppointment.id : ''}
              onChange={(e) => {
                const apt = appointments.find(a => a.id === parseInt(e.target.value));
                setSelectedAppointment(apt || null);
              }}
            >
              <option value="">-- Select a patient --</option>
              {appointments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.patientName || 'Patient'} — {apt.appointmentDate} ({apt.doctorSpecialization})
                </option>
              ))}
            </select>
          </div>

          {/* Selected patient info */}
          {selectedAppointment && (
            <div style={styles.patientInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>👤 Patient:</span>
                <span style={styles.infoValue}>{selectedAppointment.patientName}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>📧 Email:</span>
                <span style={styles.infoValue}>{selectedAppointment.patientEmail || 'patient@example.com'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>📅 Appointment:</span>
                <span style={styles.infoValue}>{selectedAppointment.appointmentDate} at {selectedAppointment.appointmentTime}</span>
              </div>
            </div>
          )}

          {/* Prescription Text */}
          <div style={styles.formGroup}>
            <label style={styles.label}>💊 Prescription Details</label>
            <textarea
              style={styles.textarea}
              rows={8}
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder={`Write the prescription here, e.g.:\n\n1. Paracetamol 500mg — Twice daily after meals — 5 days\n2. Vitamin D3 60K — Once weekly — 8 weeks\n\nPrecautions:\n- Avoid cold foods\n- Follow up after 2 weeks`}
            />
          </div>

          {/* What gets sent */}
          <div style={styles.whatSent}>
            <h4 style={{ margin: '0 0 8px', color: '#e2e8f0' }}>📨 What will be sent:</h4>
            <ul style={styles.whatSentList}>
              <li>📋 Current whiteboard drawing as an image</li>
              <li>💊 Prescription text typed above</li>
              <li>📄 Combined into a single document (auto-downloaded)</li>
            </ul>
          </div>

          {/* Send Button */}
          <button
            style={{
              ...styles.sendButton,
              opacity: isSending ? 0.7 : 1,
              cursor: isSending ? 'wait' : 'pointer'
            }}
            onClick={handleSendToPatient}
            disabled={isSending}
          >
            {isSending ? '⏳ Sending...' : '📧 Send to Patient'}
          </button>
        </div>
      )}

      {/* Saved Notes */}
      {savedNotes.length > 0 && (
        <div className="saved-notes-section">
          <h2>Saved Notes ({savedNotes.length})</h2>
          <div className="notes-grid">
            {savedNotes.map((note) => (
              <div key={note.id} className="note-thumbnail">
                <img src={note.image} alt={`Note ${note.id}`} />
                <div className="note-meta">
                  <p className="note-time">{note.timestamp}</p>
                  <button
                    className="btn-delete"
                    onClick={() => deleteNote(note.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="whiteboard-instructions">
        <h3>How to Use:</h3>
        <ul>
          <li>🖊️ <strong>Draw:</strong> Click and drag to draw on the canvas</li>
          <li>🎨 <strong>Change Color:</strong> Click the color picker to change pen color</li>
          <li>📏 <strong>Adjust Size:</strong> Use the slider to change brush thickness</li>
          <li>💾 <strong>Save:</strong> Click Save Note to store your drawing</li>
          <li>⬇️ <strong>Download:</strong> Download the current drawing as an image</li>
          <li>📧 <strong>Send:</strong> Send whiteboard + prescription to a patient via email</li>
          <li>🗑️ <strong>Clear:</strong> Clear the canvas to start fresh</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Inline Styles for Send Panel ─────────────────────────────────────────

const styles = {
  sendPanel: {
    background: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '16px',
    padding: '28px',
    marginTop: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
  },
  sendHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  sendTitle: {
    color: '#e2e8f0',
    margin: 0,
    fontSize: '20px'
  },
  closeBtn: {
    background: 'transparent',
    border: '1px solid #475569',
    color: '#94a3b8',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  successBanner: {
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.4)',
    borderRadius: '12px',
    padding: '14px 20px',
    marginBottom: '20px',
    color: '#22c55e',
    fontWeight: 600,
    fontSize: '15px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '15px',
    cursor: 'pointer',
    outline: 'none'
  },
  patientInfo: {
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  infoRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  infoLabel: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 600,
    minWidth: '120px'
  },
  infoValue: {
    color: '#e2e8f0',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    lineHeight: 1.7,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  whatSent: {
    background: 'rgba(139, 92, 246, 0.08)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px'
  },
  whatSentList: {
    margin: 0,
    padding: '0 0 0 20px',
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: 1.8
  },
  sendButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.5px'
  }
};

export default DigitalWhiteboard;
