import React from 'react';

const ToolsBoard = ({
  selectedTool,
  onSelectTool,
  selectedColor,
  onSelectColor,
  brushSize,
  onBrushSizeChange,
  fillColor,
  setFillColor,
}) => {
  const handleToolClick = (tool) => {
    onSelectTool(tool);
  };

  const handleColorClick = (color) => {
    onSelectColor(color);
  };

  return (
    <section className="tools-board">
      <div className="row">
        <label className="title"><strong>Tools</strong></label>
        <ul className="options">
          {['pencil', 'brush', 'eraser', 'rectangle', 'circle', 'triangle', 'square', 'hexagon', 'pentagon', 'line', 'arrow'].map((tool) => (
            <li
              key={tool}
              className={`option tool ${selectedTool === tool ? 'active' : ''}`}
              onClick={() => handleToolClick(tool)}
            >
              <i className={`fas fa-${tool === 'brush' ? 'brush' : tool}`} id="icon"></i>
              <span>{tool.charAt(0).toUpperCase() + tool.slice(1)}</span>
            </li>
          ))}
          <li className="option">
            <input
              type="range"
              id="size-slider"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(e.target.value)}
            />
          </li>
        </ul>
      </div>
      <div className="row colors">
        <label className="title">Colors</label>
        <ul className="options">
          {['#ffffff', '#000000', '#ef4415', 'green'].map((color) => (
            <li
              key={color}
              className={`option ${selectedColor === color ? 'selected' : ''}`}
              onClick={() => handleColorClick(color)}
              style={{ backgroundColor: color }}
            ></li>
          ))}
          <li className="option">
            <input
              type="color"
              id="color-picker"
              value={selectedColor}
              onChange={(e) => handleColorClick(e.target.value)}
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
            <label htmlFor="fill-color">Fill Color</label>
          </li>
        </ul>
      </div>
      <div className="row buttons">
        <button className="clear-canvas" onClick={() => window.dispatchEvent(new Event('clearCanvas'))}>Clear Canvas</button>
        <button className="save-img" onClick={() => window.dispatchEvent(new Event('saveCanvas'))}>Save As Image</button>
      </div>
    </section>
  );
};

export default ToolsBoard;
