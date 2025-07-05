import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-shape-transform',
  templateUrl: './shape-transform.component.html',
  styleUrls: ['./shape-transform.component.css'],
  standalone: false
})
export class ShapeTransformComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: string = '';
  @Output() answerChange = new EventEmitter<string>();

  @ViewChild('shapeCanvas', { static: true }) shapeCanvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private canvasWidth = 500;
  private canvasHeight = 400;
  private gridSize = 20;
  private originX = 250;
  private originY = 200;
  
  selectedTransformation: string = '';
  previewTransformation: string = '';

  ngOnInit(): void {
    if (!this.userAnswer) {
      this.userAnswer = '';
    }
    this.selectedTransformation = this.userAnswer;
    this.setupCanvas();
  }

  ngAfterViewInit(): void {
    this.drawShapes();
  }

  private setupCanvas(): void {
    const canvas = this.shapeCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
  }

  private drawShapes(): void {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Draw grid
    this.drawGrid();
    
    // Draw axes
    this.drawAxes();
    
    // Draw original shape
    this.drawOriginalShape();
    
    // Draw transformed shape if transformation is selected
    if (this.selectedTransformation || this.previewTransformation) {
      this.drawTransformedShape();
    }
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#f3f4f6';
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
    this.ctx.strokeStyle = '#6b7280';
    this.ctx.lineWidth = 1;
    
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

  private drawOriginalShape(): void {
    const shapes = this.question.shapeData?.shapes || [];
    
    shapes.forEach(shape => {
      this.ctx.fillStyle = shape.color;
      this.ctx.strokeStyle = '#374151';
      this.ctx.lineWidth = 2;
      
      this.drawShape(shape, false);
    });
  }

  private drawTransformedShape(): void {
    const shapes = this.question.shapeData?.shapes || [];
    const transformation = this.previewTransformation || this.selectedTransformation;
    
    shapes.forEach(shape => {
      this.ctx.fillStyle = shape.color + '80'; // Add transparency
      this.ctx.strokeStyle = '#ef4444';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      
      this.drawShape(shape, true, transformation);
      
      this.ctx.setLineDash([]);
    });
  }

  private drawShape(shape: any, isTransformed: boolean, transformation?: string): void {
    const coords = this.getShapeCoordinates(shape, isTransformed, transformation);
    
    switch (shape.type) {
      case 'triangle':
        this.drawTriangle(coords);
        break;
      case 'rectangle':
        this.drawRectangle(coords);
        break;
      case 'circle':
        this.drawCircle(coords);
        break;
      default:
        this.drawPolygon(coords);
    }
  }

  private getShapeCoordinates(shape: any, isTransformed: boolean, transformation?: string): number[] {
    let coords = [...shape.coordinates];
    
    if (isTransformed && transformation) {
      coords = this.applyTransformation(coords, transformation);
    }
    
    // Convert to canvas coordinates
    for (let i = 0; i < coords.length; i += 2) {
      coords[i] = this.originX + (coords[i] * this.gridSize);
      coords[i + 1] = this.originY - (coords[i + 1] * this.gridSize);
    }
    
    return coords;
  }

  private applyTransformation(coords: number[], transformation: string): number[] {
    const result = [...coords];
    
    switch (transformation) {
      case 'rotate-90-cw':
        for (let i = 0; i < result.length; i += 2) {
          const x = result[i];
          const y = result[i + 1];
          result[i] = y;
          result[i + 1] = -x;
        }
        break;
      case 'rotate-90-ccw':
        for (let i = 0; i < result.length; i += 2) {
          const x = result[i];
          const y = result[i + 1];
          result[i] = -y;
          result[i + 1] = x;
        }
        break;
      case 'reflect-x':
        for (let i = 1; i < result.length; i += 2) {
          result[i] = -result[i];
        }
        break;
      case 'reflect-y':
        for (let i = 0; i < result.length; i += 2) {
          result[i] = -result[i];
        }
        break;
    }
    
    return result;
  }

  private drawTriangle(coords: number[]): void {
    this.ctx.beginPath();
    this.ctx.moveTo(coords[0], coords[1]);
    this.ctx.lineTo(coords[2], coords[3]);
    this.ctx.lineTo(coords[4], coords[5]);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawRectangle(coords: number[]): void {
    const width = coords[2] - coords[0];
    const height = coords[3] - coords[1];
    this.ctx.fillRect(coords[0], coords[1], width, height);
    this.ctx.strokeRect(coords[0], coords[1], width, height);
  }

  private drawCircle(coords: number[]): void {
    const radius = coords[2];
    this.ctx.beginPath();
    this.ctx.arc(coords[0], coords[1], radius * this.gridSize, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawPolygon(coords: number[]): void {
    this.ctx.beginPath();
    this.ctx.moveTo(coords[0], coords[1]);
    for (let i = 2; i < coords.length; i += 2) {
      this.ctx.lineTo(coords[i], coords[i + 1]);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  onTransformationSelect(transformation: string): void {
    this.selectedTransformation = transformation;
    this.userAnswer = transformation;
    this.answerChange.emit(transformation);
    this.drawShapes();
  }

  onTransformationPreview(transformation: string): void {
    this.previewTransformation = transformation;
    this.drawShapes();
  }

  onTransformationPreviewEnd(): void {
    this.previewTransformation = '';
    this.drawShapes();
  }

  getTransformations(): string[] {
    return this.question.shapeData?.transformations || [];
  }

  getTransformationLabel(transformation: string): string {
    const labels: { [key: string]: string } = {
      'rotate-90-cw': 'Rotate 90° Clockwise',
      'rotate-90-ccw': 'Rotate 90° Counter-clockwise',
      'reflect-x': 'Reflect across X-axis',
      'reflect-y': 'Reflect across Y-axis',
      'translate': 'Translate',
      'scale': 'Scale'
    };
    return labels[transformation] || transformation;
  }

  resetTransformation(): void {
    this.selectedTransformation = '';
    this.userAnswer = '';
    this.answerChange.emit('');
    this.drawShapes();
  }

  getTransformationIcon(transformation: string): string {
    const icons: { [key: string]: string } = {
      'rotate-90-cw': 'fas fa-redo',
      'rotate-90-ccw': 'fas fa-undo',
      'reflect-x': 'fas fa-arrows-alt-h',
      'reflect-y': 'fas fa-arrows-alt-v',
      'translate': 'fas fa-arrows-alt',
      'scale': 'fas fa-expand-arrows-alt'
    };
    return icons[transformation] || 'fas fa-transform';
  }

  getTransformationDescription(transformation: string): string {
    const descriptions: { [key: string]: string } = {
      'rotate-90-cw': 'Rotates the shape 90 degrees clockwise around the origin',
      'rotate-90-ccw': 'Rotates the shape 90 degrees counter-clockwise around the origin',
      'reflect-x': 'Reflects the shape across the x-axis',
      'reflect-y': 'Reflects the shape across the y-axis',
      'translate': 'Moves the shape to a new position',
      'scale': 'Changes the size of the shape'
    };
    return descriptions[transformation] || 'Custom transformation';
  }

  formatCoordinates(coordinates: number[]): string {
    const pairs = [];
    for (let i = 0; i < coordinates.length; i += 2) {
      pairs.push(`(${coordinates[i]}, ${coordinates[i + 1]})`);
    }
    return pairs.join(', ');
  }
}

