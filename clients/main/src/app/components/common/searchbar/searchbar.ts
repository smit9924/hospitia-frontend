import { Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-searchbar',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './searchbar.html',
  styleUrl: './searchbar.scss',
  host: {
    '[class.searchbar-host--compact]': 'compact()',
  },
})
export class Searchbar {
  placeholder = input('Search');
  compact = input(false);
  search = output<string>();

  protected readonly term = signal('');

  protected onTermInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.term.set(target.value);
  }

  protected emitSearch(): void {
    this.search.emit(this.term().trim());
  }

  protected clear(): void {
    this.term.set('');
    this.search.emit('');
  }
}
