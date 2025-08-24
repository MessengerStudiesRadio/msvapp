

import React, { useState, useEffect, useRef, useCallback } from 'react';
import XIcon from './icons/XIcon';
import CameraFlipIcon from './icons/CameraFlipIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import DownloadIcon from './icons/DownloadIcon';
import BackIcon from './icons/BackIcon';

interface CameraModalProps {
    onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMultiCamera, setIsMultiCamera] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async (mode: 'user' | 'environment') => {
        setIsLoading(true);
        setError(null);
        stopCamera();
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API is not supported in your browser.");
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
        } catch (err: any) {
            console.error("Error accessing camera:", err);
            let errorMessage = "Could not access the camera. ";
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                errorMessage += "Please grant camera permission in your browser settings.";
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                errorMessage += "No camera found on this device.";
            } else {
                errorMessage += "An unexpected error occurred.";
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [stopCamera]);
    
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoInputs = devices.filter(device => device.kind === 'videoinput');
                setIsMultiCamera(videoInputs.length > 1);
            });
        
        startCamera(facingMode);

        return () => {
            stopCamera();
        };
    }, [startCamera, facingMode]);

    const handleSwitchCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const handleTakePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
                stopCamera();
            }
        }
    };

    const handleDiscard = () => {
        setCapturedImage(null);
        startCamera(facingMode);
    };

    const handleSave = () => {
        if (capturedImage) {
            const link = document.createElement('a');
            link.href = capturedImage;
            link.download = `msr-capture-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center" role="dialog" aria-modal="true">
            {/* Hidden canvas for taking pictures */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Main view: either camera feed or image preview */}
            <div className="relative w-full h-full flex items-center justify-center">
                {capturedImage ? (
                    <img src={capturedImage} alt="Captured" className="max-w-full max-h-full object-contain" />
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                )}
                
                {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                        <SpinnerIcon className="w-12 h-12 animate-spin" />
                        <p className="mt-4 text-lg">Starting Camera...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-8 text-center">
                        <h3 className="text-xl font-bold text-red-500 mb-4">Camera Error</h3>
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* Top Controls */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-end">
                 <button onClick={onClose} className="p-3 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors" aria-label="Close camera">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            
            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-center w-full max-w-md mx-auto">
                    {capturedImage ? (
                         <div className="flex justify-around w-full">
                            <button onClick={handleDiscard} className="flex flex-col items-center gap-2 p-3 text-white hover:text-gray-300 transition-colors" aria-label="Retake Picture">
                                <BackIcon className="w-7 h-7" />
                                <span className="text-xs font-semibold">RETAKE</span>
                            </button>
                             <button onClick={handleSave} className="flex flex-col items-center gap-2 p-3 text-white hover:text-gray-300 transition-colors" aria-label="Save Picture">
                                <DownloadIcon className="w-7 h-7" />
                                <span className="text-xs font-semibold">SAVE</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-around w-full">
                            <div className="w-16 h-16"></div> {/* Spacer */}
                            <button 
                                onClick={handleTakePicture} 
                                disabled={isLoading || !!error}
                                className="w-20 h-20 rounded-full bg-white border-4 border-white/50 ring-2 ring-black/30 shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" 
                                aria-label="Take Picture"
                            />
                            {isMultiCamera ? (
                                <button onClick={handleSwitchCamera} disabled={isLoading || !!error} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors disabled:opacity-50" aria-label="Switch camera">
                                    <CameraFlipIcon className="w-7 h-7" />
                                </button>
                            ) : (
                                <div className="w-16 h-16" /> /* Spacer */
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraModal;