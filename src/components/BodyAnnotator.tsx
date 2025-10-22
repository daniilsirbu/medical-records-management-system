import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import * as fabric from "fabric";

type Tool = "select" | "pen" | "rect" | "circle" | "text";
type BodyPart = "full" | "face" | "torso";

const BODY_TEMPLATES = {
  full: "/body-full.png",
  face: "/body-face.png",
  torso: "/body-torso.png",
};

export function BodyAnnotator({
  patientId,
  onComplete,
}: {
  patientId: Id<"patients">;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart>("full");
  const [notes, setNotes] = useState("");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const createFollowUp = useMutation(api.followUps.create);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 800,
      backgroundColor: "#ffffff",
    });

    // Charger l'image de fond
    fabric.Image.fromURL(
      BODY_TEMPLATES[selectedBodyPart],
      {
        crossOrigin: 'anonymous'
      },
      (img: fabric.Image) => {
        fabricCanvas.backgroundImage = img;
        fabricCanvas.renderAll();
      }
    );

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [selectedBodyPart]);

  useEffect(() => {
    if (!canvas) return;

    canvas.isDrawingMode = selectedTool === "pen";
    canvas.selection = selectedTool === "select";

    if (selectedTool === "pen" && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects) {
          activeObjects.forEach((obj: fabric.Object) => {
            canvas.remove(obj);
          });
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [canvas, selectedTool, strokeColor, strokeWidth]);

  const addShape = (type: "rect" | "circle") => {
    if (!canvas) return;

    const options = {
      left: 100,
      top: 100,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
    };

    const shape =
      type === "rect"
        ? new fabric.Rect({ ...options, width: 100, height: 100 })
        : new fabric.Circle({ ...options, radius: 50 });

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  const addText = () => {
    if (!canvas) return;

    const text = new fabric.IText("Double-cliquez pour éditer", {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: strokeColor,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const handleSave = async () => {
    if (!canvas) return;

    const annotation = canvas.toDataURL({
      format: "png",
      quality: 0.8,
      multiplier: 1,
    });

    await createFollowUp({
      patientId,
      date: new Date().toISOString().split("T")[0],
      bodyAnnotation: annotation,
      notes,
    });

    onComplete();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <select
          value={selectedBodyPart}
          onChange={(e) => setSelectedBodyPart(e.target.value as BodyPart)}
          className="border rounded px-2 py-1"
        >
          <option value="full">Corps entier</option>
          <option value="face">Visage</option>
          <option value="torso">Torse</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTool("select")}
            className={`p-2 border rounded ${
              selectedTool === "select" ? "bg-blue-100" : ""
            }`}
            title="Sélectionner"
          >
            ◱
          </button>
          <button
            onClick={() => setSelectedTool("pen")}
            className={`p-2 border rounded ${
              selectedTool === "pen" ? "bg-blue-100" : ""
            }`}
            title="Crayon"
          >
            ✎
          </button>
          <button
            onClick={() => {
              setSelectedTool("rect");
              addShape("rect");
            }}
            className={`p-2 border rounded ${
              selectedTool === "rect" ? "bg-blue-100" : ""
            }`}
            title="Rectangle"
          >
            □
          </button>
          <button
            onClick={() => {
              setSelectedTool("circle");
              addShape("circle");
            }}
            className={`p-2 border rounded ${
              selectedTool === "circle" ? "bg-blue-100" : ""
            }`}
            title="Cercle"
          >
            ○
          </button>
          <button
            onClick={() => {
              setSelectedTool("text");
              addText();
            }}
            className={`p-2 border rounded ${
              selectedTool === "text" ? "bg-blue-100" : ""
            }`}
            title="Texte"
          >
            T
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1">
            Contour
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8"
            />
          </label>
          <label className="flex items-center gap-1">
            Remplissage
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-8 h-8"
            />
          </label>
          <label className="flex items-center gap-1">
            Épaisseur
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-24"
            />
          </label>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <canvas ref={canvasRef} className="border rounded" />
      </div>

      <div>
        <label className="block font-medium mb-2">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={4}
          />
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={onComplete}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
