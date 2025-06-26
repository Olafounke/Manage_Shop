export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'select' | 'actions';
  options?: string[];
  template?: string;
}
