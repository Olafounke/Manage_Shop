import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
})
export class CategoryFilterComponent implements OnInit {
  @Input() selectedCategory: string = '';
  @Output() categoryChange = new EventEmitter<string>();

  categories: string[] = [];
  loading: boolean = false;

  dropdownOpen = false;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategoryNames().subscribe({
      next: (categories: string[]) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des catégories:', error);
        this.loading = false;
      },
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.categoryChange.emit(category);
  }

  clearFilter(): void {
    this.selectedCategory = '';
    this.categoryChange.emit('');
    this.dropdownOpen = false;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectAndClose(category: string): void {
    this.onCategoryChange(category);
    this.dropdownOpen = false;
  }
}
