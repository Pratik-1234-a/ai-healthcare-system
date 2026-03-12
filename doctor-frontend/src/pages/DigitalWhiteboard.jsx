import React, { useRef, useState, useEffect } from 'react';

function DigitalWhiteboard() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [context, setContext] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);

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
          <li>🗑️ <strong>Clear:</strong> Clear the canvas to start fresh</li>
        </ul>
      </div>
    </div>
  );
}

export default DigitalWhiteboard;
