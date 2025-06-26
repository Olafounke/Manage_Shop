import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableColumn } from '../../../core/models/table.interface';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() isLoading: boolean = false;
  @Input() editingItem: any = null;

  @Output() editChange = new EventEmitter<{
    item: any;
    key: string;
    value: any;
  }>();

  @ContentChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;
  @ContentChild('passwordTemplate') passwordTemplate!: TemplateRef<any>;

  onEditChange(item: any, key: string, value: any): void {
    this.editChange.emit({ item, key, value });
  }

  getValue(item: any, key: string): any {
    return key.split('.').reduce((obj, key) => obj?.[key], item) ?? '-';
  }

  isEditing(item: any): boolean {
    return this.editingItem && this.editingItem._id === item._id;
  }
}
