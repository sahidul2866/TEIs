import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-solution-set',
  templateUrl: './solution-set.component.html',
  styleUrls: ['./solution-set.component.css'],
  standalone: false
})
export class SolutionSetComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: string = '';
  @Output() answerChange = new EventEmitter<string>();

  selectedSolution: string = '';
  customSolution: string = '';
  useCustomInput: boolean = false;

  ngOnInit(): void {
    this.selectedSolution = this.userAnswer || '';
    
    // Check if user answer is one of the predefined options
    const predefinedOptions = this.getSolutionOptions();
    if (!predefinedOptions.includes(this.selectedSolution)) {
      this.customSolution = this.selectedSolution;
      this.useCustomInput = true;
    }
  }

  onSolutionSelect(solution: string): void {
    this.selectedSolution = solution;
    this.useCustomInput = false;
    this.customSolution = '';
    this.userAnswer = solution;
    this.answerChange.emit(solution);
  }

  onCustomSolutionChange(solution: string): void {
    this.customSolution = solution;
    this.selectedSolution = '';
    this.userAnswer = solution;
    this.answerChange.emit(solution);
  }

  toggleCustomInput(): void {
    this.useCustomInput = !this.useCustomInput;
    if (this.useCustomInput) {
      this.selectedSolution = '';
      this.userAnswer = this.customSolution;
    } else {
      this.customSolution = '';
      this.userAnswer = this.selectedSolution;
    }
    this.answerChange.emit(this.userAnswer);
  }

  getSolutionOptions(): string[] {
    return this.question.solutionData?.inequalities || [];
  }

  getEquation(): string {
    return this.question.solutionData?.equation || '';
  }

  getCurrentAnswer(): string {
    return this.useCustomInput ? this.customSolution : this.selectedSolution;
  }

  hasValidAnswer(): boolean {
    return this.getCurrentAnswer().trim().length > 0;
  }

  clearAnswer(): void {
    this.selectedSolution = '';
    this.customSolution = '';
    this.userAnswer = '';
    this.answerChange.emit('');
  }

  getSolutionTypeLabel(solution: string): string {
    if (solution.includes('>')) {
      return 'Greater than';
    } else if (solution.includes('<')) {
      return 'Less than';
    } else if (solution.includes('≥')) {
      return 'Greater than or equal to';
    } else if (solution.includes('≤')) {
      return 'Less than or equal to';
    } else if (solution.includes('=')) {
      return 'Equal to';
    } else {
      return 'Custom solution';
    }
  }

  validateSolution(solution: string): boolean {
    // Basic validation for mathematical expressions
    const pattern = /^[x\d\s+\-*/().<>=≤≥]+$/;
    return pattern.test(solution);
  }
}

