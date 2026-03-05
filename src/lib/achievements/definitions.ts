export interface AchievementDef {
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
}

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  {
    type: 'mwanzo', title: 'Mwanzo (Beginning)',
    description: 'Complete your first clinical case',
    icon: '🌱', points: 10,
  },
  {
    type: 'bidii', title: 'Bidii (Diligence)',
    description: 'Complete 5 clinical cases',
    icon: '📚', points: 25,
  },
  {
    type: 'hodari', title: 'Hodari (Skilled)',
    description: 'Complete 10 clinical cases',
    icon: '⭐', points: 50,
  },
  {
    type: 'bingwa', title: 'Bingwa (Expert)',
    description: 'Complete 25 clinical cases',
    icon: '🏆', points: 100,
  },
  {
    type: 'moto', title: 'Moto (Fire)',
    description: 'Achieve a 3-day streak',
    icon: '🔥', points: 30,
  },
  {
    type: 'nguvu', title: 'Nguvu (Strength)',
    description: 'Achieve a 7-day streak',
    icon: '💪', points: 75,
  },
  {
    type: 'msalaba', title: 'Msalaba (Precision)',
    description: 'Score 80% or higher on average',
    icon: '🎯', points: 40,
  },
  {
    type: 'daktari', title: 'Daktari (Doctor)',
    description: 'Practice across all 6 clinical domains',
    icon: '🩺', points: 60,
  },
  {
    type: 'shujaa', title: 'Shujaa (Hero)',
    description: 'Reach level 5',
    icon: '🦸', points: 100,
  },
  {
    type: 'elimu', title: 'Elimu (Knowledge)',
    description: 'Earn 500 total points',
    icon: '📖', points: 50,
  },
];
