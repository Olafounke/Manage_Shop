export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'select' | 'actions' | 'status' | 'number';
  options?: string[];
  template?: string;
  editable?: boolean;
}
