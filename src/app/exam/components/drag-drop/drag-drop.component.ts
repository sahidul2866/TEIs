import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-drag-drop',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css'],
  standalone: false
})
export class DragDropComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: any = {};
  @Output() answerChange = new EventEmitter<any>();

  draggedItem: any = null;
  draggedFromZone: string | null = null;

  ngOnInit(): void {
    if (!this.userAnswer) {
      this.userAnswer = {};
      this.question.dropZones?.forEach(zone => {
        this.userAnswer[zone.id] = [];
      });
      this.answerChange.emit(this.userAnswer);
    }
  }

  onDragStart(event: DragEvent, item: any): void {
    this.draggedItem = item;
    event.dataTransfer?.setData('text/plain', '');
    
    // Check if item is already in a zone
    for (const zoneId in this.userAnswer) {
      if (this.userAnswer[zoneId].includes(item.id)) {
        this.draggedFromZone = zoneId;
        break;
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragEnter(event: DragEvent, zoneId: string): void {
    event.preventDefault();
    const element = event.currentTarget as HTMLElement;
    element.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('drag-over');
  }

  onDrop(event: DragEvent, zoneId: string): void {
    event.preventDefault();
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('drag-over');

    if (this.draggedItem) {
      // Remove from previous zone if exists
      if (this.draggedFromZone) {
        const index = this.userAnswer[this.draggedFromZone].indexOf(this.draggedItem.id);
        if (index > -1) {
          this.userAnswer[this.draggedFromZone].splice(index, 1);
        }
      }

      // Add to new zone
      if (!this.userAnswer[zoneId]) {
        this.userAnswer[zoneId] = [];
      }
      this.userAnswer[zoneId].push(this.draggedItem.id);
      
      this.answerChange.emit(this.userAnswer);
      this.draggedItem = null;
      this.draggedFromZone = null;
    }
  }

  getAvailableItems(): any[] {
    const assignedItems = new Set();
    for (const zoneId in this.userAnswer) {
      this.userAnswer[zoneId].forEach((itemId: string) => assignedItems.add(itemId));
    }
    return this.question.dragItems?.filter(item => !assignedItems.has(item.id)) || [];
  }

  getItemsInZone(zoneId: string): any[] {
    const itemIds = this.userAnswer[zoneId] || [];
    return itemIds.map((id: string) => this.question.dragItems?.find(item => item.id === id)).filter(Boolean);
  }

  removeFromZone(zoneId: string, itemId: string): void {
    const index = this.userAnswer[zoneId].indexOf(itemId);
    if (index > -1) {
      this.userAnswer[zoneId].splice(index, 1);
      this.answerChange.emit(this.userAnswer);
    }
  }
}
