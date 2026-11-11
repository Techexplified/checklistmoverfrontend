import React, { useState } from 'react';
import { useTrello } from '../context/TrelloContext';
import {
  X,
  MoreHorizontal,
  AlignLeft,
  CheckSquare,
  Activity as ActivityIcon,
  UserPlus,
  Tag,
  Calendar,
  Paperclip,
  Image as CoverIcon,
  Plus,
  ArrowRight,
  Copy,
  Info,
  ChevronDown
} from 'lucide-react';

export default function TrelloCardView() {
  const {
    activeCard,
    toggleItemCheck,
    openModal,
    cards,
    setActiveCardId,
    board
  } = useTrello();

  const [activeTab, setActiveTab] = useState('Checklist'); // 'Details' | 'Checklist' | 'Activity'
  const [commentText, setCommentText] = useState('');

  if (!activeCard) return null;

  const totalChecklists = activeCard.checklists || [];

  return (
    <div className="trello-card-modal-container">
      <div className="trello-card-modal">
        {/* Top Header Bar */}
        <div className="trello-card-header">
          <div className="trello-card-title-area">
            <div className="card-window-icon trello-blue-window"></div>
            <div>
              <h1 className="trello-card-title">{activeCard.title}</h1>
              <div className="trello-card-list-name">
                in list <span className="list-name-link">{activeCard.listName || 'In Progress'}</span>
                <ChevronDown size={14} className="inline ml-1" />
              </div>
            </div>
          </div>
          <div className="trello-card-header-actions">
            <button className="icon-btn-subtle" title="More options">
              <MoreHorizontal size={18} />
            </button>
            <button className="icon-btn-subtle" title="Close card">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab navigation (Shown prominently in Image 10) */}
        <div className="trello-card-tabs-nav">
          <button
            className={`tab-nav-btn ${activeTab === 'Details' ? 'active' : ''}`}
            onClick={() => setActiveTab('Details')}
          >
            <AlignLeft size={16} />
            <span>Details</span>
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'Checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('Checklist')}
          >
            <CheckSquare size={16} />
            <span>Checklist</span>
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'Activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('Activity')}
          >
            <ActivityIcon size={16} />
            <span>Activity</span>
          </button>
        </div>

        {/* Card Main Body */}
        <div className="trello-card-layout-grid">
          {/* Main Left Column */}
          <div className="trello-card-main-col">
            {/* Description Section */}
            {(activeTab === 'Details' || activeTab === 'Checklist') && (
              <div className="trello-section">
                <div className="trello-section-header">
                  <AlignLeft size={18} className="trello-section-icon" />
                  <h3 className="trello-section-title">Description</h3>
                </div>
                <div className="trello-description-box">
                  <p>{activeCard.description || 'Add a more detailed description…'}</p>
                </div>
              </div>
            )}

            {/* Checklists Section */}
            {(activeTab === 'Checklist' || activeTab === 'Details') && (
              <div className="trello-section">
                <div className="trello-section-header">
                  <CheckSquare size={18} className="trello-section-icon" />
                  <h3 className="trello-section-title">Checklists</h3>
                </div>

                {totalChecklists.map((checklist) => {
                  const items = checklist.items || [];
                  const completedCount = items.filter(i => i.state === 'complete').length;
                  const totalCount = items.length;
                  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  const isAllComplete = totalCount > 0 && completedCount === totalCount;

                  return (
                    <div key={checklist.id} className="trello-checklist-container">
                      <div className="trello-checklist-header">
                        <div className="checklist-title-left">
                          <CheckSquare size={18} className="checklist-box-icon" />
                          <h4 className="checklist-name">
                            {checklist.name} ({totalCount})
                          </h4>
                        </div>
                        <div className="checklist-header-right">
                          <span className="checklist-fraction">
                            {completedCount}/{totalCount}
                          </span>
                          <div className="trello-progress-bar-wrap">
                            <div
                              className={`trello-progress-bar-fill ${isAllComplete ? 'complete-green' : 'progress-blue'}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          <button className="icon-btn-subtle small">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Checklist Items list */}
                      <div className="trello-checklist-items-list">
                        {items.map((item) => {
                          const isComplete = item.state === 'complete';
                          const isMoved = item.moved;
                          const isCopied = item.copied;

                          return (
                            <div
                              key={item.id}
                              className={`trello-item-row ${isMoved ? 'moved-item-highlight' : ''}`}
                              onClick={() => toggleItemCheck(activeCard.id, checklist.id, item.id)}
                            >
                              <label
                                className="trello-checkbox-label"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isComplete}
                                  onChange={() => toggleItemCheck(activeCard.id, checklist.id, item.id)}
                                />
                                <span className={`trello-checkbox-custom ${isComplete ? (isMoved ? 'moved-check' : 'checked') : ''}`}>
                                  {isComplete && <span className="checkmark-symbol">✓</span>}
                                </span>
                              </label>

                              <span className={`trello-item-title ${isComplete && !isMoved ? 'line-through-text' : ''}`}>
                                {item.name}
                              </span>

                              {/* Moved / Copied badge (Image 10) */}
                              {isMoved && (
                                <span className="moved-item-badge">
                                  <svg viewBox="0 0 24 24" fill="none" className="moved-badge-icon">
                                    <path d="M4 8h15m0 0l-4-4m4 4l-4 4" stroke="#172B4D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M20 16H5m0 0l4-4m-4 4l4 4" stroke="#172B4D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span>Moved</span>
                                </span>
                              )}

                              {isCopied && (
                                <span className="copied-item-badge">
                                  <Copy size={13} strokeWidth={2.2} />
                                  <span>Copied</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button className="btn-add-item">
                        <Plus size={16} />
                        <span>Add an item</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Activity Section */}
            {(activeTab === 'Activity' || activeTab === 'Checklist') && (
              <div className="trello-section">
                <div className="trello-section-header">
                  <ActivityIcon size={18} className="trello-section-icon" />
                  <h3 className="trello-section-title">Activity</h3>
                </div>
                <div className="trello-comment-box-wrap">
                  <div className="avatar-circle">S</div>
                  <input
                    type="text"
                    className="comment-input"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column (Image 1 & 10) */}
          <div className="trello-card-sidebar-col">
            {/* Add to card */}
            <div className="sidebar-group">
              <div className="sidebar-group-title">Add to card</div>
              <button className="sidebar-btn">
                <UserPlus size={15} />
                <span>Members</span>
              </button>
              <button className="sidebar-btn">
                <Tag size={15} />
                <span>Labels</span>
              </button>
              <button className="sidebar-btn">
                <CheckSquare size={15} />
                <span>Checklist</span>
              </button>
              <button className="sidebar-btn">
                <Calendar size={15} />
                <span>Dates</span>
              </button>
              <button className="sidebar-btn">
                <Paperclip size={15} />
                <span>Attachment</span>
              </button>
              <button className="sidebar-btn">
                <CoverIcon size={15} />
                <span>Cover</span>
              </button>
            </div>

            {/* Power-Ups Section (Image 1 & 10) */}
            <div className="sidebar-group">
              <div className="sidebar-group-title">Power-Ups</div>
              {/* PRIMARY POWER-UP BUTTON */}
              <button
                className="sidebar-btn powerup-btn-active pulse-subtle"
                onClick={() => openModal(activeCard.id)}
                title="Launch Checklist Mover"
              >
                <div className="powerup-btn-icon">
                  <svg viewBox="0 0 24 24" fill="none" className="sidebar-swap-svg">
                    <path d="M4 8h15m0 0l-4-4m4 4l-4 4" stroke="#0065FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 16H5m0 0l4-4m-4 4l4 4" stroke="#0065FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="powerup-btn-label">Checklist Mover</span>
              </button>

              <button className="sidebar-btn-subtle">
                <Plus size={15} />
                <span>Add Power-Ups</span>
              </button>
            </div>

            {/* Automation */}
            <div className="sidebar-group">
              <div className="sidebar-group-header-with-info">
                <span className="sidebar-group-title">Automation</span>
                <Info size={14} className="text-gray-400" />
              </div>
              <button className="sidebar-btn-subtle">
                <Plus size={15} />
                <span>Add button</span>
              </button>
            </div>

            {/* Actions */}
            <div className="sidebar-group">
              <div className="sidebar-group-title">Actions</div>
              <button className="sidebar-btn">
                <ArrowRight size={15} />
                <span>Move</span>
              </button>
              <button className="sidebar-btn">
                <Copy size={15} />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

