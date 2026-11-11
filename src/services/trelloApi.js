// Trello API and Power-Up helper utilities

export function isTrelloIframe() {
  return typeof window !== 'undefined' && window.self !== window.top && !!window.TrelloPowerUp;
}

export function getTrelloIframeInstance() {
  if (isTrelloIframe()) {
    try {
      return window.TrelloPowerUp.iframe();
    } catch (e) {
      console.warn('Could not initialize Trello iframe:', e);
      return null;
    }
  }
  return null;
}

// REST API calls (can be used with real Trello API Key and Token)
const TRELLO_BASE = 'https://api.trello.com/1';

export async function fetchTrelloCard(cardId, apiKey, token) {
  const res = await fetch(`${TRELLO_BASE}/cards/${cardId}?checklists=all&key=${apiKey}&token=${token}`);
  if (!res.ok) throw new Error(`Failed to fetch card: ${res.statusText}`);
  return res.json();
}

export async function fetchBoardCards(boardId, apiKey, token) {
  const res = await fetch(`${TRELLO_BASE}/boards/${boardId}/cards?checklists=all&key=${apiKey}&token=${token}`);
  if (!res.ok) throw new Error(`Failed to fetch cards: ${res.statusText}`);
  return res.json();
}

export async function createTrelloChecklist(cardId, name, apiKey, token) {
  const res = await fetch(`${TRELLO_BASE}/cards/${cardId}/checklists?name=${encodeURIComponent(name)}&key=${apiKey}&token=${token}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to create checklist: ${res.statusText}`);
  return res.json();
}

export async function addTrelloCheckItem(checklistId, name, checked = false, apiKey, token) {
  const res = await fetch(`${TRELLO_BASE}/checklists/${checklistId}/checkItems?name=${encodeURIComponent(name)}&checked=${checked}&key=${apiKey}&token=${token}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to add checkItem: ${res.statusText}`);
  return res.json();
}

export async function deleteTrelloCheckItem(checklistId, checkItemId, apiKey, token) {
  const res = await fetch(`${TRELLO_BASE}/checklists/${checklistId}/checkItems/${checkItemId}?key=${apiKey}&token=${token}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`Failed to delete checkItem: ${res.statusText}`);
  return res.json();
}

