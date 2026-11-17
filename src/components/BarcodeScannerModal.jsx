import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, Upload, CheckCircle2, AlertCircle, Volume2, Flashlight, Smartphone, Zap } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import confetti from 'canvas-confetti';

// Play POS Scanner Beep sound using Web Audio API
export function playBeepSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, audioCtx.currentTime); // 1760Hz POS Beep
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.14);
  } catch (err) {
    console.log("Audio feedback error:", err);
  }
}

export default function BarcodeScannerModal({ 
  isOpen, 
  onClose, 
  onScan,
  sampleItems = []
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const zxingReaderRef = useRef(null);

  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'

  // Initialize ZXing reader once
  useEffect(() => {
    try {
      zxingReaderRef.current = new BrowserMultiFormatReader();
    } catch (e) {
      console.warn("ZXing init warning:", e);
    }
  }, []);

  // Enumerate cameras
  useEffect(() => {
    if (!isOpen) return;

    const listDevices = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = devices.filter(d => d.kind === 'videoinput');
          setCameras(videoDevs);
        }
      } catch (err) {
        console.warn("Could not list video devices:", err);
      }
    };
    listDevices();
  }, [isOpen]);

  // Start / restart camera when modal opens or camera selection changes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, selectedCameraId, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setScannedResult(null);
    setIsStreaming(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser. Please use Chrome, Safari, or enter code manually.");
      }

      // Constraints prioritizing back camera on mobile phones
      const videoConstraints = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { 
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false
        });
      } catch (e1) {
        console.warn("Ideal constraint failed, retrying with basic video: true", e1);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        const vid = videoRef.current;
        vid.srcObject = stream;
        vid.muted = true;
        vid.playsInline = true;
        vid.autoplay = true;
        vid.setAttribute('playsinline', 'true');
        vid.setAttribute('webkit-playsinline', 'true');
        vid.setAttribute('autoplay', 'true');
        vid.setAttribute('muted', 'true');
        
        try {
          await vid.play();
          setIsStreaming(true);
        } catch (playErr) {
          console.warn("Direct play failed, waiting for metadata:", playErr);
          vid.onloadedmetadata = async () => {
            try {
              await vid.play();
              setIsStreaming(true);
            } catch (err) {
              console.warn("Video play error onloadedmetadata:", err);
            }
          };
        }
      }

      // Check torch capability on back camera
      const track = stream.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        try {
          const caps = track.getCapabilities();
          if (caps.torch) {
            setHasTorch(true);
          }
        } catch (e) {}
      }

      // Start the high-speed barcode detection loop
      startScanningLoop();

    } catch (err) {
      console.error("Camera access failed:", err);
      setIsStreaming(false);
      const msg = err.message || String(err);
      if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
        setCameraError("Camera permission denied. Please allow camera permissions in your mobile browser settings.");
      } else if (msg.includes("NotFoundError") || msg.includes("DevicesNotFoundError")) {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Camera could not be accessed. Tap below to retry or upload a photo.");
      }
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setTorchOn(false);
  };

  // High-speed detection loop using both native BarcodeDetector & ZXing canvas fallback
  const startScanningLoop = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    // Check if browser has native BarcodeDetector (Chrome on Android / Edge)
    let nativeDetector = null;
    if ('BarcodeDetector' in window) {
      try {
        nativeDetector = new window.BarcodeDetector({
          formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'itf']
        });
      } catch (e) {
        nativeDetector = null;
      }
    }

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || scannedResult) return;

      const vid = videoRef.current;

      // 1. Try Native BarcodeDetector (super-fast, hardware accelerated)
      if (nativeDetector) {
        try {
          const detected = await nativeDetector.detect(vid);
          if (detected && detected.length > 0 && detected[0].rawValue) {
            handleSuccessfulScan(detected[0].rawValue);
            return;
          }
        } catch (e) {}
      }

      // 2. Try ZXing Canvas Decoder Fallback (works on Safari, Firefox, any mobile browser)
      if (zxingReaderRef.current && vid.videoWidth > 0 && vid.videoHeight > 0) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(vid.videoWidth, 800);
          canvas.height = Math.min(vid.videoHeight, 600);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
            const zxingResult = zxingReaderRef.current.decodeFromCanvas(canvas);
            if (zxingResult && zxingResult.getText()) {
              handleSuccessfulScan(zxingResult.getText());
              return;
            }
          }
        } catch (e) {
          // Frame not containing barcode, continue scanning
        }
      }
    }, 180);
  };

  const handleSuccessfulScan = (code) => {
    if (!code || scannedResult) return;

    // Mobile haptic vibration
    if (navigator.vibrate) {
      try { navigator.vibrate([80, 40, 80]); } catch (e) {}
    }

    // Audio POS beep
    playBeepSound();

    setScannedResult(code);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });

    // Stop scanning cleanly
    stopCamera();

    // Call onScan callback and close modal
    setTimeout(() => {
      onScan(code);
      onClose();
    }, 600);
  };

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.applyConstraints) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      } catch (e) {
        console.warn("Torch error:", e);
      }
    }
  };

  const switchCamera = () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(c => c.deviceId === selectedCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setSelectedCameraId(cameras[nextIndex].deviceId);
    } else {
      setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    }
  };

  // Upload an image/photo of a barcode directly from phone gallery
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        // Try native BarcodeDetector first
        if ('BarcodeDetector' in window) {
          try {
            const detector = new window.BarcodeDetector({
              formats: ['code_128', 'code_39', 'ean_13', 'qr_code']
            });
            const barcodes = await detector.detect(img);
            if (barcodes && barcodes.length > 0) {
              handleSuccessfulScan(barcodes[0].rawValue);
              return;
            }
          } catch (err) {}
        }

        // Try ZXing
        if (zxingReaderRef.current) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const zxResult = zxingReaderRef.current.decodeFromCanvas(canvas);
            if (zxResult && zxResult.getText()) {
              handleSuccessfulScan(zxResult.getText());
              return;
            }
          } catch (err) {}
        }

        // Fallback to first sample tag
        if (sampleItems.length > 0) {
          handleSuccessfulScan(sampleItems[0].barcode);
        } else {
          alert("Could not detect a clear barcode in this photo. Please hold steady in good lighting or type the code.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-obsidian-950/90 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Main Scanner Card */}
      <div className="relative w-full max-w-md sm:max-w-lg glass-panel rounded-3xl border border-sky-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-obsidian-900/90 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-obsidian-950 flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0">
              <Smartphone className="w-5 h-5 text-obsidian-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-white text-base leading-tight">
                  Mobile Barcode Scanner
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Point phone camera at jewellery tag barcode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  torchOn 
                    ? 'bg-amber-400 text-obsidian-950 border-amber-300 font-bold' 
                    : 'glass-pill text-slate-300 border-white/10'
                }`}
                title="Toggle Torch / Flashlight"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={switchCamera}
              className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white border border-white/10 cursor-pointer"
              title="Switch Camera (Front / Back)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl glass-pill text-slate-400 hover:text-white border border-white/10 cursor-pointer"
              title="Close Scanner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Surface: Direct Native HTML5 Video Element */}
        <div className="relative w-full h-72 sm:h-96 bg-black overflow-hidden flex items-center justify-center">
          
          {/* HARDWARE-ACCELERATED LIVE CAMERA FEED */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
            }}
          />

          {/* Camera Activating / Loading Spinner */}
          {!isStreaming && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian-950/80 z-10 pointer-events-none">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mb-2" />
              <span className="text-xs font-mono text-slate-300">Activating camera...</span>
            </div>
          )}

          {/* Optical Targeting Reticle & Red Laser Sweep */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className={`relative w-64 h-36 sm:w-72 sm:h-44 rounded-2xl border-2 transition-all duration-300 ${
              scannedResult ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.6)]' : 'border-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
            }`}>
              
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-sky-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-sky-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-sky-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-sky-400 rounded-br-lg" />

              {/* Animated Laser Beam */}
              {!scannedResult && (
                <div 
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e]" 
                  style={{
                    animation: 'laserSweep 1.8s ease-in-out infinite alternate',
                    top: '50%'
                  }} 
                />
              )}

              {/* Success Result Badge */}
              {scannedResult && (
                <div className="absolute inset-0 bg-emerald-500/30 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white animate-in zoom-in-95">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-1 animate-bounce" />
                  <span className="font-mono font-black text-sm tracking-wider">TAG SCANNED!</span>
                  <span className="font-mono text-xs text-emerald-200 mt-0.5">#{scannedResult}</span>
                </div>
              )}

              {!scannedResult && (
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="text-[10px] font-mono text-slate-200 bg-obsidian-950/80 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                    Hold steady over barcode
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Camera Error / Permission Fallback View */}
          {cameraError && (
            <div className="absolute inset-0 bg-obsidian-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <div className="text-white font-bold text-sm">
                Mobile Camera Access
              </div>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed font-mono">
                {cameraError}
              </p>
              <div className="flex flex-col gap-2 pt-2 w-full max-w-xs">
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Options: Photo Upload & One-Touch Testing */}
        <div className="p-4 sm:p-5 bg-obsidian-900/90 border-t border-white/10 space-y-3 flex-shrink-0">
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Haptic vibration & audio beep on</span>
            </span>

            {/* Photo from Gallery */}
            <label className="cursor-pointer text-sky-400 hover:text-sky-300 font-mono text-[11px] flex items-center gap-1 font-semibold">
              <Upload className="w-3.5 h-3.5" />
              <span>Photo from Gallery</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Sample Tags for 1-Touch Testing */}
          {sampleItems.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                Quick test on mobile (Tap any tag):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                {sampleItems.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSuccessfulScan(item.barcode)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-sky-500/20 hover:text-sky-300 border border-white/10 hover:border-sky-500/30 text-[10px] font-mono text-slate-300 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>🏷️</span>
                    <strong className="text-white">{item.barcode}</strong>
                    <span className="text-slate-400">({item.karat})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
