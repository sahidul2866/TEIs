import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-hot-spot',
  templateUrl: './hot-spot.component.html',
  styleUrls: ['./hot-spot.component.css'],
  standalone: false
})
export class HotSpotComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: string[] = [];
  @Input() showAnswer: boolean = false;
  @Output() answerChange = new EventEmitter<string[]>();
  @Output() correctnessChange = new EventEmitter<boolean | undefined>();

  ngOnInit(): void {
    if (!this.userAnswer) {
      this.userAnswer = [];
      this.updateAnswerAndCorrectness();
    }
  }

  onHotSpotClick(hotSpotId: string): void {
    const index = this.userAnswer.indexOf(hotSpotId);
    
    if (index > -1) {
      // Remove if already selected
      this.userAnswer.splice(index, 1);
    } else {
      // Add if not selected
      this.userAnswer.push(hotSpotId);
    }
    
    this.updateAnswerAndCorrectness();
  }

  isSelected(hotSpotId: string): boolean {
    return this.userAnswer.includes(hotSpotId);
  }

  getHotSpotStyle(hotSpot: any): any {
    const baseStyle = {
      position: 'absolute',
      left: hotSpot.x + 'px',
      top: hotSpot.y + 'px',
      width: hotSpot.width + 'px',
      height: hotSpot.height + 'px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };

    if (hotSpot.shape === 'circle') {
      return {
        ...baseStyle,
        borderRadius: '50%',
        backgroundColor: this.isSelected(hotSpot.id) ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        border: this.isSelected(hotSpot.id) ? '2px solid #3b82f6' : '2px solid transparent'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: this.isSelected(hotSpot.id) ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        border: this.isSelected(hotSpot.id) ? '2px solid #3b82f6' : '2px solid transparent'
      };
    }
  }

  // Correctness Evaluation
  private evaluateCorrectness(): boolean | undefined {
    if (!this.question.hotSpots || !this.userAnswer) {
      return undefined;
    }

    // Check if any selections have been made
    if (this.userAnswer.length === 0) {
      return undefined;
    }

    // Get all correct hot spot IDs
    const correctIds = this.question.hotSpots
      .filter(hs => hs.correct)
      .map(hs => hs.id);

    // Check if user selections match exactly with correct answers
    if (this.userAnswer.length !== correctIds.length) {
      return false;
    }

    return this.userAnswer.every(id => correctIds.includes(id));
  }

  private updateAnswerAndCorrectness(): void {
    this.answerChange.emit(this.userAnswer);
    const isCorrect = this.evaluateCorrectness();
    this.correctnessChange.emit(isCorrect);
  }

  // Visual feedback methods for showAnswer mode
  getHotSpotClass(hotSpot: any): string {
    if (!this.showAnswer) return '';
    
    const isSelected = this.isSelected(hotSpot.id);
    const isCorrect = hotSpot.correct;
    
    if (isSelected && isCorrect) {
      return 'border-green-500 bg-green-100 text-green-800';
    } else if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-100 text-red-800';
    } else if (!isSelected && isCorrect) {
      return 'border-green-500 bg-green-50 text-green-600';
    }
    
    return '';
  }

  shouldShowCorrectIndicator(hotSpot: any): boolean {
    if (!this.showAnswer) return false;
    return hotSpot.correct && !this.isSelected(hotSpot.id);
  }

  shouldShowIncorrectIndicator(hotSpot: any): boolean {
    if (!this.showAnswer) return false;
    return !hotSpot.correct && this.isSelected(hotSpot.id);
  }
}
