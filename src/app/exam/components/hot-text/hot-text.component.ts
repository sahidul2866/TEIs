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
  @Output() answerChange = new EventEmitter<string[]>();

  ngOnInit(): void {
    if (!this.userAnswer) {
      this.userAnswer = [];
      this.answerChange.emit(this.userAnswer);
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
      
      this.answerChange.emit(this.userAnswer);
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
}

