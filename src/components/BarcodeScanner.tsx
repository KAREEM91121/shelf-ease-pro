import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScanner = ({ onScanSuccess, isOpen, onClose }: BarcodeScannerProps) => {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          toast({
            title: "تم المسح بنجاح",
            description: `تم العثور على الكود: ${decodedText}`,
          });
          onClose();
        },
        (errorMessage) => {
          // Handle scan error silently - this fires frequently during scanning
          console.log("Scan error:", errorMessage);
        }
      );

      setScanner(html5QrcodeScanner);

      return () => {
        html5QrcodeScanner.clear().catch(console.error);
      };
    }
  }, [isOpen, onScanSuccess, onClose, toast]);

  const handleClose = () => {
    if (scanner) {
      scanner.clear().catch(console.error);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              مسح البار كود
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            وجه الكاميرا نحو البار كود أو QR Code للبحث عن المنتج
          </p>
          <div id="qr-reader" ref={scannerRef} className="w-full"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};