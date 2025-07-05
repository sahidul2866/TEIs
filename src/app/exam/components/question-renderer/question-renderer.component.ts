import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-question-renderer',
  templateUrl: './question-renderer.component.html',
  styleUrls: ['./question-renderer.component.css'],
  standalone: false
})
export class QuestionRendererComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: any = null;
  @Output() answerChange = new EventEmitter<any>();

  ngOnInit(): void {
    // Initialize answer if not provided
    if (!this.userAnswer) {
      this.initializeAnswer();
    }
  }

  private initializeAnswer(): void {
    switch (this.question.type) {
      case 'multipleResponse':
        this.userAnswer = [];
        break;
      case 'fillBlank':
        this.userAnswer = new Array(this.question.blanks?.length || 0).fill('');
        break;
      case 'hotText':
        this.userAnswer = [];
        break;
      case 'dragDrop':
        this.userAnswer = {};
        break;
      case 'hotspot':
        this.userAnswer = [];
        break;
      case 'tableGrid':
        this.userAnswer = [];
        break;
      case 'pointGraph':
        this.userAnswer = [];
        break;
      case 'inlineChoice':
        this.userAnswer = new Array(this.question.choiceData?.length || 0).fill(-1);
        break;
      default:
        this.userAnswer = null;
    }
    this.answerChange.emit(this.userAnswer);
  }

  onAnswerUpdate(answer: any): void {
    this.userAnswer = answer;
    this.answerChange.emit(answer);
  }
}
