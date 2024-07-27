import React, { useRef, useEffect, useState } from "react";
import "./a.css";

const DrawingBoard = ({
  selectedTool,
  selectedColor,
  brushSize,
  fillColor,
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevMouseX, setPrevMouseX] = useState(0);
  const [prevMouseY, setPrevMouseY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const clearCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const saveCanvas = () => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "canvas.png";
      link.click();
    };

    window.addEventListener("clearCanvas", clearCanvas);
    window.addEventListener("saveCanvas", saveCanvas);

    return () => {
      window.removeEventListener("clearCanvas", clearCanvas);
      window.removeEventListener("saveCanvas", saveCanvas);
    };
  }, []);

  const startDraw = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setPrevMouseX(e.clientX - rect.left);
    setPrevMouseY(e.clientY - rect.top);
  };

  const drawing = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (selectedTool === "brush" || selectedTool === "pencil") {
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
    } else if (selectedTool === "rectangle") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillRect(
        prevMouseX,
        prevMouseY,
        mouseX - prevMouseX,
        mouseY - prevMouseY
      );
    } else if (selectedTool === "circle") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(
        prevMouseX,
        prevMouseY,
        Math.sqrt(
          Math.pow(mouseX - prevMouseX, 2) + Math.pow(mouseY - prevMouseY, 2)
        ),
        0,
        2 * Math.PI
      );
      fillColor ? ctx.fill() : ctx.stroke();
    } else if (selectedTool === "line") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(prevMouseX, prevMouseY);
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
    }
    // Add more shapes logic as needed...
  };

  const endDraw = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
  };

  return (
    <section className="drawing-board">
      <canvas
        ref={canvasRef}
        onMouseDown={startDraw}
        onMouseMove={drawing}
        onMouseUp={endDraw}
        onMouseOut={endDraw}
      ></canvas>
    </section>
  );
};

export default DrawingBoard;
