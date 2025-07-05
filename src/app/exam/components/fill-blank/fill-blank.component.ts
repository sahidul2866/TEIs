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
  @Output() answerChange = new EventEmitter<string[]>();

  contentParts: string[] = [];
  blankPositions: number[] = [];

  ngOnInit(): void {
    this.parseContent();
    if (!this.userAnswer || this.userAnswer.length === 0) {
      this.userAnswer = new Array(this.question.blanks?.length || 0).fill('');
      this.answerChange.emit(this.userAnswer);
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
    this.answerChange.emit(this.userAnswer);
  }

  getBlankPlaceholder(index: number): string {
    return this.question.blanks?.[index]?.placeholder || 'Enter answer';
  }
}
