import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ButtonConfig } from '../../../core/models/button.interface';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() config!: ButtonConfig;
  @Input() responsive: boolean = false;
  @Output() onClick = new EventEmitter<any>();

  getButtonClasses(): string[] {
    const classes: string[] = [];

    classes.push(`btn-${this.config.style}`);
    classes.push(`btn-${this.config.size}`);
    classes.push(`btn-${this.config.display}`);

    if (this.responsive && this.config.display === 'icon+text') {
      classes.push('responsive');
    }

    return classes;
  }
}
