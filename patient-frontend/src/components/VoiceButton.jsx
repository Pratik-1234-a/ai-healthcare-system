import React from 'react';

function VoiceButton({ isRecording, onStart, onStop }) {
  return (
    <button
      className={`voice-button ${isRecording ? 'recording' : ''}`}
      onClick={isRecording ? onStop : onStart}
    >
      {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
    </button>
  );
}

export default VoiceButton;
