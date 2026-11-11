import React from 'react';
import { TrelloProvider, useTrello } from './context/TrelloContext';
import TrelloHeader from './components/TrelloHeader';
import TrelloCardView from './components/TrelloCardView';
import TrelloBoardView from './components/TrelloBoardView';
import ChecklistMoverModal from './components/ChecklistMoverModal';
import './App.css';

function MainLayout() {
  const { viewMode, isModalOpen, isInsideTrello } = useTrello();

  // If running inside Trello iframe directly or in modal-only mode
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isDirectModal = urlParams?.get('trello') === '1' || urlParams?.get('mode') === 'modal';

  if (isDirectModal || isInsideTrello) {
    return (
      <div className="trello-iframe-standalone">
        <ChecklistMoverModal />
      </div>
    );
  }

  return (
    <div className="trello-app-container">
      <TrelloHeader />
      <main className="trello-main-content">
        {viewMode === 'board' ? <TrelloBoardView /> : <TrelloCardView />}
      </main>
      {isModalOpen && <ChecklistMoverModal />}
    </div>
  );
}

export default function App() {
  return (
    <TrelloProvider>
      <MainLayout />
    </TrelloProvider>
  );
}
