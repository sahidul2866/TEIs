import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-multiple-choice',
  templateUrl: './multiple-choice.component.html',
  styleUrls: ['./multiple-choice.component.css'],
  standalone: false
})
export class MultipleChoiceComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: number | null = null;
  @Output() answerChange = new EventEmitter<number>();

  confidenceLevel: number = 3;
  private lastSelectedTime: number = 0;

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    // Initialize if no answer provided
    if (this.userAnswer === null || this.userAnswer === undefined) {
      this.userAnswer = null;
    }
    
    // Set up initial accessibility announcement
    this.announceToScreenReader(`Multiple choice question loaded with ${this.question.options?.length || 0} options`);
  }

  // Selection Methods
  onOptionSelect(optionIndex: number): void {
    const previousAnswer = this.userAnswer;
    this.userAnswer = optionIndex;
    this.lastSelectedTime = Date.now();
    
    this.answerChange.emit(optionIndex);
    
    // Provide audio/haptic feedback
    this.provideFeedback();
    
    // Announce selection to screen readers
    const optionText = this.question.options?.[optionIndex] || '';
    this.announceToScreenReader(`Selected option ${this.getOptionLetter(optionIndex)}: ${optionText}`);
    
    // Track selection change for analytics
    this.trackSelectionChange(previousAnswer, optionIndex);
  }

  clearSelection(): void {
    const previousAnswer = this.userAnswer;
    this.userAnswer = null;
    this.answerChange.emit(-1); // Emit -1 to indicate no selection
    
    this.announceToScreenReader('Selection cleared');
    this.trackSelectionChange(previousAnswer, null);
  }

  // Keyboard Event Handlers
  onKeyDown(event: KeyboardEvent, optionIndex: number): void {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.onOptionSelect(optionIndex);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.navigateToNextOption(optionIndex);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.navigateToPreviousOption(optionIndex);
        break;
      case 'Home':
        event.preventDefault();
        this.focusOption(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusOption((this.question.options?.length || 1) - 1);
        break;
      case 'Escape':
        event.preventDefault();
        this.clearSelection();
        break;
    }
    
    // Handle number key selection (1-9)
    const numberKey = parseInt(event.key);
    if (numberKey >= 1 && numberKey <= (this.question.options?.length || 0)) {
      event.preventDefault();
      this.onOptionSelect(numberKey - 1);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    // Handle global keyboard shortcuts when component is focused
    if (this.isComponentFocused()) {
      switch (event.key) {
        case 'c':
        case 'C':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.clearSelection();
          }
          break;
      }
    }
  }

  // Navigation Methods
  private navigateToNextOption(currentIndex: number): void {
    const nextIndex = (currentIndex + 1) % (this.question.options?.length || 1);
    this.focusOption(nextIndex);
  }

  private navigateToPreviousOption(currentIndex: number): void {
    const optionCount = this.question.options?.length || 1;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : optionCount - 1;
    this.focusOption(prevIndex);
  }

  private focusOption(index: number): void {
    const optionElements = document.querySelectorAll('.option-item');
    const targetElement = optionElements[index] as HTMLElement;
    if (targetElement) {
      targetElement.focus();
      this.announceToScreenReader(`Focused on option ${this.getOptionLetter(index)}`);
    }
  }

  private isComponentFocused(): boolean {
    const activeElement = document.activeElement;
    return activeElement?.closest('.multiple-choice-container') !== null;
  }

  // Confidence Level Methods
  onConfidenceChange(): void {
    this.announceToScreenReader(`Confidence level set to ${this.getConfidenceText()}`);
  }

  getConfidenceText(): string {
    const levels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    return levels[this.confidenceLevel - 1] || 'Medium';
  }

  // Utility Methods
  isSelected(optionIndex: number): boolean {
    return this.userAnswer === optionIndex;
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  }

  getProgressPercentage(): number {
    return this.userAnswer !== null ? 100 : 0;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Feedback Methods
  private provideFeedback(): void {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Audio feedback (if enabled in user preferences)
    this.playSelectionSound();
  }

  private playSelectionSound(): void {
    // Create a subtle audio cue for selection
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Audio feedback not available, continue silently
    }
  }

  // Analytics and Tracking
  private trackSelectionChange(previousAnswer: number | null, newAnswer: number | null): void {
    const changeData = {
      questionId: this.question.id,
      previousAnswer,
      newAnswer,
      timestamp: Date.now(),
      timeSpent: this.lastSelectedTime > 0 ? Date.now() - this.lastSelectedTime : 0
    };
    
    // Send to analytics service (implementation depends on your analytics setup)
    console.log('Selection change tracked:', changeData);
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
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  // Validation Methods
  isValidSelection(): boolean {
    return this.userAnswer !== null && 
           this.userAnswer >= 0 && 
           this.userAnswer < (this.question.options?.length || 0);
  }

  getSelectionSummary(): string {
    if (this.userAnswer === null) {
      return 'No option selected';
    }
    
    const optionLetter = this.getOptionLetter(this.userAnswer);
    const optionText = this.question.options?.[this.userAnswer] || '';
    return `Selected option ${optionLetter}: ${optionText}`;
  }

  // Export Methods for Testing/Debugging
  exportState(): any {
    return {
      questionId: this.question.id,
      selectedAnswer: this.userAnswer,
      confidenceLevel: this.confidenceLevel,
      timestamp: Date.now(),
      isValid: this.isValidSelection()
    };
  }

  // Touch/Mobile Optimizations
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    // Add touch feedback class for visual response
    const target = event.target as HTMLElement;
    const optionItem = target.closest('.option-item');
    if (optionItem) {
      optionItem.classList.add('touch-active');
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    // Remove touch feedback class
    const target = event.target as HTMLElement;
    const optionItem = target.closest('.option-item');
    if (optionItem) {
      optionItem.classList.remove('touch-active');
    }
  }

  // Performance Optimization
  shouldShowConfidence(): boolean {
    return this.userAnswer !== null;
  }

  getAriaLabel(): string {
    return `Multiple choice question: ${this.question.content}. ${this.question.options?.length || 0} options available.`;
  }

  getOptionAriaLabel(index: number): string {
    const option = this.question.options?.[index] || '';
    const letter = this.getOptionLetter(index);
    const selected = this.isSelected(index) ? 'Selected' : 'Not selected';
    return `Option ${letter}: ${option}. ${selected}.`;
  }
}