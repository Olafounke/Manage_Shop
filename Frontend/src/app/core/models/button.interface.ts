export type ButtonStyle =
  | 'save'
  | 'cancel'
  | 'delete'
  | 'add'
  | 'edit'
  | 'default';
export type ButtonType = 'button' | 'submit';
export type ButtonSize = 'small' | 'medium' | 'big';
export type ButtonDisplay = 'icon' | 'text' | 'icon+text';

export interface ButtonConfig {
  style: ButtonStyle;
  type: ButtonType;
  size: ButtonSize;
  display: ButtonDisplay;
  text?: string;
  icon?: string;
  disabled?: boolean;
}
