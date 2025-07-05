import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-point-graph',
  templateUrl: './point-graph.component.html',
  styleUrls: ['./point-graph.component.css'],
  standalone: false
})
export class PointGraphComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: { x: number; y: number }[] = [];
  @Output() answerChange = new EventEmitter<{ x: number; y: number }[]>();

  @ViewChild('graphCanvas', { static: true }) graphCanvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private canvasWidth = 500;
  private canvasHeight = 400;
  private gridSize = 20;
  private originX = 250;
  private originY = 200;

  ngOnInit(): void {
    if (!this.userAnswer) {
      this.userAnswer = [];
      this.answerChange.emit(this.userAnswer);
    }
    this.setupCanvas();
  }

  ngAfterViewInit(): void {
    this.drawGraph();
  }

  private setupCanvas(): void {
    const canvas = this.graphCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
  }

  private drawGraph(): void {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Draw grid
    this.drawGrid();
    
    // Draw axes
    this.drawAxes();
    
    // Draw axis labels
    this.drawAxisLabels();
    
    // Draw plotted points
    this.drawPlottedPoints();
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }
  }

  private drawAxes(): void {
    this.ctx.strokeStyle = '#374151';
    this.ctx.lineWidth = 2;
    
    // X-axis
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.originY);
    this.ctx.lineTo(this.canvasWidth, this.originY);
    this.ctx.stroke();
    
    // Y-axis
    this.ctx.beginPath();
    this.ctx.moveTo(this.originX, 0);
    this.ctx.lineTo(this.originX, this.canvasHeight);
    this.ctx.stroke();
  }

  private drawAxisLabels(): void {
    this.ctx.fillStyle = '#374151';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    
    const graphData = this.question.graphData;
    if (!graphData) return;
    
    // X-axis labels
    for (let i = graphData.xMin; i <= graphData.xMax; i++) {
      if (i === 0) continue;
      const x = this.originX + (i * this.gridSize);
      this.ctx.fillText(i.toString(), x, this.originY + 15);
    }
    
    // Y-axis labels
    for (let i = graphData.yMin; i <= graphData.yMax; i++) {
      if (i === 0) continue;
      const y = this.originY - (i * this.gridSize);
      this.ctx.fillText(i.toString(), this.originX - 15, y + 4);
    }
  }

  private drawPlottedPoints(): void {
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.strokeStyle = '#1e40af';
    this.ctx.lineWidth = 2;
    
    this.userAnswer.forEach((point, index) => {
      const canvasX = this.originX + (point.x * this.gridSize);
      const canvasY = this.originY - (point.y * this.gridSize);
      
      // Draw point
      this.ctx.beginPath();
      this.ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Draw point label
      this.ctx.fillStyle = '#1e40af';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`(${point.x}, ${point.y})`, canvasX + 8, canvasY - 8);
      this.ctx.fillStyle = '#3b82f6';
    });
  }

  onCanvasClick(event: MouseEvent): void {
    const rect = this.graphCanvas.nativeElement.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    
    // Convert canvas coordinates to graph coordinates
    const graphX = Math.round((canvasX - this.originX) / this.gridSize);
    const graphY = Math.round((this.originY - canvasY) / this.gridSize);
    
    const graphData = this.question.graphData;
    if (!graphData) return;
    
    // Check if coordinates are within bounds
    if (graphX >= graphData.xMin && graphX <= graphData.xMax &&
        graphY >= graphData.yMin && graphY <= graphData.yMax) {
      
      // Check if point already exists
      const existingIndex = this.userAnswer.findIndex(p => p.x === graphX && p.y === graphY);
      
      if (existingIndex > -1) {
        // Remove existing point
        this.userAnswer.splice(existingIndex, 1);
      } else {
        // Add new point
        this.userAnswer.push({ x: graphX, y: graphY });
      }
      
      this.answerChange.emit(this.userAnswer);
      this.drawGraph();
    }
  }

  removePoint(index: number): void {
    this.userAnswer.splice(index, 1);
    this.answerChange.emit(this.userAnswer);
    this.drawGraph();
  }

  clearAllPoints(): void {
    this.userAnswer = [];
    this.answerChange.emit(this.userAnswer);
    this.drawGraph();
  }

  addPointManually(x: number, y: number): void {
    const graphData = this.question.graphData;
    if (!graphData) return;
    
    if (x >= graphData.xMin && x <= graphData.xMax &&
        y >= graphData.yMin && y <= graphData.yMax) {
      
      // Check if point already exists
      const existingIndex = this.userAnswer.findIndex(p => p.x === x && p.y === y);
      
      if (existingIndex === -1) {
        this.userAnswer.push({ x, y });
        this.answerChange.emit(this.userAnswer);
        this.drawGraph();
      }
    }
  }

  getPointsCount(): number {
    return this.userAnswer.length;
  }

  getRequiredPointsCount(): number {
    return this.question.graphData?.correctPoints?.length || 0;
  }
}

