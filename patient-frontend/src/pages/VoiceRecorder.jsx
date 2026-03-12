import React, { useState, useRef } from 'react';
import VoiceButton from '../components/VoiceButton';

function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const mediaRecorderRef = useRef(null);

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
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmitRecording = async () => {
    // TODO: Send audio to backend for processing
    console.log('Submitting audio recording');
  };

  return (
    <div className="voice-recorder-container">
      <h1>Record Your Symptoms</h1>
      <div className="recorder-controls">
        <VoiceButton
          isRecording={isRecording}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
        />
        {recordedAudio && (
          <button onClick={handleSubmitRecording}>
            Submit Recording
          </button>
        )}
      </div>
    </div>
  );
}

export default VoiceRecorder;
