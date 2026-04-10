import React, { useState, useEffect } from "react";

interface BiometricScannerProps {
    onSuccess: () => void;
    onCancel: () => void;
    voterName?: string;
}

const BiometricScanner = ({ onSuccess, onCancel, voterName }: BiometricScannerProps) => {
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Identifying...");

    useEffect(() => {
        if (scanning) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + 5;
                    
                    // Update status based on progress
                    if (next < 30) setStatus("Initializing Hardware...");
                    else if (next < 60) setStatus("Mapping Biometric Points...");
                    else if (next < 90) setStatus("Authenticating Identity...");
                    else if (next < 100) setStatus("Securing Session...");

                    if (next >= 100) {
                        clearInterval(interval);
                        setStatus("Verification Successful!");
                        setTimeout(onSuccess, 800);
                        return 100;
                    }
                    return next;
                });
            }, 80); // Slightly slower for better feel
            return () => clearInterval(interval);
        }
    }, [scanning, onSuccess]);

    return (
        <div className="biometric-overlay">
            <div className="biometric-modal">
                <div className="biometric-content">
                    <div className="biometric-icon-header">
                        <i className="bi bi-shield-lock-fill"></i>
                        <h3>Secure Authentication</h3>
                    </div>
                    
                    <p className="text-normal" style={{ marginBottom: '30px' }}>
                        Biometric validation required for <strong>{voterName || "Authorized User"}</strong>.
                    </p>

                    <div 
                        className={`fingerprint-scanner ${scanning ? 'scanning' : ''}`} 
                        onClick={() => !scanning && setScanning(true)}
                    >
                        <i className="bi bi-fingerprint"></i>
                        {!scanning && <div className="tap-to-scan">Tap to Verify</div>}
                        {scanning && <div className="scan-line"></div>}
                        <div className="scanner-glow"></div>
                    </div>

                    <div className="progress-wrapper" style={{ marginTop: '20px' }}>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="verification-status" style={{ color: progress > 90 ? '#14b8a6' : '#94a3b8' }}>
                            {status}
                        </div>
                    </div>

                    <button 
                        onClick={onCancel} 
                        className="button-secondary"
                        style={{ marginTop: '20px', width: '100%' }}
                        disabled={scanning && progress < 100}
                    >
                        {scanning ? "Processing..." : "Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BiometricScanner;
