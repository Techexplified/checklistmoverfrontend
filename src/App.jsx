import React from 'react';
import { TrelloProvider, useTrello } from './context/TrelloContext';
import TrelloHeader from './components/TrelloHeader';
import TrelloCardView from './components/TrelloCardView';
import TrelloBoardView from './components/TrelloBoardView';
import ChecklistMoverModal from './components/ChecklistMoverModal';
import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h3 style={{ color: '#E11D48', marginBottom: '8px' }}>Something went wrong</h3>
          <p style={{ color: '#4B5563', fontSize: '13px', marginBottom: '16px' }}>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#0065FF', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Reload Power-Up
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainLayout() {
  const { viewMode, isModalOpen, isInsideTrello } = useTrello();

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
    <ErrorBoundary>
      <TrelloProvider>
        <MainLayout />
      </TrelloProvider>
    </ErrorBoundary>
  );
}
