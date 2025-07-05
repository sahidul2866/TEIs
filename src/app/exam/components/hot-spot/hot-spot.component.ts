import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-hot-spot',
  templateUrl: './hot-spot.component.html',
  styleUrls: ['./hot-spot.component.css'],
  standalone: false
})
export class HotSpotComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: string[] = [];
  @Output() answerChange = new EventEmitter<string[]>();

  ngOnInit(): void {
    if (!this.userAnswer) {
      this.userAnswer = [];
      this.answerChange.emit(this.userAnswer);
    }
  }

  onHotSpotClick(hotSpotId: string): void {
    const index = this.userAnswer.indexOf(hotSpotId);
    
    if (index > -1) {
      // Remove if already selected
      this.userAnswer.splice(index, 1);
    } else {
      // Add if not selected
      this.userAnswer.push(hotSpotId);
    }
    
    this.answerChange.emit(this.userAnswer);
  }

  isSelected(hotSpotId: string): boolean {
    return this.userAnswer.includes(hotSpotId);
  }

  getHotSpotStyle(hotSpot: any): any {
    const baseStyle = {
      position: 'absolute',
      left: hotSpot.x + 'px',
      top: hotSpot.y + 'px',
      width: hotSpot.width + 'px',
      height: hotSpot.height + 'px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };

    if (hotSpot.shape === 'circle') {
      return {
        ...baseStyle,
        borderRadius: '50%',
        backgroundColor: this.isSelected(hotSpot.id) ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        border: this.isSelected(hotSpot.id) ? '2px solid #3b82f6' : '2px solid transparent'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: this.isSelected(hotSpot.id) ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        border: this.isSelected(hotSpot.id) ? '2px solid #3b82f6' : '2px solid transparent'
      };
    }
  }
}
