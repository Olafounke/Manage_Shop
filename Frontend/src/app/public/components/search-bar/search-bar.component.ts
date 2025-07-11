import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  @Output() searchChange = new EventEmitter<string>();

  searchTerm: string = '';

  onSearch(): void {
    this.searchChange.emit(this.searchTerm);
  }

  onClear(): void {
    this.searchTerm = '';
    this.searchChange.emit('');
  }
}
