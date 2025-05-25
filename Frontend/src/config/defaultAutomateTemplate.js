export default {
    name: 'Nouvelle clause',
    states: [

        {
            id: 'state-initial',
            label: 'INITIAL',
            position: { x: 20, y: 0 },
            type: 'initial',
          },
      {
        id: 'state-completed',
        label: 'COMPLETED',
        position: { x: 300, y: 150 },
        type: 'final',
      }
    ],
    transitions: []
  };