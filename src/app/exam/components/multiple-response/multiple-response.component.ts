import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-multiple-response',
  templateUrl: './multiple-response.component.html',
  styleUrls: ['./multiple-response.component.css'],
  standalone: false
})
export class MultipleResponseComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: number[] = [];
  @Output() answerChange = new EventEmitter<number[]>();

  ngOnInit(): void {
    if (!this.userAnswer) {
      this.userAnswer = [];
      this.answerChange.emit(this.userAnswer);
    }
  }

  onOptionToggle(optionIndex: number): void {
    const currentIndex = this.userAnswer.indexOf(optionIndex);
    
    if (currentIndex > -1) {
      // Remove if already selected
      this.userAnswer.splice(currentIndex, 1);
    } else {
      // Add if not selected
      this.userAnswer.push(optionIndex);
    }
    
    // Sort to maintain consistent order
    this.userAnswer.sort((a, b) => a - b);
    this.answerChange.emit(this.userAnswer);
  }

  isSelected(optionIndex: number): boolean {
    return this.userAnswer.includes(optionIndex);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  }

  getSelectedCount(): number {
    return this.userAnswer.length;
  }

  getSelectedOptions(): string[] {
    return this.userAnswer.map(index => 
      `${this.getOptionLetter(index)}. ${this.question.options![index]}`
    );
  }
}
