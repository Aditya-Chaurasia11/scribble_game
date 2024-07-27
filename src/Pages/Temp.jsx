import React, { useEffect, useRef, useState } from 'react';
import './Temp.css';

const Temp = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState('brush');
  const [brushWidth, setBrushWidth] = useState(5);
  const [selectedColor, setSelectedColor] = useState('#000');
  const [fillColor, setFillColor] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [prevMousePos, setPrevMousePos] = useState({ x: 0, y: 0 });
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#fff');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
    ctxRef.current = ctx;
  }, [selectedColor, canvasBackgroundColor]);

  const startDraw = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    setPrevMousePos({ x: offsetX, y: offsetY });
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;
    ctx.putImageData(snapshot, 0, 0);

    const drawRect = () => {
      const width = prevMousePos.x - offsetX;
      const height = prevMousePos.y - offsetY;
      fillColor ? ctx.fillRect(offsetX, offsetY, width, height) : ctx.strokeRect(offsetX, offsetY, width, height);
    };

    const drawCircle = () => {
      ctx.beginPath();
      const radius = Math.sqrt(Math.pow((prevMousePos.x - offsetX), 2) + Math.pow((prevMousePos.y - offsetY), 2));
      ctx.arc(prevMousePos.x, prevMousePos.y, radius, 0, 2 * Math.PI);
      fillColor ? ctx.fill() : ctx.stroke();
    };

    const drawTriangle = () => {
      ctx.beginPath();
      ctx.moveTo(prevMousePos.x, prevMousePos.y);
      ctx.lineTo(offsetX, offsetY);
      ctx.lineTo(prevMousePos.x * 2 - offsetX, offsetY);
      ctx.closePath();
      fillColor ? ctx.fill() : ctx.stroke();
    };

    const drawLine = () => {
      ctx.beginPath();
      ctx.moveTo(prevMousePos.x, prevMousePos.y);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    };

    if (selectedTool === 'brush' || selectedTool === 'pencil' || selectedTool === 'eraser') {
      ctx.strokeStyle = selectedTool === 'eraser' ? canvasBackgroundColor : selectedColor;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    } else if (selectedTool === 'rectangle') {
      drawRect();
    } else if (selectedTool === 'circle') {
      drawCircle();
    } else if (selectedTool === 'triangle') {
      drawTriangle();
    } else if (selectedTool === 'line') {
      drawLine();
    }
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const floodFill = (x, y, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getColorAtPixel(imageData, x, y);

    function matchColor(pixelPos, color) {
      return (
        data[pixelPos] === color[0] &&
        data[pixelPos + 1] === color[1] &&
        data[pixelPos + 2] === color[2] &&
        data[pixelPos + 3] === color[3]
      );
    }

    function getColorAtPixel(imageData, x, y) {
      const offset = (y * imageData.width + x) * 4;
      return [
        imageData.data[offset],
        imageData.data[offset + 1],
        imageData.data[offset + 2],
        imageData.data[offset + 3],
      ];
    }

    function setColorAtPixel(imageData, x, y, color) {
      const offset = (y * imageData.width + x) * 4;
      imageData.data[offset] = color[0];
      imageData.data[offset + 1] = color[1];
      imageData.data[offset + 2] = color[2];
      imageData.data[offset + 3] = color[3];
    }

    const pixelStack = [[x, y]];
    const fillColorArray = hexToRgba(fillColor);

    while (pixelStack.length) {
      const newPos = pixelStack.pop();
      const x = newPos[0];
      let y = newPos[1];

      let pixelPos = (y * canvas.width + x) * 4;

      while (y >= 0 && matchColor(pixelPos, targetColor)) {
        y--;
        pixelPos -= canvas.width * 4;
      }

      pixelPos += canvas.width * 4;
      y++;

      let reachLeft = false;
      let reachRight = false;

      while (y < canvas.height && matchColor(pixelPos, targetColor)) {
        setColorAtPixel(imageData, x, y, fillColorArray);

        if (x > 0) {
          if (matchColor(pixelPos - 4, targetColor)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < canvas.width - 1) {
          if (matchColor(pixelPos + 4, targetColor)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        y++;
        pixelPos += canvas.width * 4;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const hexToRgba = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b, 255];
  };

  const handleCanvasClick = (e) => {
    if (selectedTool !== 'fill') return;
    const { offsetX, offsetY } = e.nativeEvent;
    floodFill(offsetX, offsetY, selectedColor);
  };

  return (
    <div className="container">
      <section className="tools-board">
        <div className="row">
          <label className="title"><strong>Tools</strong></label>
          <ul className="options">
            {['pencil', 'brush', 'eraser', 'rectangle', 'circle', 'triangle', 'line', 'fill'].map(tool => (
              <li
                key={tool}
                className={`option tool ${selectedTool === tool ? 'active' : ''}`}
                id={tool}
                onClick={() => setSelectedTool(tool)}
              >
                <i className={`fas fa-${tool}`} id="icon"></i>
                <span>{tool.charAt(0).toUpperCase() + tool.slice(1)}</span>
              </li>
            ))}
            <li className="option">
              <input
                type="range"
                id="size-slider"
                min="1"
                max="30"
                value={brushWidth}
                onChange={(e) => setBrushWidth(e.target.value)}
              />
            </li>
          </ul>
        </div>
        <div className="row colors">
          <label className="title">Colors</label>
          <ul className="options">
            {['#fff', '#000', '#ef4415', '#00FF00', '#c1f40a'].map((color, index) => (
              <li
                key={color}
                className={`option ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              ></li>
            ))}
            <li className="option">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              />
            </li>
          </ul>
        </div>
        <div className="row">
          <label className="title"><strong>Shapes</strong></label>
          <ul className="options">
            <li className="option">
              <input
                type="checkbox"
                id="fill-color"
                checked={fillColor}
                onChange={(e) => setFillColor(e.target.checked)}
              />
              <label htmlFor="fill-color"> Fill Color</label>
            </li>
          </ul>
        </div>
        <div className="row buttons">
          <button className="clear-canvas" onClick={clearCanvas}>Clear Canvas</button>
          <button className="save-img" onClick={saveImage}>Save As Image</button>
        </div>
        <div className="row">
          <label className="title">Canvas Background</label>
          <input
            type="color"
            value={canvasBackgroundColor}
            onChange={(e) => setCanvasBackgroundColor(e.target.value)}
          />
        </div>
      </section>
      <section className="drawing-board">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onClick={handleCanvasClick}
        ></canvas>
      </section>
    </div>
  );
};

export default Temp;
