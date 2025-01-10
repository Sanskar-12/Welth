"use client";

import { scanReceipt } from "@/actions/transaction";
import { useFetchData } from "@/hooks/use-fetch";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AIReceiptScanner = ({ onScanComplete }) => {
  const fileInputRef = useRef();

  const {
    data: scanReceiptData,
    loading: scanReceiptLoading,
    error,
    fn: scanReceiptFn,
  } = useFetchData(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    await scanReceiptFn(file);
  };

  const imageHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleReceiptScan(file);
    }
  };

  useEffect(() => {
    if (scanReceiptData && !scanReceiptLoading) {
      onScanComplete(scanReceiptData);
      toast.success("Receipt Scanned Successfully");
    }
  }, [scanReceiptData, scanReceiptLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to Scan receipt");
    }
  }, [error]);

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => imageHandler(e)}
      />
      <Button
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        type="button"
        variant="outline"
        onClick={() => fileInputRef?.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default AIReceiptScanner;
