import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-inline-choice',
  templateUrl: './inline-choice.component.html',
  styleUrls: ['./inline-choice.component.css'],
  standalone: false
})
export class InlineChoiceComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: number[] = [];
  @Output() answerChange = new EventEmitter<number[]>();

  contentParts: string[] = [];
  choicePositions: number[] = [];

  ngOnInit(): void {
    this.parseContent();
    if (!this.userAnswer || this.userAnswer.length === 0) {
      this.userAnswer = new Array(this.question.choiceData?.length || 0).fill(-1);
      this.answerChange.emit(this.userAnswer);
    }
  }

  private parseContent(): void {
    let content = this.question.content;
    const choices = this.question.choiceData || [];
    
    // Replace each choice with a placeholder
    choices.forEach((choice, index) => {
      content = content.replace(/\[([^\]]+)\]/, `__CHOICE_${index}__`);
    });
    
    // Split by choice placeholders
    this.contentParts = content.split(/__CHOICE_\d+__/);
    
    // Get choice positions
    this.choicePositions = choices.map((_, index) => index);
  }

  onChoiceChange(choiceIndex: number, selectedOptionIndex: number): void {
    this.userAnswer[choiceIndex] = selectedOptionIndex;
    this.answerChange.emit(this.userAnswer);
  }

  getChoiceOptions(choiceIndex: number): string[] {
    return this.question.choiceData?.[choiceIndex]?.options || [];
  }

  getSelectedOption(choiceIndex: number): string {
    const selectedIndex = this.userAnswer[choiceIndex];
    if (selectedIndex >= 0) {
      return this.getChoiceOptions(choiceIndex)[selectedIndex];
    }
    return '';
  }

  hasValidSelection(choiceIndex: number): boolean {
    return this.userAnswer[choiceIndex] >= 0;
  }

  getCompletedChoices(): number {
    return this.userAnswer.filter(answer => answer !== undefined && answer !== null && answer >= 0).length;
  }

  getProgressPercentage(): number {
    const total = this.question.choiceData?.length || 0;
    if (total === 0) return 0;
    return (this.getCompletedChoices() / total) * 100;
  }
}

