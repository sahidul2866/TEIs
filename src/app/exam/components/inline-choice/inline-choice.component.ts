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
  @Input() showAnswer: boolean = false;
  @Output() answerChange = new EventEmitter<number[]>();
  @Output() correctnessChange = new EventEmitter<boolean | undefined>();

  contentParts: string[] = [];
  choicePositions: number[] = [];

  ngOnInit(): void {
    this.parseContent();
    if (!this.userAnswer || this.userAnswer.length === 0) {
      this.userAnswer = new Array(this.question.choiceData?.length || 0).fill(-1);
      this.updateAnswerAndCorrectness();
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
    this.updateAnswerAndCorrectness();
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

  // Correctness Evaluation
  private evaluateCorrectness(): boolean | undefined {
    if (!this.question.choiceData || !this.userAnswer) {
      return undefined;
    }

    // Check if any choices have been made
    const hasAnyChoices = this.userAnswer.some(answer => answer >= 0);
    if (!hasAnyChoices) {
      return undefined;
    }

    // Check if all choices are correctly selected
    for (let i = 0; i < this.question.choiceData.length; i++) {
      const userChoice = this.userAnswer[i];
      const correctChoice = this.question.choiceData[i].correctIndex;
      
      if (userChoice !== correctChoice) {
        return false;
      }
    }

    return true;
  }

  private updateAnswerAndCorrectness(): void {
    this.answerChange.emit(this.userAnswer);
    const isCorrect = this.evaluateCorrectness();
    this.correctnessChange.emit(isCorrect);
  }

  // Visual feedback methods for showAnswer mode
  getSelectClass(choiceIndex: number): string {
    if (!this.showAnswer) return '';
    
    const userSelection = this.userAnswer[choiceIndex];
    const correctSelection = this.question.choiceData?.[choiceIndex]?.correctIndex;
    
    if (userSelection === undefined || correctSelection === undefined) return '';
    
    if (userSelection === correctSelection) {
      return 'border-green-500 bg-green-50 text-green-800';
    } else {
      return 'border-red-500 bg-red-50 text-red-800';
    }
  }

  shouldShowCorrectAnswer(choiceIndex: number): boolean {
    if (!this.showAnswer) return false;
    
    const userSelection = this.userAnswer[choiceIndex];
    const correctSelection = this.question.choiceData?.[choiceIndex]?.correctIndex;
    
    return userSelection !== correctSelection;
  }

  getCorrectAnswerText(choiceIndex: number): string {
    const correctIndex = this.question.choiceData?.[choiceIndex]?.correctIndex;
    if (correctIndex === undefined) return '';
    
    const options = this.question.choiceData?.[choiceIndex]?.options || [];
    return options[correctIndex] || '';
  }
}

