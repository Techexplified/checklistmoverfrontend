import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getTrelloIframeInstance,
  isTrelloIframe,
  DEFAULT_API_KEY,
  DEFAULT_TOKEN,
  fetchTrelloCard,
  fetchBoardCards,
  createTrelloChecklist,
  addTrelloCheckItem,
  deleteTrelloCheckItem
} from '../services/trelloApi';

const TrelloContext = createContext();

export function TrelloProvider({ children }) {
  const [cards, setCards] = useState([]);
  const [board, setBoard] = useState({ id: '', name: 'Trello Board' });
  const [activeCardId, setActiveCardId] = useState('');
  const [modalSourceCardId, setModalSourceCardId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trelloIframeInstance, setTrelloIframeInstance] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [lastActionDetails, setLastActionDetails] = useState(null);

  const apiConfig = {
    apiKey: DEFAULT_API_KEY,
    token: DEFAULT_TOKEN
  };

  // Load real Trello data
  useEffect(() => {
    let isMounted = true;
    const t = getTrelloIframeInstance();

    async function loadData() {
      setIsLoading(true);

      if (t) {
        setTrelloIframeInstance(t);
        setIsModalOpen(true);

        try {
          // 1. Get real card and board info directly from Trello Power-Up context
          const [cardContext, boardContext, allCardsContext] = await Promise.all([
            t.card('id', 'name', 'desc', 'idBoard', 'checklists').catch(() => null),
            t.board('id', 'name').catch(() => null),
            t.cards('id', 'name', 'checklists').catch(() => null)
          ]);

          const cardId = cardContext?.id;
          const boardId = boardContext?.id || cardContext?.idBoard;
          const boardName = boardContext?.name || 'My Trello Board';

          if (boardId) {
            setBoard({ id: boardId, name: boardName });
          }

          // 2. Fetch fresh real card and board cards from Trello REST API using API Key & Token
          let currentCardChecklists = [];
          let currentCardName = cardContext?.name || 'Trello Card';

          if (cardId) {
            try {
              const liveCard = await fetchTrelloCard(cardId, apiConfig.apiKey, apiConfig.token);
              if (liveCard) {
                currentCardName = liveCard.name;
                currentCardChecklists = (liveCard.checklists || []).map(chk => ({
                  id: chk.id,
                  name: chk.name,
                  items: (chk.checkItems || []).map(item => ({
                    id: item.id,
                    name: item.name,
                    state: item.state,
                    selected: false
                  }))
                }));
              }
            } catch (cardApiErr) {
              console.warn('REST API card fetch fallback to context:', cardApiErr);
              // Fallback to Power-Up client context
              if (cardContext?.checklists) {
                currentCardChecklists = cardContext.checklists.map(chk => ({
                  id: chk.id,
                  name: chk.name,
                  items: (chk.checkItems || []).map(item => ({
                    id: item.id,
                    name: item.name,
                    state: item.state,
                    selected: false
                  }))
                }));
              }
            }
          }

          // Fetch other cards on this board for destination selection
          let boardCardsList = [];
          if (boardId) {
            try {
              const liveBoardCards = await fetchBoardCards(boardId, apiConfig.apiKey, apiConfig.token);
              if (Array.isArray(liveBoardCards)) {
                boardCardsList = liveBoardCards;
              }
            } catch (boardApiErr) {
              console.warn('REST API board cards fetch fallback to context:', boardApiErr);
              if (Array.isArray(allCardsContext)) {
                boardCardsList = allCardsContext;
              }
            }
          }

          // Build real cards array
          const realSourceCard = {
            id: cardId || 'current-card',
            title: currentCardName,
            boardName: boardName,
            description: cardContext?.desc || '',
            checklists: currentCardChecklists
          };

          const realDestCards = boardCardsList
            .filter(bc => bc.id !== cardId)
            .map(bc => ({
              id: bc.id,
              title: bc.name,
              boardName: boardName,
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

          if (isMounted) {
            setCards([realSourceCard, ...realDestCards]);
            setActiveCardId(realSourceCard.id);
            setModalSourceCardId(realSourceCard.id);
            setIsLoading(false);
          }
          return;
        } catch (err) {
          console.error('Error fetching Trello data in iframe:', err);
        }
      }

      // If running standalone outside Trello, load real cards from the user's active board
      try {
        // Fetch user's board wauLsErf ("checklist mover")
        const liveCards = await fetchBoardCards('wauLsErf', apiConfig.apiKey, apiConfig.token);
        if (Array.isArray(liveCards) && liveCards.length > 0) {
          const formatted = liveCards.map(c => ({
            id: c.id,
            title: c.name,
            boardName: 'checklist mover',
            description: c.desc || '',
            checklists: (c.checklists || []).map(chk => ({
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

          if (isMounted) {
            setBoard({ id: 'wauLsErf', name: 'checklist mover' });
            setCards(formatted);
            setActiveCardId(formatted[0].id);
            setModalSourceCardId(formatted[0].id);
            setIsLoading(false);
          }
          return;
        }
      } catch (fallbackErr) {
        console.warn('Could not fetch real board cards:', fallbackErr);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadData();

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
    const sourceCard = cards.find(c => c.id === sourceCardId);
    if (!sourceCard) throw new Error('Source card not found');
    const sourceChecklist = sourceCard.checklists.find(ch => ch.id === sourceChecklistId);
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

      // Add each item to destination checklist in real Trello
      for (const item of selectedItems) {
        await addTrelloCheckItem(
          targetChkId,
          item.name,
          item.state === 'complete',
          apiConfig.apiKey,
          apiConfig.token
        );
        // If Move, delete from source checklist in real Trello
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

    // Update local React state to reflect transfer
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

  const activeCard = cards.find(c => c.id === activeCardId) || cards[0];
  const modalSourceCard = cards.find(c => c.id === modalSourceCardId) || activeCard;

  return (
    <TrelloContext.Provider
      value={{
        board,
        cards,
        activeCard,
        activeCardId,
        setActiveCardId,
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
