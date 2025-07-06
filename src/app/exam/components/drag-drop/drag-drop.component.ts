import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Question } from '../../../models/question';

interface DragState {
  isDragging: boolean;
  draggedItem: any;
  draggedFromZone: string | null;
  keyboardMode: boolean;
  selectedItem: any;
  selectedZone: string | null;
}

@Component({
  selector: 'app-drag-drop',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css'],
  standalone: false
})
export class DragDropComponent implements OnInit, OnDestroy {
  @Input() question!: Question;
  @Input() userAnswer: any = {};
  @Output() answerChange = new EventEmitter<any>();

  public dragState: DragState = {
    isDragging: false,
    draggedItem: null,
    draggedFromZone: null,
    keyboardMode: false,
    selectedItem: null,
    selectedZone: null
  };

  private touchStartTime = 0;
  private longPressTimer: any;
  private readonly LONG_PRESS_DURATION = 500;

  ngOnInit(): void {
    this.initializeAnswer();
    this.setupAccessibility();
  }

  ngOnDestroy(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  private initializeAnswer(): void {
    if (!this.userAnswer || Object.keys(this.userAnswer).length === 0) {
      this.userAnswer = {};
      this.question.dropZones?.forEach((zone: any) => {
        this.userAnswer[zone.id] = [];
      });
      this.answerChange.emit(this.userAnswer);
    }
  }

  private setupAccessibility(): void {
    // Announce drag and drop functionality to screen readers
    this.announceToScreenReader('Drag and drop interface loaded. Use keyboard navigation to interact with items.');
  }

  // Drag and Drop Event Handlers
  onDragStart(event: DragEvent, item: any): void {
    this.dragState.isDragging = true;
    this.dragState.draggedItem = item;
    this.dragState.keyboardMode = false;

    // Find which zone the item is currently in
    for (const zoneId in this.userAnswer) {
      if (this.userAnswer[zoneId].includes(item.id)) {
        this.dragState.draggedFromZone = zoneId;
        break;
      }
    }

    // Set drag data for accessibility
    event.dataTransfer?.setData('text/plain', item.id);
    event.dataTransfer!.effectAllowed = 'move';

    // Add visual feedback
    const dragElement = event.target as HTMLElement;
    dragElement.classList.add('dragging');

    this.announceToScreenReader(`Picked up ${item.content}`);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
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

    if (this.dragState.draggedItem) {
      this.moveItemToZone(this.dragState.draggedItem, zoneId);
      this.resetDragState();
    }
  }

  // Keyboard Event Handlers
  onKeyDown(event: KeyboardEvent, item: any): void {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.handleKeyboardPickup(item);
        break;
      case 'Escape':
        event.preventDefault();
        this.cancelKeyboardOperation();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (this.dragState.keyboardMode && this.dragState.selectedItem) {
          event.preventDefault();
          this.handleKeyboardNavigation(event.key);
        }
        break;
    }
  }

