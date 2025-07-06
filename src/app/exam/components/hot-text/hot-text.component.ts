import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-hot-text',
  templateUrl: './hot-text.component.html',
  styleUrls: ['./hot-text.component.css'],
  standalone: false
})
export class HotTextComponent implements OnInit {
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

  onTextClick(textId: string): void {
    const hotText = this.question.hotTexts?.find(ht => ht.id === textId);
    if (hotText && hotText.selectable) {
      const index = this.userAnswer.indexOf(textId);
      
      if (index > -1) {
        // Remove if already selected
        this.userAnswer.splice(index, 1);
      } else {
        // Add if not selected
        this.userAnswer.push(textId);
      }
      
      this.updateAnswerAndCorrectness();
    }
  }

  isSelected(textId: string): boolean {
    return this.userAnswer.includes(textId);
  }

  isSelectable(textId: string): boolean {
    const hotText = this.question.hotTexts?.find(ht => ht.id === textId);
    return hotText?.selectable || false;
  }

  getTextClass(textId: string): string {
    const baseClass = 'hot-text-item';
    const selectable = this.isSelectable(textId);
    const selected = this.isSelected(textId);
    
    if (!selectable) {
      return baseClass + ' non-selectable';
    }
    
    if (selected) {
      return baseClass + ' selected';
    }
    
    return baseClass + ' selectable';
  }

  getSelectedText(textId: string): string {
    const hotText = this.question.hotTexts?.find(ht => ht.id === textId);
    return hotText?.text || '';
  }

  getTotalSelectableWords(): number {
    return this.question.hotTexts?.length || 0;
  }

  getSelectableWords(): number {
    return this.question.hotTexts?.filter(ht => ht.selectable).length || 0;
  }

  getCompletedChoices(): number {
    return this.userAnswer.length;
  }

  getProgressPercentage(): number {
    const total = this.question.choiceData?.length || 0;
    if (total === 0) return 0;
    return (this.getCompletedChoices() / total) * 100;
  }

  // Correctness Evaluation
  private evaluateCorrectness(): boolean | undefined {
    if (!this.question.hotTexts || !this.userAnswer) {
      return undefined;
    }

    // Check if any selections have been made
    if (this.userAnswer.length === 0) {
      return undefined;
    }

    // Get all correct hot text IDs
    const correctIds = this.question.hotTexts
      .filter(ht => ht.correct)
      .map(ht => ht.id);

    // Check if user selections match exactly with correct answers
    if (this.userAnswer.length !== correctIds.length) {
      return false;
    }

    return this.userAnswer.every(id => correctIds.includes(id));
  }

  private updateAnswerAndCorrectness(): void {
    this.answerChange.emit(this.userAnswer);
    const isCorrect = this.evaluateCorrectness();
    console.log('Hot-text correctness:', { userAnswer: this.userAnswer, hotTexts: this.question.hotTexts, isCorrect });
    this.correctnessChange.emit(isCorrect);
  }

  // Visual feedback methods for showAnswer mode
  getHotTextClass(hotText: any): string {
    if (!this.showAnswer) return '';
    
    const isSelected = this.isSelected(hotText.id);
    const isCorrect = hotText.correct;
    
    if (isSelected && isCorrect) {
      return 'bg-green-100 border-green-500 text-green-800';
    } else if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-500 text-red-800';
    } else if (!isSelected && isCorrect) {
      return 'bg-green-50 border-green-300 text-green-600 border-dashed';
    }
    
    return '';
  }
}

