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

  // Graph visualization methods
  getTickMarks(): number[] {
    return [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
  }

  getTickPosition(value: number): number {
    // Map value to SVG x coordinate (50 to 450)
    const range = 400; // 450 - 50
    const scale = range / 10; // 10 units from -5 to 5
    return 50 + (value + 5) * scale;
  }

  getSolutionType(): string {
    const answer = this.getCurrentAnswer();
    if (!answer) return '';
    
    if (answer.includes('>') && !answer.includes('=')) return 'greater';
    if (answer.includes('<') && !answer.includes('=')) return 'less';
    if (answer.includes('≥') || answer.includes('>=')) return 'greater';
    if (answer.includes('≤') || answer.includes('<=')) return 'less';
    if (answer.includes('=') && !answer.includes('>') && !answer.includes('<')) return 'equal';
    if (answer.includes('<') && answer.includes('<')) return 'between';
    
    return '';
  }

  getSolutionStartX(): number {
    const answer = this.getCurrentAnswer();
    if (!answer) return 0;
    
    // Extract the number from the inequality
    const numbers = answer.match(/-?\d+\.?\d*/g);
    if (numbers && numbers.length > 0) {
      const value = parseFloat(numbers[0]);
      return this.getTickPosition(value);
    }
    return 0;
  }

  getSolutionEndX(): number {
    const answer = this.getCurrentAnswer();
    if (!answer) return 0;
    
    // For between cases like "-1 < x < 5"
    const numbers = answer.match(/-?\d+\.?\d*/g);
    if (numbers && numbers.length > 1) {
      const value = parseFloat(numbers[1]);
      return this.getTickPosition(value);
    }
    return 0;
  }

  isInclusiveStart(): boolean {
    const answer = this.getCurrentAnswer();
    return answer.includes('≥') || answer.includes('≤') || answer.includes('=');
  }

  getArrowPoints(direction: string): string {
    if (direction === 'right') {
      return "440,35 450,40 440,45";
    } else {
      return "60,35 50,40 60,45";
    }
  }

  getCurrentAnswer(): string {
    return this.useCustomInput ? this.customSolution : this.selectedSolution;
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

