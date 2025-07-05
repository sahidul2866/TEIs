import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-table-grid',
  templateUrl: './table-grid.component.html',
  styleUrls: ['./table-grid.component.css'],
  standalone: false
})
export class TableGridComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: string[] = [];
  @Output() answerChange = new EventEmitter<string[]>();

  ngOnInit(): void {
    if (!this.userAnswer) {
      this.userAnswer = [];
      this.answerChange.emit(this.userAnswer);
    }
  }

  onCellClick(cellId: string): void {
    const index = this.userAnswer.indexOf(cellId);
    
    if (index > -1) {
      // Remove if already selected
      this.userAnswer.splice(index, 1);
    } else {
      // Add if not selected
      this.userAnswer.push(cellId);
    }
    
    this.answerChange.emit(this.userAnswer);
  }

  isCellSelected(cellId: string): boolean {
    return this.userAnswer.includes(cellId);
  }

  isCellSelectable(cell: any): boolean {
    return cell.selectable;
  }

  getCellClass(cell: any): string {
    const baseClass = 'grid-cell';
    
    if (!this.isCellSelectable(cell)) {
      return baseClass + ' non-selectable';
    }
    
    if (this.isCellSelected(cell.id)) {
      return baseClass + ' selected';
    }
    
    return baseClass + ' selectable';
  }

  getGridData(): any[][] {
    return this.question.gridData || [];
  }

  getSelectedCells(): any[] {
    const allCells = this.getGridData().flat();
    return this.userAnswer.map(id => allCells.find(cell => cell.id === id)).filter(Boolean);
  }

  getSelectedCount(): number {
    return this.userAnswer.length;
  }

  getTotalSelectableCells(): number {
    return this.getGridData().flat().filter(cell => cell.selectable).length;
  }

  clearSelection(): void {
    this.userAnswer = [];
    this.answerChange.emit(this.userAnswer);
  }

  selectAll(): void {
    const selectableCells = this.getGridData().flat().filter(cell => cell.selectable);
    this.userAnswer = selectableCells.map(cell => cell.id);
    this.answerChange.emit(this.userAnswer);
  }
}

