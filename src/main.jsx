import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// If loaded directly as the Trello hidden connector iframe
if (typeof window !== 'undefined' && window.TrelloPowerUp && window.self !== window.top) {
  const urlParams = new URLSearchParams(window.location.search);
  const isModal = urlParams.get('trello') === '1' || urlParams.get('mode') === 'modal';
  
  if (!isModal) {
    try {
      const ICON_URL = window.location.origin + '/powerup-icon.svg';
      window.TrelloPowerUp.initialize({
        'card-buttons': function(t) {
          return [{
            icon: ICON_URL,
            text: 'Checklist Mover',
            callback: function(t) {
              return t.modal({
                url: './index.html?trello=1',
                title: 'Checklist Mover',
                height: 600,
                fullscreen: false
              });
            }
          }];
        }
      });
    } catch (e) {
      console.warn('Trello connector auto-initialize:', e);
    }
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
