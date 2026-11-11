import React, { useState } from 'react';
import { useTrello } from '../context/TrelloContext';
import {
  RotateCcw,
  Sparkles,
  ExternalLink,
  Settings,
  Layers,
  Key,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function TrelloHeader() {
  const {
    activeCardId,
    setActiveCardId,
    cards,
    openModal,
    resetData,
    viewMode,
    setViewMode,
    apiConfig,
    setApiConfig
  } = useTrello();

  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(apiConfig.apiKey || '');
  const [tokenInput, setTokenInput] = useState(apiConfig.token || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveApi = () => {
    setApiConfig({ apiKey: apiKeyInput.trim(), token: tokenInput.trim() });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <>
      <header className="trello-global-nav">
        <div className="nav-left">
          <div className="trello-nav-brand">
            <div className="trello-icon-box">
              <span className="trello-col-bar bar-1"></span>
              <span className="trello-col-bar bar-2"></span>
            </div>
            <span className="trello-brand-name">Trello</span>
          </div>

          <div className="board-selector-pill">
            <span className="board-name">Website Redesign</span>
          </div>

          <div className="quick-card-switchers">
            <button
              className={`switcher-pill ${activeCardId === 'card-source' && viewMode === 'card' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('card');
                setActiveCardId('card-source');
              }}
              title="Image 1: Source card with checklist"
            >
              <span className="dot dot-blue"></span>
              <span>Source Card (Website Redesign)</span>
            </button>

            <button
              className={`switcher-pill ${activeCardId === 'card-dest' && viewMode === 'card' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('card');
                setActiveCardId('card-dest');
              }}
              title="Image 10: Destination card with moved items badge"
            >
              <span className="dot dot-green"></span>
              <span>Destination Card (Sprint Planning)</span>
            </button>

            <button
              className={`switcher-pill ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              title="View all board lists and cards"
            >
              <Layers size={14} />
              <span>Board View</span>
            </button>
          </div>
        </div>

        <div className="nav-right">
          {/* Quick Launch Button */}
          <button
            className="nav-btn-highlight"
            onClick={() => openModal(activeCardId)}
            title="Launch Checklist Mover"
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-swap-svg">
              <path d="M4 8h15m0 0l-4-4m4 4l-4 4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 16H5m0 0l4-4m-4 4l4 4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Open Checklist Mover</span>
          </button>

          {/* Reset Demo Button */}
          <button className="nav-btn-subtle" onClick={resetData} title="Reset demo data">
            <RotateCcw size={15} />
            <span>Reset Demo</span>
          </button>

          {/* Settings / Power-Up Info */}
          <button
            className="nav-btn-icon"
            onClick={() => setShowSettings(true)}
            title="Trello Power-Up Setup & API Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </header>

      {/* Settings / Live Power-Up Modal */}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal-window settings-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Settings size={20} color="#0065FF" />
                <h3 className="modal-title">Trello Power-Up Configuration</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowSettings(false)}>
                ✕
              </button>
            </div>

            <div className="settings-modal-body">
              <div className="settings-info-box">
                <h4>🚀 How to use this Power-Up in your real Trello:</h4>
                <ol className="settings-steps-list">
                  <li>
                    Go to <strong>https://trello.com/power-ups/admin</strong>
                  </li>
                  <li>Click <strong>New Power-Up</strong> and name it <code>Checklist Mover</code>.</li>
                  <li>Set <strong>Iframe connector URL</strong> to this app's URL + <code>/connector.html</code></li>
                  <li>Add the Power-Up to your Trello boards! The button will appear under <strong>Power-Ups</strong> on your cards.</li>
                </ol>
              </div>

              <div className="settings-divider"></div>

              <div className="form-group">
                <label className="form-label">
                  <Key size={15} className="inline mr-1" />
                  Optional: Connect Real Trello REST API
                </label>
                <p className="form-help-text">
                  Provide your Trello API Key and Token if you wish to run live checklist transfers against real Trello boards directly from this test interface.
                </p>

                <div className="mb-3">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Trello API Key</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Enter Trello API Key"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Trello Token</label>
                  <input
                    type="password"
                    className="text-input"
                    placeholder="Enter Trello API Token"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button className="btn-primary" onClick={handleSaveApi}>
                    Save API Keys
                  </button>
                  {saveSuccess && (
                    <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 size={16} /> Saved!
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary-link" onClick={() => setShowSettings(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
