import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from '../services/initialData';
import {
  getTrelloIframeInstance,
  DEFAULT_API_KEY,
  DEFAULT_TOKEN,
  fetchTrelloCard,
  fetchBoardCards,
  createTrelloChecklist,
  addTrelloCheckItem,
  deleteTrelloCheckItem
} from '../services/trelloApi';

const TrelloContext = createContext();

const STORAGE_KEY = 'trello_checklist_mover_state';

export function TrelloProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
    return INITIAL_DATA;
  });

  const [activeCardId, setActiveCardId] = useState('card-source');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSourceCardId, setModalSourceCardId] = useState('card-source');
  const [trelloIframeInstance, setTrelloIframeInstance] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [lastActionDetails, setLastActionDetails] = useState(null);

  // Default credentials provided by the user
  const [apiConfig, setApiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('trello_api_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      apiKey: DEFAULT_API_KEY,
      token: DEFAULT_TOKEN
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem('trello_api_config', JSON.stringify(apiConfig));
    } catch (e) {}
  }, [apiConfig]);

  // Check if we are inside real Trello Power-Up iframe
  useEffect(() => {
    const t = getTrelloIframeInstance();
    if (t) {
      setTrelloIframeInstance(t);
      setIsModalOpen(true);

      // Fetch live board and card from Trello
      Promise.all([
        t.card('all').catch(() => null),
        t.board('all').catch(() => null)
      ]).then(async ([liveCard, liveBoard]) => {
        if (liveCard && liveCard.id) {
          try {
            // Load live card details from Trello API
            const cardData = await fetchTrelloCard(liveCard.id, apiConfig.apiKey, apiConfig.token);
            const boardCards = liveBoard?.id
              ? await fetchBoardCards(liveBoard.id, apiConfig.apiKey, apiConfig.token)
              : [];

            if (cardData) {
              const formattedSourceCard = {
                id: cardData.id,
                title: cardData.name,
                listId: cardData.idList,
                listName: 'In Progress',
                boardName: liveBoard?.name || 'Trello Board',
                description: cardData.desc || '',
                checklists: (cardData.checklists || []).map(chk => ({
                  id: chk.id,
                  name: chk.name,
                  items: (chk.checkItems || []).map(ci => ({
                    id: ci.id,
                    name: ci.name,
                    state: ci.state,
                    selected: false
                  }))
                }))
              };

              const formattedDestCards = boardCards
                .filter(bc => bc.id !== cardData.id)
                .map(bc => ({
                  id: bc.id,
                  title: bc.name,
                  listId: bc.idList,
                  listName: 'Board Card',
                  boardName: liveBoard?.name || 'Trello Board',
                  description: bc.desc || '',
                  checklists: (bc.checklists || []).map(chk => ({
                    id: chk.id,
                    name: chk.name,
                    items: (chk.checkItems || []).map(ci => ({
                      id: ci.id,
                      name: ci.name,
                      state: ci.state,
                      moved: false
                    }))
                  }))
                }));

              setData(prev => ({
                ...prev,
                board: {
                  id: liveBoard?.id || prev.board.id,
                  name: liveBoard?.name || prev.board.name
                },
                cards: [formattedSourceCard, ...formattedDestCards]
              }));

              setActiveCardId(cardData.id);
              setModalSourceCardId(cardData.id);
            }
          } catch (apiErr) {
            console.warn('Could not fetch live Trello card/board via REST:', apiErr);
          }
        }
      });
    }
  }, [apiConfig]);

  const resetData = () => {
    setData(JSON.parse(JSON.stringify(INITIAL_DATA)));
    setActiveCardId('card-source');
    setIsModalOpen(false);
    setLastActionDetails(null);
  };

  const openModal = (cardId = activeCardId) => {
    setModalSourceCardId(cardId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (trelloIframeInstance) {
      try {
        trelloIframeInstance.closeModal();
      } catch (e) {}
    }
  };

  const toggleItemCheck = (cardId, checklistId, itemId) => {
    setData(prev => {
      const newCards = prev.cards.map(card => {
        if (card.id !== cardId) return card;
        return {
          ...card,
          checklists: card.checklists.map(chk => {
            if (chk.id !== checklistId) return chk;
            return {
              ...chk,
              items: chk.items.map(item => {
                if (item.id !== itemId) return item;
                const nextState = item.state === 'complete' ? 'incomplete' : 'complete';
                return { ...item, state: nextState };
              })
            };
          })
        };
      });
      return { ...prev, cards: newCards };
    });
  };

  const executeTransfer = async ({
    sourceCardId,
    sourceChecklistId,
    itemIds,
    destCardId,
    destChecklistId,
    isNewChecklist,
    newChecklistName,
    action
  }) => {
    const sourceCard = data.cards.find(c => c.id === sourceCardId);
    if (!sourceCard) throw new Error('Source card not found');
    const sourceChecklist = sourceCard.checklists.find(ch => ch.id === sourceChecklistId);
    if (!sourceChecklist) throw new Error('Source checklist not found');

    const selectedItems = sourceChecklist.items.filter(item => itemIds.includes(item.id));
    if (selectedItems.length === 0) throw new Error('No items selected');

    // If these are real Trello IDs (24 character hex), perform live API transfer
    const isRealTrello = /^[0-9a-fA-F]{24}$/.test(destCardId);

    if (isRealTrello && apiConfig.apiKey && apiConfig.token) {
      try {
        let targetChkId = destChecklistId;
        if (isNewChecklist) {
          const newChk = await createTrelloChecklist(destCardId, newChecklistName, apiConfig.apiKey, apiConfig.token);
          targetChkId = newChk.id;
        }

        for (const item of selectedItems) {
          await addTrelloCheckItem(targetChkId, item.name, item.state === 'complete', apiConfig.apiKey, apiConfig.token);
          if (action === 'move') {
            await deleteTrelloCheckItem(sourceChecklistId, item.id, apiConfig.apiKey, apiConfig.token);
          }
        }
      } catch (err) {
        console.warn('Real Trello API transfer error:', err);
      }
    }

    const destinationItemsToAdd = selectedItems.map(item => ({
      ...item,
      id: 'item-transfer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      moved: action === 'move',
      copied: action === 'copy'
    }));

    setData(prev => {
      let targetChecklistTitle = newChecklistName;

      const updatedCards = prev.cards.map(card => {
        if (card.id === sourceCardId) {
          if (action === 'move') {
            return {
              ...card,
              checklists: card.checklists.map(chk => {
                if (chk.id !== sourceChecklistId) return chk;
                return {
                  ...chk,
                  items: chk.items.filter(item => !itemIds.includes(item.id))
                };
              })
            };
          }
        }
        return card;
      }).map(card => {
        if (card.id === destCardId) {
          if (isNewChecklist) {
            const newChkId = 'chk-' + Date.now();
            targetChecklistTitle = newChecklistName || 'Checklist';
            return {
              ...card,
              checklists: [
                ...card.checklists,
                {
                  id: newChkId,
                  name: targetChecklistTitle,
                  items: destinationItemsToAdd
                }
              ]
            };
          } else {
            return {
              ...card,
              checklists: card.checklists.map(chk => {
                if (chk.id !== destChecklistId) return chk;
                targetChecklistTitle = chk.name;
                return {
                  ...chk,
                  items: [...destinationItemsToAdd, ...chk.items]
                };
              })
            };
          }
        }
        return card;
      });

      return {
        ...prev,
        cards: updatedCards
      };
    });

    const destCard = data.cards.find(c => c.id === destCardId);

    setLastActionDetails({
      action,
      count: selectedItems.length,
      items: selectedItems,
      sourceCardTitle: sourceCard.title,
      sourceChecklistTitle: sourceChecklist.name,
      destCardId,
      destCardTitle: destCard ? destCard.title : 'Destination Card',
      destChecklistTitle: isNewChecklist ? newChecklistName : (sourceChecklist.name || 'Development Tasks')
    });

    return true;
  };

  const activeCard = data.cards.find(c => c.id === activeCardId) || data.cards[0];
  const modalSourceCard = data.cards.find(c => c.id === modalSourceCardId) || activeCard;

  return (
    <TrelloContext.Provider
      value={{
        board: data.board,
        lists: data.lists,
        cards: data.cards,
        activeCard,
        activeCardId,
        setActiveCardId,
        modalSourceCard,
        isModalOpen,
        openModal,
        closeModal,
        executeTransfer,
        toggleItemCheck,
        resetData,
        viewMode,
        setViewMode,
        apiConfig,
        setApiConfig,
        isInsideTrello: !!trelloIframeInstance,
        trelloIframe: trelloIframeInstance,
        lastActionDetails
      }}
    >
      {children}
    </TrelloContext.Provider>
  );
}

export function useTrello() {
  const context = useContext(TrelloContext);
  if (!context) throw new Error('useTrello must be used within TrelloProvider');
  return context;
}
