import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-fill-blank',
  templateUrl: './fill-blank.component.html',
  styleUrls: ['./fill-blank.component.css'],
  standalone: false
})
export class FillBlankComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: string[] = [];
  @Input() showAnswer: boolean = false;
  @Output() answerChange = new EventEmitter<string[]>();
  @Output() correctnessChange = new EventEmitter<boolean | undefined>();

  contentParts: string[] = [];
  blankPositions: number[] = [];

  ngOnInit(): void {
    this.parseContent();
    if (!this.userAnswer || this.userAnswer.length === 0) {
      this.userAnswer = new Array(this.question.blanks?.length || 0).fill('');
      this.updateAnswerAndCorrectness();
    }
  }

  private parseContent(): void {
    let content = this.question.content;
    const blanks = this.question.blanks || [];
    
    // Replace each blank with a placeholder
    blanks.forEach((blank, index) => {
      content = content.replace('_____', `__BLANK_${index}__`);
    });
    
    // Split by blank placeholders
    this.contentParts = content.split(/__BLANK_\d+__/);
    
    // Get blank positions
    this.blankPositions = blanks.map((_, index) => index);
  }

  onInputChange(index: number, value: string): void {
    this.userAnswer[index] = value;
    this.updateAnswerAndCorrectness();
  }

  getBlankPlaceholder(index: number): string {
    return this.question.blanks?.[index]?.placeholder || 'Enter answer';
  }

  getInputWidth(index: number): string {
    // Calculate width based on placeholder text or a minimum width
    const placeholder = this.getBlankPlaceholder(index);
    const minWidth = Math.max(placeholder.length * 8, 100);
    return `${minWidth}px`;
  }

  // Correctness Evaluation
  private evaluateCorrectness(): boolean | undefined {
    if (!this.question.blanks || !this.userAnswer) {
      return undefined;
    }

    // Check if any answers have been provided
    const hasAnyAnswers = this.userAnswer.some(answer => 
      answer && answer.trim().length > 0
    );

    if (!hasAnyAnswers) {
      return undefined;
    }

    // Check if all blanks are correctly filled
    for (let i = 0; i < this.question.blanks.length; i++) {
      const userInput = this.userAnswer[i]?.toLowerCase().trim();
      const correctAnswer = this.question.blanks[i].correctAnswer.toLowerCase().trim();
      
      if (userInput !== correctAnswer) {
        return false;
      }
    }

    return true;
  }

  private updateAnswerAndCorrectness(): void {
    this.answerChange.emit(this.userAnswer);
    const isCorrect = this.evaluateCorrectness();
    console.log('Fill-blank correctness:', { userAnswer: this.userAnswer, blanks: this.question.blanks, isCorrect });
    this.correctnessChange.emit(isCorrect);
  }

  // Visual feedback methods for showAnswer mode
  getInputClass(index: number): string {
    if (!this.showAnswer) return '';
    
    const userAnswer = this.userAnswer[index]?.trim().toLowerCase() || '';
    const correctAnswer = this.question.blanks?.[index]?.correctAnswer?.toLowerCase() || '';
    
    if (!userAnswer) return '';
    
    if (userAnswer === correctAnswer) {
      return 'border-green-500 bg-green-50 text-green-800';
    } else {
      return 'border-red-500 bg-red-50 text-red-800';
    }
  }

  shouldShowCorrectAnswer(index: number): boolean {
    if (!this.showAnswer) return false;
    
    const userAnswer = this.userAnswer[index]?.trim().toLowerCase() || '';
    const correctAnswer = this.question.blanks?.[index]?.correctAnswer?.toLowerCase() || '';
    
    return userAnswer !== correctAnswer;
  }

  getCorrectAnswerText(index: number): string {
    return this.question.blanks?.[index]?.correctAnswer || '';
  }
}
