import { FlowerType } from './types';

export const FLOWER_TYPES: FlowerType[] = [
  {
    id: 'daisy',
    name: '小雛菊',
    description: '象徵著純潔與希望，是新讀者的好夥伴。',
    requiredPages: 50,
    color: '#F97316',
    stages: {
      seed: '🌱',
      sprout: '🌿',
      bud: '🎍',
      bloom: '🌼',
      withered: '🥀',
    },
  },
  {
    id: 'tulip',
    name: '鬱金香',
    description: '博學與高雅，需要更多的耐心澆灌。',
    requiredPages: 100,
    color: '#EF4444',
    stages: {
      seed: '🌱',
      sprout: '🌿',
      bud: '🎍',
      bloom: '🌷',
      withered: '🥀',
    },
  },
  {
    id: 'rose',
    name: '紅玫瑰',
    description: '熱情與智慧的結晶，只有深度閱讀者能讓其綻放。',
    requiredPages: 200,
    color: '#BE123C',
    stages: {
      seed: '🌱',
      sprout: '🌿',
      bud: '🎍',
      bloom: '🌹',
      withered: '🥀',
    },
  },
  {
    id: 'sunflower',
    name: '向日葵',
    description: '追求陽光與真理，巨大的能量來源。',
    requiredPages: 300,
    color: '#EAB308',
    stages: {
      seed: '🌱',
      sprout: '🌿',
      bud: '🎍',
      bloom: '🌻',
      withered: '🥀',
    },
  },
  {
    id: 'lotus',
    name: '清淨蓮花',
    description: '在繁忙中尋求寧靜，是心靈閱讀的最高殿堂。',
    requiredPages: 500,
    color: '#F472B6',
    stages: {
      seed: '🌱',
      sprout: '🌿',
      bud: '🎍',
      bloom: '🪷',
      withered: '🥀',
    },
  },
];
