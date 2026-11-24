/** Item do catálogo público `GET /sport-modalities`. */
export type SportModality = {
  id: string;
  slug: string;
  name: string;
  category: string;
  sortOrder: number;
};
