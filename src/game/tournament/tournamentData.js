export const TOURNAMENT_CONTESTANTS = [
  { id: 'player1', name: 'You', avatar: '🎱', skill: 0.95, isPlayer: true },
  { id: 'bot_spencer', name: 'Spencer "The Sniper"', avatar: '🎯', skill: 0.65, title: 'Regional Champ' },
  { id: 'bot_elena', name: 'Elena Vance', avatar: '💎', skill: 0.72, title: 'Speed Potter' },
  { id: 'bot_jax', name: 'Jax "Heavy Impact"', avatar: '⚡', skill: 0.68, title: 'Break Specialist' },
  { id: 'bot_viktor', name: 'Viktor Romanov', avatar: '🎩', skill: 0.82, title: 'Grandmaster' },
  { id: 'bot_maya', name: 'Maya Lin', avatar: '🌸', skill: 0.75, title: 'Bank Shot Queen' },
  { id: 'bot_dante', name: 'Dante "Hustler"', avatar: '🔥', skill: 0.78, title: 'Underground Legend' },
  { id: 'bot_kingston', name: 'Sir Kingston', avatar: '👑', skill: 0.88, title: 'World Ranked #1' }
];

export function createTournamentBracket() {
  return {
    round: 'quarter', // 'quarter', 'semi', 'final', 'completed'
    matches: {
      quarter: [
        {
          id: 'q1',
          playerA: TOURNAMENT_CONTESTANTS[0],
          playerB: TOURNAMENT_CONTESTANTS[1],
          winner: null,
          isPlayerMatch: true
        },
        {
          id: 'q2',
          playerA: TOURNAMENT_CONTESTANTS[2],
          playerB: TOURNAMENT_CONTESTANTS[3],
          winner: null,
          isPlayerMatch: false
        },
        {
          id: 'q3',
          playerA: TOURNAMENT_CONTESTANTS[4],
          playerB: TOURNAMENT_CONTESTANTS[5],
          winner: null,
          isPlayerMatch: false
        },
        {
          id: 'q4',
          playerA: TOURNAMENT_CONTESTANTS[6],
          playerB: TOURNAMENT_CONTESTANTS[7],
          winner: null,
          isPlayerMatch: false
        }
      ],
      semi: [
        { id: 's1', playerA: null, playerB: null, winner: null, isPlayerMatch: true },
        { id: 's2', playerA: null, playerB: null, winner: null, isPlayerMatch: false }
      ],
      final: [
        { id: 'f1', playerA: null, playerB: null, winner: null, isPlayerMatch: true }
      ]
    },
    champion: null,
    prizePool: 2500
  };
}
