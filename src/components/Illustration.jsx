import React from 'react';

export function TransferIllustration({ action = 'move' }) {
  return (
    <div className="transfer-illustration-wrap">
      <div className="illustration-bg-blob">
        {/* Left document card */}
        <div className="doc-card">
          <div className="doc-line">
            <svg className="doc-check" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L4.8 8.3L9.5 3.5" stroke="#172B4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="doc-bar"></span>
          </div>
          <div className="doc-line">
            <svg className="doc-check" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L4.8 8.3L9.5 3.5" stroke="#172B4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="doc-bar"></span>
          </div>
          <div className="doc-line">
            <svg className="doc-check" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L4.8 8.3L9.5 3.5" stroke="#172B4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="doc-bar short"></span>
          </div>
        </div>

        {/* Center action icon */}
        <div className="center-transfer-badge">
          {action === 'move' ? (
            <svg className="transfer-icon move-arrows" viewBox="0 0 24 24" fill="none">
              <path d="M4 8h15m0 0l-4-4m4 4l-4 4" stroke="#0065FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 16H5m0 0l4-4m-4 4l4 4" stroke="#0065FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg className="transfer-icon copy-boxes" viewBox="0 0 24 24" fill="none">
              <rect x="8" y="8" width="12" height="12" rx="2.5" stroke="#0065FF" strokeWidth="2.2"/>
              <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke="#0065FF" strokeWidth="2.2"/>
            </svg>
          )}
        </div>

        {/* Right document card */}
        <div className="doc-card">
          <div className="doc-line">
            <svg className="doc-check" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L4.8 8.3L9.5 3.5" stroke="#172B4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="doc-bar"></span>
          </div>
          <div className="doc-line">
            <svg className="doc-check" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L4.8 8.3L9.5 3.5" stroke="#172B4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="doc-bar"></span>
          </div>
          <div className="doc-line">
            <svg className="doc-check" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L4.8 8.3L9.5 3.5" stroke="#172B4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="doc-bar short"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuccessCelebration() {
  return (
    <div className="success-celebration-wrap">
      <div className="celebration-burst">
        {/* Ray 1 */}
        <span className="burst-ray ray-tl" />
        <span className="burst-ray ray-tr" />
        <span className="burst-ray ray-r" />
        <span className="burst-ray ray-br" />
        <span className="burst-ray ray-bl" />
        <span className="burst-ray ray-l" />
        
        <div className="success-check-circle">
          <svg viewBox="0 0 24 24" fill="none" className="success-check-svg">
            <path d="M5 13l4.5 4.5L19 7" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