  onDropZoneKeyDown(event: KeyboardEvent, zoneId: string): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (this.dragState.keyboardMode && this.dragState.selectedItem) {
        this.moveItemToZone(this.dragState.selectedItem, zoneId);
        this.resetDragState();
      }
    }
  }

  private handleKeyboardPickup(item: any): void {
    if (!this.dragState.keyboardMode) {
      // Pick up item
      this.dragState.keyboardMode = true;
      this.dragState.selectedItem = item;
      
      // Find current zone
      for (const zoneId in this.userAnswer) {
        if (this.userAnswer[zoneId].includes(item.id)) {
          this.dragState.draggedFromZone = zoneId;
          break;
        }
      }

      this.announceToScreenReader(`Picked up ${item.content}. Use arrow keys to navigate to a drop zone, then press space or enter to drop.`);
    } else if (this.dragState.selectedItem === item) {
      // Drop item back to original location
      this.cancelKeyboardOperation();
    }
  }

  private handleKeyboardNavigation(direction: string): void {
    // Implementation for keyboard navigation between zones
    const zones = this.question.dropZones || [];
    const currentZoneIndex = zones.findIndex(zone => zone.id === this.dragState.selectedZone);
    
    let newIndex = currentZoneIndex;
    switch (direction) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = (currentZoneIndex + 1) % zones.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = currentZoneIndex > 0 ? currentZoneIndex - 1 : zones.length - 1;
        break;
    }

    if (newIndex !== currentZoneIndex) {
      this.dragState.selectedZone = zones[newIndex].id;
      this.focusDropZone(zones[newIndex].id);
      this.announceToScreenReader(`Navigated to ${zones[newIndex].label}`);
    }
  }

  private cancelKeyboardOperation(): void {
    if (this.dragState.keyboardMode && this.dragState.selectedItem) {
      this.announceToScreenReader(`Cancelled moving ${this.dragState.selectedItem.content}`);
    }
    this.resetDragState();
  }

  private focusDropZone(zoneId: string): void {
    const zoneElement = document.querySelector(`[aria-label*="${zoneId}"]`) as HTMLElement;
    if (zoneElement) {
      zoneElement.focus();
    }
  }

  // Touch Event Handlers
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartTime = Date.now();
    const target = event.target as HTMLElement;
    
    if (target.classList.contains('drag-item') || target.closest('.drag-item')) {
      this.longPressTimer = setTimeout(() => {
        this.handleLongPress(target);
      }, this.LONG_PRESS_DURATION);
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    
    const touchDuration = Date.now() - this.touchStartTime;
    if (touchDuration < this.LONG_PRESS_DURATION) {
      // Handle tap
      this.handleTap(event);
    }
  }

  private handleLongPress(element: HTMLElement): void {
    // Provide haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Visual feedback for long press
    element.classList.add('long-pressed');
    setTimeout(() => element.classList.remove('long-pressed'), 200);
  }

  private handleTap(event: TouchEvent): void {
    const target = event.target as HTMLElement;
    const dragItem = target.closest('.drag-item');
    
    if (dragItem) {
      // Handle item selection for touch devices
      const itemId = dragItem.getAttribute('data-item-id');
      if (itemId) {
        // Toggle selection or perform action
        this.handleTouchItemInteraction(itemId);
      }
    }
  }

  private handleTouchItemInteraction(itemId: string): void {
    const item = this.findItemById(itemId);
    if (item) {
      // Implement touch-specific interaction logic
      this.announceToScreenReader(`Selected ${item.content}`);
    }
  }

  // Core Logic Methods
  private moveItemToZone(item: any, targetZoneId: string): void {
    // Remove from previous zone if exists
    if (this.dragState.draggedFromZone) {
      const index = this.userAnswer[this.dragState.draggedFromZone].indexOf(item.id);
      if (index > -1) {
        this.userAnswer[this.dragState.draggedFromZone].splice(index, 1);
      }
    }

    // Add to new zone
    if (!this.userAnswer[targetZoneId]) {
      this.userAnswer[targetZoneId] = [];
    }
    this.userAnswer[targetZoneId].push(item.id);
    
    this.answerChange.emit(this.userAnswer);
    
    const targetZone = this.question.dropZones?.find(zone => zone.id === targetZoneId);
    this.announceToScreenReader(`Dropped ${item.content} in ${targetZone?.label || targetZoneId}`);
  }

  removeFromZone(zoneId: string, itemId: string): void {
    const index = this.userAnswer[zoneId].indexOf(itemId);
    if (index > -1) {
      this.userAnswer[zoneId].splice(index, 1);
      this.answerChange.emit(this.userAnswer);
      
      const item = this.findItemById(itemId);
      const zone = this.question.dropZones?.find(z => z.id === zoneId);
      this.announceToScreenReader(`Removed ${item?.content || 'item'} from ${zone?.label || zoneId}`);
    }
  }

  private resetDragState(): void {
    this.dragState = {
      isDragging: false,
      draggedItem: null,
      draggedFromZone: null,
      keyboardMode: false,
      selectedItem: null,
      selectedZone: null
    };

    // Remove visual feedback
    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
  }

  // Helper Methods
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

  private findItemById(itemId: string): any {
    return this.question.dragItems?.find(item => item.id === itemId);
  }

  getPlacedItemsCount(): number {
    let count = 0;
    for (const zoneId in this.userAnswer) {
      count += this.userAnswer[zoneId].length;
    }
    return count;
  }

  getTotalItemsCount(): number {
    return this.question.dragItems?.length || 0;
  }

  getProgressPercentage(): number {
    const total = this.getTotalItemsCount();
    if (total === 0) return 0;
    return Math.round((this.getPlacedItemsCount() / total) * 100);
  }

  // Track by functions for performance
  trackByItemId(index: number, item: any): string {
    return item.id;
  }

  trackByZoneId(index: number, zone: any): string {
    return zone.id;
  }

  // Accessibility Methods
  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Validation Methods
  isValidDrop(item: any, zoneId: string): boolean {
    const zone = this.question.dropZones?.find(z => z.id === zoneId);
    if (!zone || !zone.acceptedTypes) return true;
    
    return zone.acceptedTypes.includes(item.type);
  }

  getDropZoneStatus(zoneId: string): string {
    const itemCount = this.getItemsInZone(zoneId).length;
    if (itemCount === 0) return 'empty';
    if (itemCount === 1) return 'has-one';
    return 'has-multiple';
  }
}