import React, { useState } from "react";
import ToolsBoard from "../Component/Toolboard";
import DrawingBoard from "../Component/DrawingBoard";
import "./canvas.css";

function Canvas() {
  const [selectedTool, setSelectedTool] = useState("brush");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [fillColor, setFillColor] = useState(false);

  return (
    <div className="container">
      <ToolsBoard
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
        selectedColor={selectedColor}
        onSelectColor={setSelectedColor}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        fillColor={fillColor}
        setFillColor={setFillColor}
      />
      <DrawingBoard
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        brushSize={brushSize}
        fillColor={fillColor}
      />
    </div>
  );
}

export default Canvas;
