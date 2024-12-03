export type ModelType = 'durian' | 'mango' | 'guava';

export interface Model {
  id: ModelType;
  label: string;
  description: string;
}

export const models: Model[] = [
  {
    id: 'durian',
    label: 'Durian',
    description: 'General-purpose, balanced model'
  },
  {
    id: 'mango',
    label: 'Mango',
    description: 'Focused on math reasoning'
  },
  {
    id: 'guava',
    label: 'Guava',
    description: 'Optimized for coding'
  }
];

export function getModelValue(modelId: ModelType): string {
  return `viro:${modelId}`;
}