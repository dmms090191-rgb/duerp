import { DuerpCategory } from './duerpQuestions';
import { duerpCategories } from './duerpQuestions';
import { garagesCategories } from './garagesQuestions';

const sectorQuestionsMap: Record<string, DuerpCategory[]> = {
  'Garages automobiles et poids lourds': garagesCategories,
  'Traitement des métaux': duerpCategories,
};

export function getCategoriesForSector(typeDiagnostic: string): DuerpCategory[] {
  const sectorName = typeDiagnostic?.split(' ').slice(1).join(' ') || '';
  return sectorQuestionsMap[sectorName] || duerpCategories;
}
