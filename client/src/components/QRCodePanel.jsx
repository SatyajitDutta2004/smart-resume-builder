import { useState } from 'react';
import QRCode from 'qrcode.react';

export default function QRCodePanel({ portfolio, linkedin, github }) {
  const [showQR, setShowQR] = useState(false);
  const [qrType, setQrType] = useState('portfolio');

  const getQRValue = () => {
    switch (qrType) {
      case 'linkedin':
        return linkedin || 'https://linkedin.com';
      case 'github':
        return github || 'https://github.com';
      case 'portfolio':
      default:
        return portfolio || 'https://portfolio.example.com';
    }
  };

  const downloadQR = () => {
    const qrElement = document.querySelector('.qr-code-display canvas');
    if (qrElement) {
      const link = document.createElement('a');
      link.href = qrElement.toDataURL('image/png');
      link.download = `${qrType}-qr-code.png`;
      link.click();
    }
  };

  if (!portfolio && !linkedin && !github) {
    return null;
  }

  return (
    <div className="qr-code-panel">
      <button
        className="secondary qr-toggle"
        onClick={() => setShowQR(!showQR)}
        type="button"
      >
        QR Code
      </button>

      {showQR && (
        <div className="qr-code-container">
          <div className="qr-code-selector">
            {portfolio && (
              <button
                className={qrType === 'portfolio' ? '' : 'secondary'}
                onClick={() => setQrType('portfolio')}
                type="button"
              >
                Portfolio
              </button>
            )}
            {linkedin && (
              <button
                className={qrType === 'linkedin' ? '' : 'secondary'}
                onClick={() => setQrType('linkedin')}
                type="button"
              >
                LinkedIn
              </button>
            )}
            {github && (
              <button
                className={qrType === 'github' ? '' : 'secondary'}
                onClick={() => setQrType('github')}
                type="button"
              >
                GitHub
              </button>
            )}
          </div>

          <div className="qr-code-display">
            <QRCode value={getQRValue()} size={200} level="H" />
          </div>

          <button className="secondary" onClick={downloadQR} type="button">
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}
