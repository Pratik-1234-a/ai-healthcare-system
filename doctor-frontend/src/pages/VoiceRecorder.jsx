import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

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
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
      setAiSummary('');

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Visualizer
      visualizeAudio(stream);
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
      if (!isRecording) return;
      
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgb(200, 200, 200)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `hsl(${(i / dataArray.length) * 360}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
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
    }
  };

  const handleProcessRecording = async () => {
    if (!recordedAudio) return;
    
    setIsProcessing(true);
    try {
      // Simulate transcription
      const mockTranscript = `I've been experiencing severe headaches for the past 3 days. 
      The pain is constant and located on both sides of my head. I've tried over-the-counter pain relievers 
      but they only provide temporary relief. The headaches are worse in the morning and get better as the day progresses. 
      I also have been feeling slightly nauseous and light-sensitive. No fever or other symptoms. 
      I haven't had any recent head injuries.`;
      
      setTranscript(mockTranscript);

      // Generate AI summary with structured data
      const mockSummary = {
        summary: `Patient reports severe bilateral headaches for 3 days. Pain is constant with temporary relief from OTC pain relievers. 
        Symptoms worsen in morning and improve throughout day. Associated symptoms include mild nausea and photophobia. 
        No fever or recent head trauma. Symptoms suggest possible tension headaches or migraine.`,
        symptoms: ['Bilateral Headaches', 'Nausea', 'Photophobia', 'Morning Pain'],
        duration: '3 days',
        severity: 'Severe',
        possibleDiagnosis: ['Tension headaches', 'Migraine', 'Cervicogenic headache'],
        recommendedSpecialist: 'Neurologist',
        riskLevel: 'Medium',
        vitals: {
          bloodPressure: 'Not measured',
          temperature: 'Normal',
          respirationRate: 'Normal'
        },
        timestamp: new Date().toISOString()
      };

      setAiSummary(mockSummary.summary);
      setRiskLevel(mockSummary.riskLevel);

      // Store comprehensive summary for doctor access
      localStorage.setItem('patientSummary', JSON.stringify(mockSummary));
      
      // Also store in appointments if exists to link with appointment
      const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
      if (appointments.length > 0) {
        // Link latest summary to latest appointment
        appointments[appointments.length - 1].patientSummary = mockSummary;
        localStorage.setItem('appointments', JSON.stringify(appointments));
      }

    } catch (error) {
      console.error('Error processing recording:', error);
      alert('Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitSummary = async () => {
    if (!aiSummary) {
      alert('Please process the recording first');
      return;
    }

    try {
      // TODO: Send summary to backend
      alert('Summary submitted! Your appointment will be scheduled soon.');
      navigate('/patient/my-appointments');
    } catch (error) {
      console.error('Error submitting summary:', error);
      alert('Failed to submit summary');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder-container">
      <div className="recorder-section">
        <h1>🎤 Voice Symptom Recorder</h1>
        <p className="subtitle">Describe your symptoms naturally in your own words</p>

        {/* Voice Recorder Card */}
        <div className="recorder-card">
          <div className="recording-header">
            <h2>Record Your Symptoms</h2>
            {isRecording && <span className="recording-badge">🔴 RECORDING</span>}
          </div>

          {/* Audio Visualizer */}
          <canvas 
            ref={canvasRef} 
            width="100%" 
            height="100" 
            className={`audio-visualizer ${isRecording ? 'active' : ''}`}
          />

          <div className="recorder-display">
            {isRecording && (
              <div className="recording-indicator">
                <span className="recording-dot"></span>
                Recording...
              </div>
            )}
            {recordingTime > 0 && (
              <div className="recording-time">{formatTime(recordingTime)}</div>
            )}
          </div>

          {/* Recorder Controls */}
          <div className="recorder-controls">
            {!isRecording ? (
              <>
                <button
                  className="btn-record start"
                  onClick={handleStartRecording}
                  disabled={recordedAudio !== null}
                >
                  🎙️ Start Recording
                </button>
                {recordedAudio && (
                  <>
                    <audio
                      controls
                      src={URL.createObjectURL(recordedAudio)}
                      className="audio-player"
                    />
                    <div className="processing-buttons">
                      <button
                        className="btn-process"
                        onClick={handleProcessRecording}
                        disabled={isProcessing}
                      >
                        {isProcessing ? '⏳ Processing...' : '🤖 Process & Generate Summary'}
                      </button>
                      <button
                        className="btn-discard"
                        onClick={() => {
                          setRecordedAudio(null);
                          setTranscript('');
                          setAiSummary('');
                        }}
                      >
                        ✕ Discard
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button
                className="btn-record stop"
                onClick={handleStopRecording}
              >
                ⏹️ Stop Recording
              </button>
            )}
          </div>
        </div>

        {/* Transcript Section */}
        {transcript && (
          <div className="results-section">
            <div className="result-card">
              <h3>📝 Transcript</h3>
              <div className="content">
                <p>{transcript}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary Section */}
        {aiSummary && (
          <div className="results-section">
            <div className="result-card">
              <h3>🤖 AI-Generated Summary</h3>
              <div className="content">
                <p>{aiSummary}</p>
              </div>
              {riskLevel && (
                <div className={`risk-indicator ${riskLevel.toLowerCase()}`}>
                  Risk Level: {riskLevel}
                </div>
              )}
              <button className="btn-submit" onClick={handleSubmitSummary}>
                ✓ Submit Summary & Book Appointment
              </button>
            </div>
          </div>
        )}

        {/* Recording Tips */}
        <div className="recording-tips">
          <h3>📋 Tips for Better Symptoms Description:</h3>
          <ul>
            <li>✓ Speak clearly and naturally, like you're talking to a friend</li>
            <li>✓ Describe the exact location and type of pain/discomfort</li>
            <li>✓ Mention when the symptoms started and how they've evolved</li>
            <li>✓ Include any recent stress, lifestyle changes, or medications</li>
            <li>✓ Note any other symptoms that might be connected</li>
            <li>✓ Avoid medical jargon - describe what you feel and experience</li>
            <li>✓ Record in a quiet environment for better transcription</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VoiceRecorder;
