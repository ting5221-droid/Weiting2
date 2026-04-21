export interface ReadingLog {
  date: string;
  pages: number;
  note?: string;
}

export type GrowthStage = 'seed' | 'sprout' | 'bud' | 'bloom' | 'withered';

export interface FlowerInstance {
  id: string;
  typeId: string;
  pagesInvested: number;
  plantedAt: string;
  bloomedAt?: string;
  isCustomName?: string;
}

export interface FlowerType {
  id: string;
  name: string;
  description: string;
  requiredPages: number;
  stages: {
    [key in GrowthStage]: string; // Icon or emoji for now, or asset path
  };
  color: string;
}

export interface GameState {
  currentFlower: FlowerInstance | null;
  history: FlowerInstance[];
  logs: ReadingLog[];
  totalPages: number;
}
