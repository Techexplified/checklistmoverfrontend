export const INITIAL_DATA = {
  board: {
    id: 'board-1',
    name: 'Website Redesign',
  },
  lists: [
    { id: 'list-1', name: 'Backlog' },
    { id: 'list-2', name: 'In Progress' },
    { id: 'list-3', name: 'Done' }
  ],
  cards: [
    {
      id: 'card-source',
      title: 'Website Redesign – Tasks',
      listId: 'list-2',
      listName: 'In Progress',
      boardName: 'Website Redesign',
      description: 'Tasks for the website redesign project.',
      checklists: [
        {
          id: 'chk-dev-source',
          name: 'Development Tasks',
          items: [
            { id: 'item-1', name: 'Set up project repo', state: 'complete', selected: true },
            { id: 'item-2', name: 'Implement API integration', state: 'complete', selected: true },
            { id: 'item-3', name: 'Create unit tests', state: 'incomplete', selected: false },
            { id: 'item-4', name: 'Code review', state: 'incomplete', selected: false },
            { id: 'item-5', name: 'Deploy to staging', state: 'incomplete', selected: false },
          ]
        }
      ]
    },
    {
      id: 'card-dest',
      title: 'Sprint Planning – Week 1',
      listId: 'list-2',
      listName: 'In Progress',
      boardName: 'Website Redesign',
      description: 'Sprint planning and backlog prioritization for week 1.',
      checklists: [
        {
          id: 'chk-dev-dest',
          name: 'Development Tasks',
          items: [
            { id: 'item-dest-1', name: 'Write unit tests', state: 'incomplete', moved: false },
            { id: 'item-dest-2', name: 'Code review', state: 'incomplete', moved: false },
            { id: 'item-dest-3', name: 'Deploy to staging', state: 'incomplete', moved: false },
          ]
        }
      ]
    },
    {
      id: 'card-qa',
      title: 'QA & Staging Verification',
      listId: 'list-2',
      listName: 'In Progress',
      boardName: 'Website Redesign',
      description: 'Quality assurance checklist and cross-browser testing.',
      checklists: [
        {
          id: 'chk-qa',
          name: 'Testing Checklist',
          items: [
            { id: 'item-qa-1', name: 'Cross-browser check (Chrome, Safari, Firefox)', state: 'complete', moved: false },
            { id: 'item-qa-2', name: 'Mobile responsiveness audit', state: 'incomplete', moved: false }
          ]
        }
      ]
    }
  ]
};

