import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-equation-editor',
  templateUrl: './equation-editor.component.html',
  styleUrls: ['./equation-editor.component.css'],
  standalone: false
})
export class EquationEditorComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: string = '';
  @Output() answerChange = new EventEmitter<string>();

  currentEquation: string = '';
  variables: string[] = [];
  operators: string[] = [];
  cursorPosition: number = 0;

  ngOnInit(): void {
    this.variables = this.question.equationData?.variables || ['x', 'y', 'z'];
    this.operators = this.question.equationData?.operators || ['+', '-', '*', '/', '='];
    this.currentEquation = this.userAnswer || '';
  }

  insertSymbol(symbol: string): void {
    const before = this.currentEquation.substring(0, this.cursorPosition);
    const after = this.currentEquation.substring(this.cursorPosition);
    this.currentEquation = before + symbol + after;
    this.cursorPosition += symbol.length;
    this.updateAnswer();
  }

  insertNumber(number: string): void {
    this.insertSymbol(number);
  }

  insertVariable(variable: string): void {
    this.insertSymbol(variable);
  }

  insertOperator(operator: string): void {
    this.insertSymbol(' ' + operator + ' ');
  }

  clearEquation(): void {
    this.currentEquation = '';
    this.cursorPosition = 0;
    this.updateAnswer();
  }

  backspace(): void {
    if (this.cursorPosition > 0) {
      const before = this.currentEquation.substring(0, this.cursorPosition - 1);
      const after = this.currentEquation.substring(this.cursorPosition);
      this.currentEquation = before + after;
      this.cursorPosition = Math.max(0, this.cursorPosition - 1);
      this.updateAnswer();
    }
  }

  onDirectInput(event: any): void {
    this.currentEquation = event.target.value;
    this.cursorPosition = event.target.selectionStart || 0;
    this.updateAnswer();
  }

  onCursorChange(event: any): void {
    this.cursorPosition = event.target.selectionStart || 0;
  }

  private updateAnswer(): void {
    this.answerChange.emit(this.currentEquation);
  }

  getNumberButtons(): string[] {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  }

  insertFunction(func: string): void {
    this.insertSymbol(func + '(');
  }

  insertParenthesis(paren: string): void {
    this.insertSymbol(paren);
  }
}
