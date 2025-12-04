export enum ShapeType {
  TREE = 'TREE',
  EXPLOSION_1 = 'EXPLOSION_1',
  HEART = 'HEART',
  EXPLOSION_2 = 'EXPLOSION_2',
  GALAXY = 'GALAXY',
  EXPLOSION_3 = 'EXPLOSION_3'
}

export interface ParticleConfig {
  count: number;
  colorTheme: string[];
}