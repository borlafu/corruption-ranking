import type { Case } from './types';

export const initialCases: Case[] = [
  {
    id: '1',
    mainSuspect: 'Político Corrupto I',
    accusations: 15,
    sentences: 2,
    politicalAllegianceCategory: 'miembro del gobierno',
    sourceUrls: ['https://example.com/news1'],
  },
  {
    id: '2',
    mainSuspect: 'Familiar Privilegiado',
    accusations: 8,
    sentences: 0,
    politicalAllegianceCategory: 'miembro de la familia',
    sourceUrls: ['https://example.com/news2'],
  },
  {
    id: '3',
    mainSuspect: 'Funcionario Deshonesto',
    accusations: 5,
    sentences: 1,
    politicalAllegianceCategory: 'servidor publico',
    sourceUrls: ['https://example.com/news3', 'https://example.com/news4'],
  },
  {
    id: '4',
    mainSuspect: 'Institución Cuestionable',
    accusations: 22,
    sentences: 0,
    politicalAllegianceCategory: 'institución',
    sourceUrls: ['https://example.com/news5'],
  },
  {
    id: '5',
    mainSuspect: 'Político Corrupto II',
    accusations: 12,
    sentences: 3,
    politicalAllegianceCategory: 'miembro del gobierno',
    sourceUrls: ['https://example.com/news6'],
  },
  {
    id: '6',
    mainSuspect: 'Empresario Vinculado',
    accusations: 3,
    sentences: 1,
    politicalAllegianceCategory: 'servidor publico',
    sourceUrls: ['https://example.com/news7'],
  },
];
