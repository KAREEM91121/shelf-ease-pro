import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  children?: React.ReactNode;
}

export const BarcodeScanner = ({ onScan, children }: BarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const elementId = "barcode-scanner";

  const startScanner = () => {
    if (!isScanning) {
      setIsScanning(true);
      
      scannerRef.current = new Html5QrcodeScanner(
        elementId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          // Success callback
          onScan(decodedText);
          stopScanner();
          setIsOpen(false);
        },
        (error) => {
          // Error callback - can be ignored for continuous scanning
          console.warn("QR scan error:", error);
        }
      );
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the element is rendered
      setTimeout(startScanner, 100);
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 ml-1" />
            مسح الباركود
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>مسح الباركود</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            وجه الكاميرا نحو الباركود لمسحه
          </p>
          <div id={elementId} className="w-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
};