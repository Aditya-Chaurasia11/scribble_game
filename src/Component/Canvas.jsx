// client/src/components/Canvas.js
import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

const Canvas = () => {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState('black');
    const [lineWidth, setLineWidth] = useState(5);
    const [eraser, setEraser] = useState(false);
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const draw = (x, y, color, lineWidth) => {
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            context.lineTo(x, y);
            context.stroke();
            context.beginPath();
            context.moveTo(x, y);
        };

        const saveHistory = () => {
            const dataUrl = canvas.toDataURL();
            setHistory((prevHistory) => [...prevHistory, dataUrl]);
            setRedoStack([]); // Clear redo stack when new action is taken
        };

        const handleMouseDown = (e) => {
            setDrawing(true);
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            context.beginPath();
            context.moveTo(x, y);
            saveHistory(); // Save the state before starting a new drawing
        };

        const handleMouseUp = () => {
            setDrawing(false);
            context.beginPath();
        };

        const handleMouseMove = (e) => {
            if (!drawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (eraser) {
                draw(x, y, 'white', lineWidth);
                socket.emit('draw', { x, y, color: 'white', lineWidth });
            } else {
                draw(x, y, color, lineWidth);
                socket.emit('draw', { x, y, color, lineWidth });
            }
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);

        socket.on('draw', ({ x, y, color, lineWidth }) => {
            draw(x, y, color, lineWidth);
        });

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [drawing, color, lineWidth, eraser]);

    const handleColorChange = (newColor) => {
        setColor(newColor);
        setEraser(false);
    };

    const handleEraser = () => {
        setEraser(true);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const newHistory = [...history];
        const lastState = newHistory.pop();
        setHistory(newHistory);
        setRedoStack((prevRedoStack) => [lastState, ...prevRedoStack]);

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (newHistory.length > 0) {
            const img = new Image();
            img.src = newHistory[newHistory.length - 1];
            img.onload = () => context.drawImage(img, 0, 0);
        }
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const newRedoStack = [...redoStack];
        const nextState = newRedoStack.shift();
        setRedoStack(newRedoStack);
        setHistory((prevHistory) => [...prevHistory, nextState]);

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.src = nextState;
        img.onload = () => context.drawImage(img, 0, 0);
    };

    const floodFill = (startX, startY, fillColor) => {
        const context = canvasRef.current.getContext('2d');
        const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const data = imageData.data;
        const stack = [[startX, startY]];

        const startIdx = (startY * canvasRef.current.width + startX) * 4;
        const startColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];

        const matchStartColor = (x, y) => {
            const idx = (y * canvasRef.current.width + x) * 4;
            return (
                data[idx] === startColor[0] &&
                data[idx + 1] === startColor[1] &&
                data[idx + 2] === startColor[2] &&
                data[idx + 3] === startColor[3]
            );
        };

        const colorPixel = (x, y) => {
            const idx = (y * canvasRef.current.width + x) * 4;
            data[idx] = fillColor[0];
            data[idx + 1] = fillColor[1];
            data[idx + 2] = fillColor[2];
            data[idx + 3] = 255;
        };

        while (stack.length) {
            const [x, y] = stack.pop();

            if (x < 0 || y < 0 || x >= canvasRef.current.width || y >= canvasRef.current.height) continue;

            if (matchStartColor(x, y)) {
                colorPixel(x, y);
                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }
        }

        context.putImageData(imageData, 0, 0);
    };

    const handleFillColor = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const [r, g, b] = color.match(/\w\w/g).map((c) => parseInt(c, 16));
        floodFill(x, y, [r, g, b]);
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleFillColor}
                style={{
                    border: '1px solid black',
                    cursor: eraser
                        ? `url('data:image/svg+xml;base64,${btoa(
                              `<svg height="${lineWidth * 2}" width="${
                                  lineWidth * 2
                              }" xmlns="http://www.w3.org/2000/svg"><circle cx="${lineWidth}" cy="${lineWidth}" r="${lineWidth}" fill="gray"/></svg>`
                          )}'), auto`
                        : 'crosshair',
                }}
            />
            <div>
                <button onClick={() => handleColorChange('black')} style={{ backgroundColor: 'black', color: 'white' }}>Black</button>
                <button onClick={() => handleColorChange('red')} style={{ backgroundColor: 'red' }}>Red</button>
                <button onClick={() => handleColorChange('blue')} style={{ backgroundColor: 'blue', color: 'white' }}>Blue</button>
                <button onClick={() => handleColorChange('green')} style={{ backgroundColor: 'green' }}>Green</button>
                <button onClick={handleEraser}>Eraser</button>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(e.target.value)}
                />
                <button onClick={handleUndo}>Undo</button>
                <button onClick={handleRedo}>Redo</button>
            </div>
        </div>
    );
};

export default Canvas;
