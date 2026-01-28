import { getVisitTypes as getVisitTypesService } from './visitTypesService';

export async function getVisitTypes() {
  // This function can be expanded for SSR or client fetch abstraction
  return await getVisitTypesService();
}
