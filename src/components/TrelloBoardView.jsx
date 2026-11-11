import React from 'react';
import { useTrello } from '../context/TrelloContext';
import { Plus, CheckSquare, MoreHorizontal } from 'lucide-react';

export default function TrelloBoardView() {
  const { lists, cards, setActiveCardId, setViewMode } = useTrello();

  const handleCardClick = (cardId) => {
    setActiveCardId(cardId);
    setViewMode('card');
  };

  return (
    <div className="trello-board-canvas">
      <div className="trello-board-header">
        <h2 className="board-title">Website Redesign</h2>
        <span className="board-star-btn">★</span>
        <span className="board-privacy-pill">Workspace visible</span>
      </div>

      <div className="trello-lists-track">
        {lists.map(list => {
          const listCards = cards.filter(c => c.listId === list.id);

          return (
            <div key={list.id} className="trello-list-column">
              <div className="trello-list-header">
                <span className="trello-list-title">{list.name}</span>
                <button className="icon-btn-subtle small">
                  <MoreHorizontal size={15} />
                </button>
              </div>

              <div className="trello-list-cards">
                {listCards.map(card => {
                  const checklists = card.checklists || [];
                  const totalItems = checklists.reduce((acc, ch) => acc + ch.items.length, 0);
                  const completedItems = checklists.reduce(
                    (acc, ch) => acc + ch.items.filter(i => i.state === 'complete').length,
                    0
                  );
                  const hasMovedItems = checklists.some(ch => ch.items.some(i => i.moved));

                  return (
                    <div
                      key={card.id}
                      className={`trello-card-tile ${hasMovedItems ? 'has-moved' : ''}`}
                      onClick={() => handleCardClick(card.id)}
                    >
                      <div className="card-tile-title">{card.title}</div>

                      {totalItems > 0 && (
                        <div className="card-tile-badges">
                          <span className={`tile-badge-checklist ${completedItems === totalItems ? 'all-done' : ''}`}>
                            <CheckSquare size={13} />
                            <span>{completedItems}/{totalItems}</span>
                          </span>

                          {hasMovedItems && (
                            <span className="tile-badge-moved">
                              <span className="badge-dot"></span>
                              <span>Checklist Updated</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button className="trello-add-card-btn">
                <Plus size={15} />
                <span>Add a card</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

