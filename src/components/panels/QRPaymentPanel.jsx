// src/components/panels/QRPaymentPanel.jsx
import { useState } from 'react';

const QRPaymentPanel = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('show-qr'); // 'show-qr' or 'scan-qr'
  const [qrData, setQrData] = useState(''); // This would be the user's IBAN
  const [scannedData, setScannedData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  // Mock user data - in a real app this would come from auth/Firestore
  const mockUser = {
    iban: 'PK36FNVT0000123456789012',
    name: 'John Doe'
  };

  // Initialize QR data with user's IBAN
  // In a real implementation, we would use a QR code library like 'qrcode'
  // For now, we'll just store the IBAN data
  // When QR code library is integrated, this would generate an actual QR code image

  const handleScanQR = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      // In a real app, this would come from the camera scan
      // For demo, we'll simulate scanning a valid IBAN
      setScannedData('PK36HABB0000987654321098');
      setIsScanning(false);
      setScanResult({
        type: 'iban',
        value: 'PK36HABB0000987654321098',
        formatted: 'PK36 HABB 0000 9876 5432 1098'
      });
    }, 2000);
  };

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real implementation, we would process the image to extract QR code
      // For demo, we'll simulate successful scan
      setUploadedImage(URL.createObjectURL(file));
      setIsScanning(true);
      setTimeout(() => {
        setScannedData('PK36MUCB0000555555555555');
        setIsScanning(false);
        setScanResult({
          type: 'iban',
          value: 'PK36MUCB0000555555555555',
          formatted: 'PK36 MUCB 0000 5555 5555 5555'
        });
      }, 1500);
    }
  };

  const handleScanSuccess = () => {
    // In a real implementation, this would pre-fill the SendMoneyPanel
    alert('QR scanned successfully! In a real app, this would pre-fill the Send Money panel.');
    onClose();
    onSuccess();
  };

  const handleShareQR = () => {
    // In a real implementation, this would use the Web Share API
    alert('Share functionality would be implemented using Web Share API');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 mb-6">
            {/* Drag handle */}
            <div className="w-12 h-0.5 bg-white/20 rounded mb-4" />

            {/* Panel content */}
            <div className="bg-background/90 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">QR Payment</h3>
                <button
                  onClick={onClose}
                  className="text-xs btn-danger py-1 px-2 rounded"
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setActiveTab('show-qr')}
                    className={`flex-1 py-3 px-4 text-center font-medium ${
                      activeTab === 'show-qr'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    Show My QR
                  </button>
                  <button
                    onClick={() => setActiveTab('scan-qr')}
                    className={`flex-1 py-3 px-4 text-center font-medium ${
                      activeTab === 'scan-qr'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    Scan QR
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'show-qr' && (
                <>
                  <div className="text-center mb-6">
                    {/* In a real implementation, this would display an actual QR code image */}
                    <div className="w-40 h-40 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-text-secondary">QR CODE</span>
                      <span className="text-xs text-text-secondary mt-2 block">
                        {mockUser.iban}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">
                      Scan this QR code to receive payments
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                      IBAN: {mockUser.iban}
                    </p>
                    <button
                      onClick={handleShareQR}
                      className="mt-4 btn-secondary py-2 px-4 rounded-lg w-full"
                    >
                      Share QR Code
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'scan-qr' && (
                <>
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <p className="text-sm text-text-muted">
                        Point camera at QR code to scan
                      </p>

                      {/* Camera preview would go here in a real implementation */}
                      <div className="w-40 h-40 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-text-secondary">CAMERA</span>
                        {isScanning && (
                          <span className="animate-pulse ml-2">●</span>
                        )}
                      </div>

                      <button
                        onClick={handleScanQR}
                        className="w-full btn-secondary py-2 px-4 rounded-lg"
                        disabled={isScanning}
                      >
                        {isScanning ? <><span>🔄</span>Scanning</> : <><span>📷</span>Scan QR Code</>}
                      </button>

                      {/* File upload for desktop */}
                      <div className="mt-6">
                        <p className="text-sm text-text-muted mb-2">
                          Or upload QR image (desktop):
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadImage}
                          className="w-full"
                        />
                        {uploadedImage && (
                          <div className="mt-4">
                            <img
                              src={uploadedImage}
                              alt="Uploaded QR"
                              className="w-40 h-40 object-contain rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scan results */}
                    {scanResult && (
                      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="font-semibold mb-2">Scan Result:</p>
                        <p className="text-xs text-text-muted mb-1">
                          Type: {scanResult.type.toUpperCase()}
                        </p>
                        <p className="font-mono mb-1">
                          Value: {scanResult.value}
                        </p>
                        <p className="text-xs text-text-muted">
                          Formatted: {scanResult.formatted}
                        </p>
                        <button
                          onClick={handleScanSuccess}
                          className="mt-3 w-full btn-primary py-2 px-4 rounded-lg"
                        >
                          Use This QR Code
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRPaymentPanel;