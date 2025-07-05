import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../services/question.service';
import { Question, UserAnswer } from '../models/question';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css'],
  standalone: false
})
export class ExamComponent implements OnInit {
  questions: Question[] = [];
  currentIndex = 0;
  answers: Map<string, any> = new Map();
  showResults = false;
  score = 0;
  totalPoints = 0;
  startTime = Date.now();
  timeSpent = 0;

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.questions = this.questionService.getDemoQuestions();
    this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentIndex] || null;
  }

  get progress(): number {
    return ((this.currentIndex + 1) / this.questions.length) * 100;
  }

  onAnswerChange(answer: any): void {
    if (this.currentQuestion) {
      this.answers.set(this.currentQuestion.id, answer);
    }
  }

  getCurrentAnswer(): any {
    if (this.currentQuestion) {
      return this.answers.get(this.currentQuestion.id);
    }
    return null;
  }

  previousQuestion(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextQuestion(): void {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    }
  }

  submitExam(): void {
    this.timeSpent = Date.now() - this.startTime;
    this.calculateScore();
    this.showResults = true;
  }

  private calculateScore(): void {
    this.score = 0;
    
    for (const question of this.questions) {
      const userAnswer = this.answers.get(question.id);
      if (this.isCorrectAnswer(question, userAnswer)) {
        this.score += question.points;
      }
    }
  }

  private isCorrectAnswer(question: Question, userAnswer: any): boolean {
    if (!userAnswer) return false;

    switch (question.type) {
      case 'multiple-choice':
        return userAnswer === question.correctAnswer;
      
      case 'multiple-response':
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false;
        return userAnswer.length === question.correctAnswer.length &&
               userAnswer.every((val: any) => question.correctAnswer.includes(val));
      
      case 'fill-blank':
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false;
        return userAnswer.length === question.correctAnswer.length &&
               userAnswer.every((val: any, index: number) => 
                 val?.toLowerCase().trim() === question.correctAnswer[index]?.toLowerCase().trim());
      
      case 'hot-text':
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false;
        return userAnswer.length === question.correctAnswer.length &&
               userAnswer.every((val: any) => question.correctAnswer.includes(val));
      
      case 'drag-drop':
        // Compare drag-drop mappings
        const correctMapping = question.correctAnswer;
        for (const zone in correctMapping) {
          if (!userAnswer[zone] || !this.arrayEquals(userAnswer[zone], correctMapping[zone])) {
            return false;
          }
        }
        return true;
      
      case 'hot-spot':
        return Array.isArray(userAnswer) && Array.isArray(question.correctAnswer) &&
               userAnswer.length === question.correctAnswer.length &&
               userAnswer.every((val: any) => question.correctAnswer.includes(val));
      
      case 'table-grid':
        return Array.isArray(userAnswer) && Array.isArray(question.correctAnswer) &&
               userAnswer.length === question.correctAnswer.length &&
               userAnswer.every((val: any) => question.correctAnswer.includes(val));
      
      case 'point-graph':
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false;
        return userAnswer.length === question.correctAnswer.length &&
               userAnswer.every((point: any) => 
                 question.correctAnswer.some((correctPoint: any) => 
                   Math.abs(point.x - correctPoint.x) < 0.1 && Math.abs(point.y - correctPoint.y) < 0.1));
      
      case 'inline-choice':
        return Array.isArray(userAnswer) && Array.isArray(question.correctAnswer) &&
               userAnswer.length === question.correctAnswer.length &&
               userAnswer.every((val: any, index: number) => val === question.correctAnswer[index]);
      
      case 'equation-editor':
        return userAnswer?.toString().trim() === question.correctAnswer?.toString().trim();
      
      case 'shape-transform':
        return userAnswer === question.correctAnswer;
      
      case 'solution-set':
        return userAnswer === question.correctAnswer;
      
      default:
        return false;
    }
  }

  private arrayEquals(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    return a.every(val => b.includes(val));
  }

  resetExam(): void {
    this.currentIndex = 0;
    this.answers.clear();
    this.showResults = false;
    this.score = 0;
    this.startTime = Date.now();
    this.timeSpent = 0;
  }

  getScorePercentage(): number {
    return Math.round((this.score / this.totalPoints) * 100);
  }

  getTimeSpentMinutes(): number {
    return Math.round(this.timeSpent / 60000);
  }

  getQuestionResult(question: Question): 'correct' | 'incorrect' | 'unanswered' {
    const userAnswer = this.answers.get(question.id);
    if (!userAnswer) return 'unanswered';
    return this.isCorrectAnswer(question, userAnswer) ? 'correct' : 'incorrect';
  }
}
