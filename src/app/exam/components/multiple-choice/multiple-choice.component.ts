import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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

  ngOnInit(): void {
    // Initialize if no answer provided
    if (this.userAnswer === null || this.userAnswer === undefined) {
      this.userAnswer = null;
    }
  }

  onOptionSelect(optionIndex: number): void {
    this.userAnswer = optionIndex;
    this.answerChange.emit(optionIndex);
  }

  isSelected(optionIndex: number): boolean {
    return this.userAnswer === optionIndex;
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  }
}
