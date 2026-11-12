import React, { useState, useEffect, useRef } from 'react';
import { useTrello } from '../context/TrelloContext';
import Stepper from './Stepper';
import { TransferIllustration, SuccessCelebration } from './Illustration';
import {
  X,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Check,
  ChevronDown,
  ExternalLink,
  Info,
  Layers,
  Copy,
  BookOpen
} from 'lucide-react';

export default function ChecklistMoverModal() {
  const {
    cards,
    modalSourceCard,
    closeModal,
    executeTransfer,
    changeSourceCard,
    board
  } = useTrello();

  // Wizard state: 1: Select Items, 2: Destination, 3: Review, 4: Processing, 5: Success
  const [step, setStep] = useState(1);
  const { isLoading } = useTrello();

  // Source card dropdown toggle
  const [isSourceCardDropdownOpen, setIsSourceCardDropdownOpen] = useState(false);
  const sourceCardDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sourceCardDropdownRef.current && !sourceCardDropdownRef.current.contains(event.target)) {
        setIsSourceCardDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Step 1 state
  const availableChecklists = modalSourceCard?.checklists || [];
  const [selectedChecklistId, setSelectedChecklistId] = useState(
    availableChecklists[0]?.id || ''
  );

  useEffect(() => {
    if (availableChecklists.length > 0) {
      if (!selectedChecklistId || !availableChecklists.some(c => c.id === selectedChecklistId)) {
        setSelectedChecklistId(availableChecklists[0].id);
      }
    } else {
      setSelectedChecklistId('');
    }
  }, [availableChecklists]);

  const currentChecklist =
    availableChecklists.find(c => c.id === selectedChecklistId) || availableChecklists[0];

  const currentItems = currentChecklist?.items || [];

  const [selectedItemIds, setSelectedItemIds] = useState([]);

  // Auto select items when checklist or source card changes
  useEffect(() => {
    if (modalSourceCard?.id) {
      const firstChecklist = modalSourceCard.checklists?.[0];
      if (firstChecklist) {
        setSelectedChecklistId(firstChecklist.id);
        setSelectedItemIds((firstChecklist.items || []).map(i => i.id));
      } else {
        setSelectedChecklistId('');
        setSelectedItemIds([]);
      }
    }
  }, [modalSourceCard?.id]);

  useEffect(() => {
    if (selectedChecklistId && currentChecklist) {
      setSelectedItemIds((currentChecklist.items || []).map(i => i.id));
    }
  }, [selectedChecklistId]);

  // Step 2 state
  // Filter out the source card or allow destination card
  const destinationCards = cards.filter(c => c.id !== modalSourceCard?.id);
  const availableDestCards = destinationCards.length > 0 ? destinationCards : (cards.length > 0 ? cards : [modalSourceCard]);
  const [destCardId, setDestCardId] = useState(availableDestCards[0]?.id || '');

  useEffect(() => {
    if (availableDestCards.length > 0 && (!destCardId || !availableDestCards.some(c => c.id === destCardId))) {
      setDestCardId(availableDestCards[0].id);
    }
  }, [availableDestCards]);

  const chosenDestCard = cards.find(c => c.id === destCardId) || availableDestCards[0] || modalSourceCard;
  const destChecklists = chosenDestCard?.checklists || [];

  const [checklistMode, setChecklistMode] = useState(destChecklists.length > 0 ? 'existing' : 'new');
  const [destChecklistId, setDestChecklistId] = useState(destChecklists[0]?.id || '');
  const [newChecklistName, setNewChecklistName] = useState('New Checklist');
  const [actionType, setActionType] = useState('move'); // 'move' | 'copy'

  // Step 4 (Processing) state
  const [progressPercent, setProgressPercent] = useState(0);
  const [processingSubStep, setProcessingSubStep] = useState(1); // 1, 2, 3

  // Keep destChecklistId valid when dest card changes
  useEffect(() => {
    if (chosenDestCard?.checklists?.length) {
      setDestChecklistId(chosenDestCard.checklists[0].id);
    } else {
      setChecklistMode('new');
    }
  }, [destCardId, chosenDestCard]);

  // Handle Select All
  const areAllSelected = currentItems.length > 0 && selectedItemIds.length === currentItems.length;

  const handleToggleSelectAll = () => {
    if (areAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(currentItems.map(i => i.id));
    }
  };

  const handleToggleItem = (itemId) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Start processing transition
  const handleConfirmTransfer = async () => {
    setStep(4);
    setProgressPercent(15);
    setProcessingSubStep(1);

    setTimeout(() => {
      setProgressPercent(55);
      setProcessingSubStep(2);
    }, 700);

    setTimeout(() => {
      setProgressPercent(90);
      setProcessingSubStep(3);
    }, 1400);

    setTimeout(async () => {
      setProgressPercent(100);
      try {
        await executeTransfer({
          sourceCardId: modalSourceCard.id,
          sourceChecklistId: currentChecklist.id,
          itemIds: selectedItemIds,
          destCardId: chosenDestCard.id,
          destChecklistId,
          isNewChecklist: checklistMode === 'new',
          newChecklistName,
          action: actionType
        });
        setStep(5);
      } catch (err) {
        console.error(err);
        alert('Transfer failed: ' + err.message);
        setStep(3);
      }
    }, 2000);
  };

  const selectedItemsList = currentItems.filter(item => selectedItemIds.includes(item.id));
  const chosenDestChecklist = destChecklists.find(ch => ch.id === destChecklistId);
  const destChecklistDisplayName =
    checklistMode === 'new'
      ? newChecklistName || 'New Checklist'
      : chosenDestChecklist?.name || 'Development Tasks';

  return (
    <div className="modal-backdrop" onClick={(e) => {
      if (e.target.classList.contains('modal-backdrop')) closeModal();
    }}>
      <div className="modal-window">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="mover-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" className="header-swap-icon">
                <path d="M4 8h15m0 0l-4-4m4 4l-4 4" stroke="#0065FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 16H5m0 0l4-4m-4 4l4 4" stroke="#0065FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="modal-title">Checklist Mover</h2>
          </div>
          <button className="modal-close-btn" onClick={closeModal} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Wizard Stepper */}
        <Stepper currentStep={step <= 3 ? step : 3} />

        {isLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div className="spinner-circle blue" style={{ margin: '0 auto 12px', width: '32px', height: '32px', borderWidth: '3px' }}></div>
            <p style={{ color: '#5E6C84', fontSize: '14px', fontWeight: 600 }}>Loading card data from Trello...</p>
          </div>
        ) : (
          <>
            {/* STEP 1: SELECT ITEMS */}
            {step === 1 && (
              <div className="step-content step-1">
                {/* Source Card Box */}
                <div className="source-card-badge-box">
                  <div className="source-card-left">
                    <div className="card-symbol-box">
                      <div className="card-window-icon"></div>
                    </div>
                    <div className="source-card-text-group">
                      <div className="source-card-meta">Source Card</div>
                      {cards.length > 1 ? (
                        <div className="source-card-custom-dropdown" ref={sourceCardDropdownRef}>
                          <button
                            type="button"
                            className="source-card-trigger-btn"
                            onClick={() => setIsSourceCardDropdownOpen(!isSourceCardDropdownOpen)}
                            title="Click to switch source card"
                          >
                            <span className="source-card-trigger-name">{modalSourceCard?.title || 'Current Card'}</span>
                            <ChevronDown
                              size={14}
                              className={`source-clean-chevron ${isSourceCardDropdownOpen ? 'rotated' : ''}`}
                            />
                          </button>

                          {isSourceCardDropdownOpen && (
                            <div className="source-card-menu-popover">
                              <div className="menu-popover-header">Switch Source Card</div>
                              <div className="menu-popover-list">
                                {cards.map(c => {
                                  const isSelected = c.id === modalSourceCard?.id;
                                  const totalItems = c.checklists?.reduce((sum, ch) => sum + (ch.items?.length || 0), 0) || 0;
                                  return (
                                    <div
                                      key={c.id}
                                      className={`menu-popover-item ${isSelected ? 'selected' : ''}`}
                                      onClick={() => {
                                        changeSourceCard(c.id);
                                        setIsSourceCardDropdownOpen(false);
                                      }}
                                    >
                                      <div className="popover-item-content">
                                        <span className="popover-item-title">{c.title}</span>
                                        <span className="popover-item-items-count">{totalItems} checklist items</span>
                                      </div>
                                      {isSelected && <Check size={14} className="popover-item-check" />}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="source-card-name">{modalSourceCard?.title || 'Current Card'}</div>
                      )}
                    </div>
                  </div>
                  <div className="board-badge">
                    <BookOpen size={14} className="board-badge-icon" />
                    <span>Board: {board.name}</span>
                  </div>
                </div>

            {/* Select Checklist dropdown */}
            {availableChecklists.length > 0 ? (
              <div className="form-group">
                <label className="form-label">Select Checklist</label>
                <div className="custom-select-wrapper">
                  <select
                    className="custom-select"
                    value={selectedChecklistId}
                    onChange={(e) => {
                      setSelectedChecklistId(e.target.value);
                      setSelectedItemIds([]);
                    }}
                  >
                    {availableChecklists.map(chk => (
                      <option key={chk.id} value={chk.id}>
                        {chk.name} ({chk.items?.length || 0} items)
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-arrow" />
                </div>
              </div>
            ) : (
              <div className="review-alert-banner alert-info" style={{ marginTop: '8px' }}>
                <div className="alert-icon-circle blue">
                  <Info size={16} color="#0065FF" strokeWidth={2.5} />
                </div>
                <div className="alert-message-text">
                  No checklists found on this card yet. Please add a checklist to this card in Trello first.
                </div>
              </div>
            )}

            {/* Checklist Items Card */}
            <div className="checklist-selection-card">
              <div className="selection-header-row">
                <label className="checkbox-custom-label select-all-label">
                  <input
                    type="checkbox"
                    checked={areAllSelected}
                    onChange={handleToggleSelectAll}
                  />
                  <span className="checkbox-box">
                    {areAllSelected && <Check size={13} strokeWidth={3} />}
                  </span>
                  <span className="label-text">Select All ({currentItems.length})</span>
                </label>
                <span className="selected-counter-badge">
                  {selectedItemIds.length} selected
                </span>
              </div>

              <div className="checklist-items-scroll">
                {currentItems.map(item => {
                  const isChecked = selectedItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`checklist-item-row ${isChecked ? 'item-selected-bg' : ''}`}
                      onClick={() => handleToggleItem(item.id)}
                    >
                      <label className="checkbox-custom-label" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleItem(item.id)}
                        />
                        <span className="checkbox-box">
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </span>
                      </label>
                      <span className="item-text">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn-secondary-link" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn-primary"
                disabled={selectedItemIds.length === 0}
                onClick={() => setStep(2)}
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DESTINATION */}
        {step === 2 && (
          <div className="step-content step-2">
            {/* Destination Card */}
            <div className="form-group">
              <label className="form-label">Destination Card (Same Board)</label>
              <div className="custom-select-wrapper">
                <div className="select-left-icon">
                  <div className="card-window-icon small"></div>
                </div>
                <select
                  className="custom-select with-left-icon"
                  value={destCardId}
                  onChange={(e) => setDestCardId(e.target.value)}
                >
                  {availableDestCards.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} {c.id === modalSourceCard?.id ? '(Current Card)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="select-arrow" />
              </div>
            </div>

            {/* Destination Checklist Mode */}
            <div className="form-group">
              <label className="form-label">Destination Checklist</label>
              <div className="radio-group-horizontal">
                <label className="radio-custom-label">
                  <input
                    type="radio"
                    name="checklistMode"
                    value="existing"
                    checked={checklistMode === 'existing'}
                    onChange={() => setChecklistMode('existing')}
                  />
                  <span className="radio-circle"></span>
                  <span className="radio-text">Existing Checklist</span>
                </label>

                <label className="radio-custom-label">
                  <input
                    type="radio"
                    name="checklistMode"
                    value="new"
                    checked={checklistMode === 'new'}
                    onChange={() => setChecklistMode('new')}
                  />
                  <span className="radio-circle"></span>
                  <span className="radio-text">Create New Checklist</span>
                </label>
              </div>

              {checklistMode === 'existing' ? (
                <div className="custom-select-wrapper mt-2">
                  <div className="select-left-icon">
                    <Check size={16} strokeWidth={2.5} color="#172B4D" />
                  </div>
                  <select
                    className="custom-select with-left-icon"
                    value={destChecklistId}
                    onChange={(e) => setDestChecklistId(e.target.value)}
                  >
                    {destChecklists.map(chk => (
                      <option key={chk.id} value={chk.id}>
                        {chk.name} ({chk.items.length} items)
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-arrow" />
                </div>
              ) : (
                <div className="mt-2">
                  <input
                    type="text"
                    className="text-input"
                    value={newChecklistName}
                    placeholder="Checklist title..."
                    onChange={(e) => setNewChecklistName(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Action Selection (Move or Copy) */}
            <div className="form-group">
              <label className="form-label">Action</label>
              <div className="action-cards-grid">
                {/* Move Option Card */}
                <div
                  className={`action-card ${actionType === 'move' ? 'action-card-selected' : ''}`}
                  onClick={() => setActionType('move')}
                >
                  <div className="action-card-header">
                    <span className={`radio-circle ${actionType === 'move' ? 'checked' : ''}`}></span>
                    <div className="action-card-icon-title">
                      <svg viewBox="0 0 24 24" fill="none" className="inline-action-icon move-blue">
                        <path d="M4 8h15m0 0l-4-4m4 4l-4 4" stroke="#0065FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 16H5m0 0l4-4m-4 4l4 4" stroke="#0065FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="action-name">Move</span>
                    </div>
                  </div>
                  <p className="action-card-desc">
                    Transfer selected items and remove them from the source card.
                  </p>
                </div>

                {/* Copy Option Card */}
                <div
                  className={`action-card ${actionType === 'copy' ? 'action-card-selected' : ''}`}
                  onClick={() => setActionType('copy')}
                >
                  <div className="action-card-header">
                    <span className={`radio-circle ${actionType === 'copy' ? 'checked' : ''}`}></span>
                    <div className="action-card-icon-title">
                      <Copy size={18} color="#0065FF" strokeWidth={2.2} />
                      <span className="action-name">Copy</span>
                    </div>
                  </div>
                  <p className="action-card-desc">
                    Duplicate selected items and keep them in the source card.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn-back" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button className="btn-primary" onClick={() => setStep(3)}>
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 3 && (
          <div className="step-content step-3">
            <div className="review-title-section">
              <h3 className="review-title">
                Review & Confirm {actionType === 'copy' ? '(Copy)' : ''}
              </h3>
              <p className="review-subtitle">
                Verify the details below and confirm to {actionType} the selected items.
              </p>
            </div>

            {/* Summary Details Card */}
            <div className="review-summary-card">
              {/* Action row */}
              <div className="review-summary-row header-action-row">
                <span className="review-row-label">Action</span>
                <div className="review-action-badge">
                  {actionType === 'move' ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" className="badge-action-icon">
                        <path d="M4 8h15m0 0l-4-4m4 4l-4 4" stroke="#0065FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 16H5m0 0l4-4m-4 4l4 4" stroke="#0065FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Move</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} color="#0065FF" strokeWidth={2.2} />
                      <span>Copy</span>
                    </>
                  )}
                </div>
              </div>

              {/* From Card */}
              <div className="review-summary-row">
                <span className="review-row-subheading">From (Source Card)</span>
                <div className="card-link-item">
                  <div className="card-window-icon tiny"></div>
                  <div className="card-link-texts">
                    <span className="card-link-title">{modalSourceCard?.title || 'Source Card'}</span>
                    <span className="card-link-subtitle">{currentChecklist?.name || 'Checklist'}</span>
                  </div>
                </div>
              </div>

              {/* Items to Move / Copy */}
              <div className="review-summary-row">
                <span className="review-row-subheading">
                  Items to {actionType === 'move' ? 'Move' : 'Copy'} ({selectedItemsList.length})
                </span>
                <ul className="review-items-bullet-list">
                  {selectedItemsList.map(item => (
                    <li key={item.id} className="review-bullet-item">
                      <span className="bullet-dot">•</span>
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Down Arrow Divider */}
              <div className="review-arrow-divider">
                <ArrowDown size={16} strokeWidth={2.5} color="#0065FF" />
              </div>

              {/* To Card */}
              <div className="review-summary-row">
                <span className="review-row-subheading">To (Destination Card)</span>
                <div className="card-link-item">
                  <div className="card-window-icon tiny"></div>
                  <div className="card-link-texts">
                    <span className="card-link-title">{chosenDestCard?.title || 'Destination Card'}</span>
                    <span className="card-link-subtitle">{destChecklistDisplayName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning or Info Banner */}
            {actionType === 'move' ? (
              <div className="review-alert-banner alert-warning">
                <div className="alert-icon-circle yellow">
                  <Info size={16} color="#B45309" strokeWidth={2.5} />
                </div>
                <div className="alert-message-text">
                  <strong>Move</strong> will add the selected items to the destination checklist and remove them from the source checklist.
                </div>
              </div>
            ) : (
              <div className="review-alert-banner alert-info">
                <div className="alert-icon-circle blue">
                  <Info size={16} color="#0065FF" strokeWidth={2.5} />
                </div>
                <div className="alert-message-text">
                  A copy will be added to the destination checklist. The original items will remain in the source checklist.
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn-back" onClick={() => setStep(2)}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button className="btn-primary" onClick={handleConfirmTransfer}>
                <span>Confirm {actionType === 'move' ? 'Move' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROCESSING / PROGRESS */}
        {step === 4 && (
          <div className="step-content step-processing">
            <TransferIllustration action={actionType} />

            <h3 className="processing-heading">
              {actionType === 'move'
                ? `Moving ${selectedItemsList.length} items...`
                : `Copying ${selectedItemsList.length} items...`}
            </h3>

            {/* Animated Progress Bar */}
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Process Sub-steps */}
            <div className="processing-status-list">
              {actionType === 'move' ? (
                <>
                  <div className={`process-status-item ${processingSubStep >= 1 ? 'done' : 'waiting'}`}>
                    <span className="status-indicator-icon">
                      {processingSubStep > 1 ? (
                        <span className="circle-check green"><Check size={12} strokeWidth={3} /></span>
                      ) : (
                        <span className="spinner-circle blue"></span>
                      )}
                    </span>
                    <span className="status-item-text">Creating items in destination checklist...</span>
                  </div>

                  <div className={`process-status-item ${processingSubStep >= 2 ? (processingSubStep > 2 ? 'done' : 'active') : 'waiting'}`}>
                    <span className="status-indicator-icon">
                      {processingSubStep > 2 ? (
                        <span className="circle-check green"><Check size={12} strokeWidth={3} /></span>
                      ) : processingSubStep === 2 ? (
                        <span className="spinner-circle blue"></span>
                      ) : (
                        <span className="circle-pending"></span>
                      )}
                    </span>
                    <span className="status-item-text">Removing items from source checklist...</span>
                  </div>

                  <div className={`process-status-item ${processingSubStep >= 3 ? 'done' : 'waiting'}`}>
                    <span className="status-indicator-icon">
                      {processingSubStep >= 3 ? (
                        <span className="spinner-circle blue"></span>
                      ) : (
                        <span className="circle-pending"></span>
                      )}
                    </span>
                    <span className="status-item-text">Finishing up...</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={`process-status-item ${processingSubStep >= 1 ? 'done' : 'waiting'}`}>
                    <span className="status-indicator-icon">
                      {processingSubStep > 1 ? (
                        <span className="circle-check green"><Check size={12} strokeWidth={3} /></span>
                      ) : (
                        <span className="spinner-circle blue"></span>
                      )}
                    </span>
                    <span className="status-item-text">Creating copies in destination checklist...</span>
                  </div>

                  <div className={`process-status-item ${processingSubStep >= 2 ? (processingSubStep > 2 ? 'done' : 'active') : 'waiting'}`}>
                    <span className="status-indicator-icon">
                      {processingSubStep > 2 ? (
                        <span className="circle-check green"><Check size={12} strokeWidth={3} /></span>
                      ) : processingSubStep === 2 ? (
                        <span className="spinner-circle blue"></span>
                      ) : (
                        <span className="circle-pending"></span>
                      )}
                    </span>
                    <span className="status-item-text">Finalizing...</span>
                  </div>

                  <div className={`process-status-item ${processingSubStep >= 3 ? 'done' : 'waiting'}`}>
                    <span className="status-indicator-icon">
                      {processingSubStep >= 3 ? (
                        <span className="spinner-circle blue"></span>
                      ) : (
                        <span className="circle-pending"></span>
                      )}
                    </span>
                    <span className="status-item-text">Almost done...</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 5 && (
          <div className="step-content step-success">
            <SuccessCelebration />

            <h3 className="success-heading">
              {actionType === 'move' ? 'Move Completed!' : 'Copy Completed!'}
            </h3>
            <p className="success-subtitle">
              {selectedItemsList.length} items were {actionType === 'move' ? 'moved' : 'copied'} successfully.
            </p>

            {/* Transfer Path Box */}
            <div className="success-transfer-box">
              <div className="transfer-path-header">
                <div className="path-node">
                  <span className="path-node-label">From</span>
                  <div className="path-card-info">
                    <div className="card-window-icon tiny"></div>
                    <div>
                      <div className="path-card-title">{modalSourceCard?.title || 'Source Card'}</div>
                      <div className="path-chk-title">{currentChecklist?.name || 'Checklist'}</div>
                    </div>
                  </div>
                </div>

                <div className="path-arrow">
                  <ArrowRight size={18} color="#0065FF" strokeWidth={2.5} />
                </div>

                <div className="path-node">
                  <span className="path-node-label">To</span>
                  <div className="path-card-info">
                    <div className="card-window-icon tiny"></div>
                    <div>
                      <div className="path-card-title">{chosenDestCard?.title || 'Destination Card'}</div>
                      <div className="path-chk-title">{destChecklistDisplayName}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Green list of completed items */}
              <div className="success-items-list-box">
                {selectedItemsList.map(item => (
                  <div key={item.id} className="success-item-row">
                    <Check size={16} strokeWidth={2.5} color="#22C55E" className="mr-2" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer success-footer">
              <button
                className="btn-outline-action"
                onClick={() => {
                  if (chosenDestCard?.id) setActiveCardId(chosenDestCard.id);
                  closeModal();
                }}
              >
                <span>View Destination Card</span>
                <ExternalLink size={15} />
              </button>
              <button className="btn-primary" onClick={closeModal}>
                Done
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

