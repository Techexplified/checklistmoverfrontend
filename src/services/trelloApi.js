// Trello API and Power-Up helper utilities

export const DEFAULT_API_KEY = 'bc713bfab2d4e7a9ac25515a98ceb39c';
export const DEFAULT_TOKEN = 'ATTA8ed84495777bb27cd57370a047d40b997c52b7ab1cf39c420cc4e4d9db0b4c38BFA22D83';

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

export async function fetchMemberBoards(apiKey = DEFAULT_API_KEY, token = DEFAULT_TOKEN) {
  const res = await fetch(`${TRELLO_BASE}/members/me/boards?key=${apiKey}&token=${token}&fields=id,name,url`);
  if (!res.ok) throw new Error(`Failed to fetch boards: ${res.statusText}`);
  return res.json();
}

export async function fetchTrelloCard(cardId, apiKey = DEFAULT_API_KEY, token = DEFAULT_TOKEN) {
  const res = await fetch(`${TRELLO_BASE}/cards/${cardId}?checklists=all&key=${apiKey}&token=${token}`);
  if (!res.ok) throw new Error(`Failed to fetch card: ${res.statusText}`);
  return res.json();
}

export async function fetchBoardCards(boardId, apiKey = DEFAULT_API_KEY, token = DEFAULT_TOKEN) {
  const res = await fetch(`${TRELLO_BASE}/boards/${boardId}/cards?checklists=all&key=${apiKey}&token=${token}`);
  if (!res.ok) throw new Error(`Failed to fetch cards: ${res.statusText}`);
  return res.json();
}

export async function createTrelloChecklist(cardId, name, apiKey = DEFAULT_API_KEY, token = DEFAULT_TOKEN) {
  const res = await fetch(`${TRELLO_BASE}/cards/${cardId}/checklists?name=${encodeURIComponent(name)}&key=${apiKey}&token=${token}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to create checklist: ${res.statusText}`);
  return res.json();
}

export async function addTrelloCheckItem(checklistId, name, checked = false, apiKey = DEFAULT_API_KEY, token = DEFAULT_TOKEN) {
  const state = checked ? 'complete' : 'incomplete';
  const res = await fetch(`${TRELLO_BASE}/checklists/${checklistId}/checkItems?name=${encodeURIComponent(name)}&checked=${checked}&key=${apiKey}&token=${token}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to add checkItem: ${res.statusText}`);
  return res.json();
}

export async function deleteTrelloCheckItem(checklistId, checkItemId, apiKey = DEFAULT_API_KEY, token = DEFAULT_TOKEN) {
  const res = await fetch(`${TRELLO_BASE}/checklists/${checklistId}/checkItems/${checkItemId}?key=${apiKey}&token=${token}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`Failed to delete checkItem: ${res.statusText}`);
  return res.json();
}
