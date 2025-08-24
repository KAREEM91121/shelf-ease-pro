import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
}

export const BarcodeGenerator = ({ 
  value, 
  width = 2,
  height = 100,
  fontSize = 14
}: BarcodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          width,
          height,
          fontSize,
          textAlign: "center",
          textPosition: "bottom",
          textMargin: 2,
          fontOptions: "",
          font: "monospace",
          background: "#ffffff",
          lineColor: "#000000",
          margin: 10,
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [value, width, height, fontSize]);

  if (!value) {
    return (
      <div className="flex items-center justify-center h-24 bg-muted rounded border-2 border-dashed">
        <span className="text-muted-foreground text-sm">لا يوجد باركود</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="border rounded" />
    </div>
  );
};