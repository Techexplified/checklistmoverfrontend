import React, { createContext, useContext, useState, useEffect } from 'react';
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

// Real initial state corresponding to the user's active card
const DEFAULT_INITIAL_CARD = {
  id: '6af5be285e145c67d28716bd',
  title: 'make presentation',
  boardName: 'checklist mover',
  description: '',
  checklists: [
    {
      id: '6af5c13ff1fa30f42d13dc73',
      name: 'Checklist',
      items: [
        {
          id: '6af5c151be089a12b8ef0f54',
          name: 'make coding',
          state: 'incomplete',
          selected: true
        }
      ]
    }
  ]
};

export function TrelloProvider({ children }) {
  const [cards, setCards] = useState([DEFAULT_INITIAL_CARD]);
  const [board, setBoard] = useState({ id: '6af5bd1f319699d1cc6d3d5d', name: 'checklist mover' });
  const [activeCardId, setActiveCardId] = useState(DEFAULT_INITIAL_CARD.id);
  const [modalSourceCardId, setModalSourceCardId] = useState(DEFAULT_INITIAL_CARD.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trelloIframeInstance, setTrelloIframeInstance] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [lastActionDetails, setLastActionDetails] = useState(null);

  const apiConfig = {
    apiKey: DEFAULT_API_KEY,
    token: DEFAULT_TOKEN
  };

  // Synchronize with Trello Power-Up context and REST API
  useEffect(() => {
    let isMounted = true;
    const t = getTrelloIframeInstance();

    async function syncTrello() {
      if (t) {
        setTrelloIframeInstance(t);
        setIsModalOpen(true);

        try {
          // Get card and board context from Trello iframe
          const ctx = typeof t.getContext === 'function' ? t.getContext() : {};
          const cardId = ctx.card;
          const boardId = ctx.board;

          const [cardContext, boardContext, allCardsContext] = await Promise.all([
            cardId ? t.card('id', 'name', 'desc', 'idBoard', 'checklists').catch(() => null) : null,
            boardId ? t.board('id', 'name').catch(() => null) : null,
            boardId ? t.cards('id', 'name', 'checklists').catch(() => null) : null
          ]);

          const effectiveCardId = cardId || cardContext?.id || DEFAULT_INITIAL_CARD.id;
          const effectiveBoardId = boardId || boardContext?.id || '6af5bd1f319699d1cc6d3d5d';
          const effectiveBoardName = boardContext?.name || 'checklist mover';

          if (isMounted && effectiveBoardName) {
            setBoard({ id: effectiveBoardId, name: effectiveBoardName });
          }

          // Fetch fresh live card and board cards from REST API
          const [liveCard, liveBoardCards] = await Promise.all([
            fetchTrelloCard(effectiveCardId, apiConfig.apiKey, apiConfig.token).catch(() => null),
            fetchBoardCards(effectiveBoardId, apiConfig.apiKey, apiConfig.token).catch(() => null)
          ]);

          if (!isMounted) return;

          let formattedSourceCard = DEFAULT_INITIAL_CARD;
          if (liveCard && liveCard.id) {
            formattedSourceCard = {
              id: liveCard.id,
              title: liveCard.name,
              boardName: effectiveBoardName,
              description: liveCard.desc || '',
              checklists: (liveCard.checklists || []).map(chk => ({
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
          }

          let formattedDestCards = [];
          if (Array.isArray(liveBoardCards)) {
            formattedDestCards = liveBoardCards
              .filter(bc => bc.id !== effectiveCardId)
              .map(bc => ({
                id: bc.id,
                title: bc.name,
                boardName: effectiveBoardName,
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
          }

          setCards([formattedSourceCard, ...formattedDestCards]);
          setActiveCardId(formattedSourceCard.id);
          setModalSourceCardId(formattedSourceCard.id);
        } catch (e) {
          console.warn('Trello live sync notice:', e);
        }
      }
    }

    syncTrello();

    return () => {
      isMounted = false;
    };
  }, []);

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
    setCards(prev =>
      prev.map(card => {
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
      })
    );
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
    const sourceCard = cards.find(c => c.id === sourceCardId) || DEFAULT_INITIAL_CARD;
    const sourceChecklist = sourceCard.checklists.find(ch => ch.id === sourceChecklistId) || sourceCard.checklists[0];
    if (!sourceChecklist) throw new Error('Source checklist not found');

    const selectedItems = sourceChecklist.items.filter(item => itemIds.includes(item.id));
    if (selectedItems.length === 0) throw new Error('No items selected');

    // Real Trello API transfer
    let targetChkId = destChecklistId;
    try {
      if (isNewChecklist) {
        const newChk = await createTrelloChecklist(
          destCardId,
          newChecklistName || 'New Checklist',
          apiConfig.apiKey,
          apiConfig.token
        );
        targetChkId = newChk.id;
      }

      for (const item of selectedItems) {
        await addTrelloCheckItem(
          targetChkId,
          item.name,
          item.state === 'complete',
          apiConfig.apiKey,
          apiConfig.token
        );
        if (action === 'move') {
          await deleteTrelloCheckItem(
            sourceChecklistId,
            item.id,
            apiConfig.apiKey,
            apiConfig.token
          );
        }
      }
    } catch (apiErr) {
      console.error('Real Trello transfer error:', apiErr);
      throw new Error('Trello API error: ' + (apiErr.message || 'Failed to update Trello card'));
    }

    const destinationItemsToAdd = selectedItems.map(item => ({
      ...item,
      id: 'item-transfer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      moved: action === 'move',
      copied: action === 'copy'
    }));

    setCards(prev => {
      let targetChecklistTitle = newChecklistName;

      return prev
        .map(card => {
          if (card.id === sourceCardId && action === 'move') {
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
          return card;
        })
        .map(card => {
          if (card.id === destCardId) {
            if (isNewChecklist) {
              const newChkId = targetChkId || 'chk-' + Date.now();
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
    });

    const destCard = cards.find(c => c.id === destCardId);

    setLastActionDetails({
      action,
      count: selectedItems.length,
      items: selectedItems,
      sourceCardTitle: sourceCard.title,
      sourceChecklistTitle: sourceChecklist.name,
      destCardId,
      destCardTitle: destCard ? destCard.title : 'Destination Card',
      destChecklistTitle: isNewChecklist ? newChecklistName : (sourceChecklist.name || 'Checklist')
    });

    return true;
  };

  const changeSourceCard = (cardId) => {
    setModalSourceCardId(cardId);
    setActiveCardId(cardId);
  };

  const activeCard = cards.find(c => c.id === activeCardId) || cards[0] || DEFAULT_INITIAL_CARD;
  const modalSourceCard = cards.find(c => c.id === modalSourceCardId) || activeCard;

  return (
    <TrelloContext.Provider
      value={{
        board,
        cards,
        activeCard,
        activeCardId,
        setActiveCardId,
        modalSourceCardId,
        setModalSourceCardId,
        changeSourceCard,
        modalSourceCard,
        isModalOpen,
        isLoading,
        openModal,
        closeModal,
        executeTransfer,
        toggleItemCheck,
        viewMode,
        setViewMode,
        apiConfig,
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
