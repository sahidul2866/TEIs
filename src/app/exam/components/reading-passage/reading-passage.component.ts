/**
 * User Story: As a student, I want to read a passage or watch a video and then answer a related question so that I can demonstrate my comprehension skills.
 * Scoring: 1 point per correct answer, no penalty for wrong, maxScore = 1
 */

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TEIItemJSON } from '../../../models/question';

@Component({
  selector: 'app-reading-passage',
  templateUrl: './reading-passage.component.html',
  styleUrls: ['./reading-passage.component.scss'],
  standalone: false
})
export class ReadingPassageComponent implements OnInit {
  @Input() question!: any;
  @Input() userAnswer: any = null;
  @Output() answerChange = new EventEmitter<any>();

  selectedAnswer: number | null = null;
  activeTab: 'video' | 'passage' = 'passage';

  ngOnInit(): void {
    if (this.itemData.passageData?.hasVideo && !this.itemData.passageData?.hasText) {
      this.activeTab = 'video';
    }
  }

  selectTab(tab: 'video' | 'passage'): void {
    this.activeTab = tab;
  }

  onAnswerSelect(optionIndex: number): void {
    this.selectedAnswer = optionIndex;
    this.emitResponse();
  }

  onKeyDown(event: KeyboardEvent, optionIndex: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onAnswerSelect(optionIndex);
    }
  }

  clearAnswer(): void {
    this.selectedAnswer = null;
    this.emitResponse();
  }

  submitAnswer(): void {
    this.emitResponse();
  }

  private emitResponse(): void {
    const isCorrect = this.selectedAnswer === this.itemData.passageData?.question.correctAnswer;
    this.responseChange.emit({
      itemId: this.itemData.itemId,
      response: this.selectedAnswer,
      isCorrect: isCorrect
    });
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  isValidSelection(): boolean {
    return this.selectedAnswer !== null;
  }

  hasVideo(): boolean {
    return this.itemData.passageData?.hasVideo || false;
  }

  hasText(): boolean {
    return this.itemData.passageData?.hasText || false;
  }
}