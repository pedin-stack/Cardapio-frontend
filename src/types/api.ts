/**
 * @description Página do Spring Data (`Page<T>`), como o backend serializa.
 */
export type Pagina<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};
