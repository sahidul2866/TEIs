import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Question } from '../../../models/question';

interface SolutionRegion {
  id: string;
  type: 'above' | 'below' | 'left' | 'right' | 'between' | 'outside';
  lineId?: string;
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
  selected: boolean;
  color: string;
}

interface GraphLine {
  id: string;
  equation: string;
  slope: number;
  yIntercept: number;
  color: string;
  style: 'solid' | 'dashed';
}

@Component({
  selector: 'app-solution-set',
  templateUrl: './solution-set.component.html',
  styleUrls: ['./solution-set.component.css'],
  standalone: false
})
export class SolutionSetComponent implements OnInit {
  @Input() question!: Question;
  @Input() userAnswer: string[] = [];
  @Input() showAnswer: boolean = false;
  @Output() answerChange = new EventEmitter<string[]>();
  @Output() correctnessChange = new EventEmitter<boolean | undefined>();

  @ViewChild('graphCanvas', { static: false }) graphCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('numberLineCanvas', { static: false }) numberLineCanvas!: ElementRef<HTMLCanvasElement>;

  // Graph configuration
  graphWidth = 400;
  graphHeight = 400;
  gridSize = 20;
  xMin = -10;
  xMax = 10;
  yMin = -10;
  yMax = 10;

  // Number line configuration
  numberLineWidth = 500;
  numberLineHeight = 80;
  numberLineMin = -10;
  numberLineMax = 10;

  // Solution regions
  availableRegions: SolutionRegion[] = [];
  selectedRegions: string[] = [];

  // Graph lines
  graphLines: GraphLine[] = [];

  // Interaction state
  isMouseDown = false;
  selectionStart: { x: number; y: number } | null = null;
  currentSelection: SolutionRegion | null = null;

  ngOnInit(): void {
    this.initializeComponent();
    setTimeout(() => {
      this.setupCanvas();
      this.drawGraph();
      this.drawNumberLine();
    }, 100);
  }

  private initializeComponent(): void {
    this.selectedRegions = [...this.userAnswer];
    this.setupSolutionData();
  }

  private setupSolutionData(): void {
    const solutionData = this.question.solutionData;
    if (!solutionData) return;

    // Setup graph lines if provided
    if (solutionData.equation) {
      this.parseEquationToLines(solutionData.equation);
    }

    // Setup predefined regions for selection
    this.setupPredefinedRegions();
  }

  private parseEquationToLines(equation: string): void {
    // Parse equations like "y = 2x + 1" or "x + y = 5"
    if (equation.includes('y =')) {
      const parts = equation.split('y =')[1].trim();
      const { slope, yIntercept } = this.parseLinearEquation(parts);
      this.graphLines.push({
        id: 'line1',
        equation: equation,
        slope,
        yIntercept,
        color: '#2563eb',
        style: 'solid'
      });
    } else if (equation.includes('y ≤') || equation.includes('y >=')) {
      // Handle inequality
      const operator = equation.includes('≤') ? '≤' : '≥';
      const parts = equation.split(operator)[1].trim();
      const { slope, yIntercept } = this.parseLinearEquation(parts);
      this.graphLines.push({
        id: 'line1',
        equation: equation,
        slope,
        yIntercept,
        color: '#dc2626',
        style: operator === '≤' ? 'solid' : 'dashed'
      });
    }

    // Add a second line for advanced cases
    if (this.question.solutionData?.inequalities && this.question.solutionData.inequalities.length > 1) {
      const secondEq = this.question.solutionData.inequalities[1];
      const { slope, yIntercept } = this.parseLinearEquation(secondEq.split(/[≤≥]/)[1].trim());
      this.graphLines.push({
        id: 'line2',
        equation: secondEq,
        slope,
        yIntercept,
        color: '#059669',
        style: secondEq.includes('≤') ? 'solid' : 'dashed'
      });
    }
  }

  private parseLinearEquation(equation: string): { slope: number; yIntercept: number } {
    // Handle equations like "2x + 1", "-x + 3", "5", etc.
    equation = equation.replace(/\s/g, '');
    
    let slope = 0;
    let yIntercept = 0;

    if (equation.includes('x')) {
      const xMatch = equation.match(/([+-]?\d*\.?\d*)x/);
      if (xMatch) {
        const slopeStr = xMatch[1];
        slope = slopeStr === '' || slopeStr === '+' ? 1 : 
                slopeStr === '-' ? -1 : parseFloat(slopeStr);
      }

      const constantMatch = equation.match(/x([+-]\d+\.?\d*)/);
      if (constantMatch) {
        yIntercept = parseFloat(constantMatch[1]);
      }
    } else {
      // Horizontal line
      yIntercept = parseFloat(equation);
    }

    return { slope, yIntercept };
  }

  private setupPredefinedRegions(): void {
    this.availableRegions = [
      {
        id: 'above_line1',
        type: 'above',
        lineId: 'line1',
        selected: false,
        color: 'rgba(37, 99, 235, 0.2)'
      },
      {
        id: 'below_line1',
        type: 'below',
        lineId: 'line1',
        selected: false,
        color: 'rgba(220, 38, 38, 0.2)'
      },
      {
        id: 'left_of_line1',
        type: 'left',
        lineId: 'line1',
        selected: false,
        color: 'rgba(5, 150, 105, 0.2)'
      },
      {
        id: 'right_of_line1',
        type: 'right',
        lineId: 'line1',
        selected: false,
        color: 'rgba(245, 158, 11, 0.2)'
      }
    ];

    // Add regions for second line if exists
    if (this.graphLines.length > 1) {
      this.availableRegions.push(
        {
          id: 'above_line2',
          type: 'above',
          lineId: 'line2',
          selected: false,
          color: 'rgba(168, 85, 247, 0.2)'
        },
        {
          id: 'below_line2',
          type: 'below',
          lineId: 'line2',
          selected: false,
          color: 'rgba(239, 68, 68, 0.2)'
        }
      );
    }
  }

  private setupCanvas(): void {
    if (this.graphCanvas?.nativeElement) {
      const canvas = this.graphCanvas.nativeElement;
      canvas.width = this.graphWidth;
      canvas.height = this.graphHeight;
    }

    if (this.numberLineCanvas?.nativeElement) {
      const canvas = this.numberLineCanvas.nativeElement;
      canvas.width = this.numberLineWidth;
      canvas.height = this.numberLineHeight;
    }
  }

  private drawGraph(): void {
    if (!this.graphCanvas?.nativeElement) return;

    const canvas = this.graphCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.clearRect(0, 0, this.graphWidth, this.graphHeight);

    // Draw grid
    this.drawGrid(ctx);

    // Draw axes
    this.drawAxes(ctx);

    // Draw selected regions (shading)
    this.drawSelectedRegions(ctx);

    // Draw lines
    this.drawLines(ctx);

    // Draw axis labels
    this.drawAxisLabels(ctx);
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;

    // Vertical grid lines
    for (let x = 0; x <= this.graphWidth; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.graphHeight);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y <= this.graphHeight; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.graphWidth, y);
      ctx.stroke();
    }
  }

  private drawAxes(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

    const centerX = this.graphWidth / 2;
    const centerY = this.graphHeight / 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(this.graphWidth, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, this.graphHeight);
    ctx.stroke();

    // Arrow heads
    this.drawArrowHead(ctx, this.graphWidth - 10, centerY, 0);
    this.drawArrowHead(ctx, centerX, 10, Math.PI / 2);
  }

  private drawArrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -5);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawLines(ctx: CanvasRenderingContext2D): void {
    this.graphLines.forEach(line => {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 3;
      
      if (line.style === 'dashed') {
        ctx.setLineDash([5, 5]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      
      // Draw line from left to right edge
      const startX = 0;
      const endX = this.graphWidth;
      const startY = this.graphYToCanvas(line.slope * this.canvasXToGraph(startX) + line.yIntercept);
      const endY = this.graphYToCanvas(line.slope * this.canvasXToGraph(endX) + line.yIntercept);

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });
  }

  private drawSelectedRegions(ctx: CanvasRenderingContext2D): void {
    this.selectedRegions.forEach(regionId => {
      const region = this.availableRegions.find(r => r.id === regionId);
      if (!region) return;

      ctx.fillStyle = region.color;
      
      const line = this.graphLines.find(l => l.id === region.lineId);
      if (!line) return;

      // Draw shaded region based on type
      switch (region.type) {
        case 'above':
          this.shadeAboveLine(ctx, line);
          break;
        case 'below':
          this.shadeBelowLine(ctx, line);
          break;
        case 'left':
          this.shadeLeftOfLine(ctx, line);
          break;
        case 'right':
          this.shadeRightOfLine(ctx, line);
          break;
      }
    });
  }

  private shadeAboveLine(ctx: CanvasRenderingContext2D, line: GraphLine): void {
    ctx.beginPath();
    const points: { x: number; y: number }[] = [];
    
    for (let x = 0; x <= this.graphWidth; x += 2) {
      const graphX = this.canvasXToGraph(x);
      const lineY = line.slope * graphX + line.yIntercept;
      const canvasY = this.graphYToCanvas(lineY);
      points.push({ x, y: canvasY });
    }
    
    // Create path above the line
    ctx.moveTo(0, 0);
    ctx.lineTo(this.graphWidth, 0);
    for (let i = points.length - 1; i >= 0; i--) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  private shadeBelowLine(ctx: CanvasRenderingContext2D, line: GraphLine): void {
    ctx.beginPath();
    const points: { x: number; y: number }[] = [];
    
    for (let x = 0; x <= this.graphWidth; x += 2) {
      const graphX = this.canvasXToGraph(x);
      const lineY = line.slope * graphX + line.yIntercept;
      const canvasY = this.graphYToCanvas(lineY);
      points.push({ x, y: canvasY });
    }
    
    // Create path below the line
    for (let i = 0; i < points.length; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(this.graphWidth, this.graphHeight);
    ctx.lineTo(0, this.graphHeight);
    ctx.closePath();
    ctx.fill();
  }

  private shadeLeftOfLine(ctx: CanvasRenderingContext2D, line: GraphLine): void {
    // For vertical-ish lines, shade to the left
    ctx.beginPath();
    ctx.rect(0, 0, this.graphWidth / 2, this.graphHeight);
    ctx.fill();
  }

  private shadeRightOfLine(ctx: CanvasRenderingContext2D, line: GraphLine): void {
    // For vertical-ish lines, shade to the right
    ctx.beginPath();
    ctx.rect(this.graphWidth / 2, 0, this.graphWidth / 2, this.graphHeight);
    ctx.fill();
  }

  private drawAxisLabels(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#374151';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';

    const centerX = this.graphWidth / 2;
    const centerY = this.graphHeight / 2;

    // X-axis labels
    for (let i = this.xMin; i <= this.xMax; i += 2) {
      if (i === 0) continue;
      const x = this.graphXToCanvas(i);
      ctx.fillText(i.toString(), x, centerY + 15);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = this.yMin; i <= this.yMax; i += 2) {
      if (i === 0) continue;
      const y = this.graphYToCanvas(i);
      ctx.fillText(i.toString(), centerX - 10, y + 4);
    }

    // Axis labels
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px system-ui';
    ctx.fillText('x', this.graphWidth - 15, centerY - 10);
    ctx.fillText('y', centerX + 15, 15);
  }

  private drawNumberLine(): void {
    if (!this.numberLineCanvas?.nativeElement) return;

    const canvas = this.numberLineCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    
    ctx.clearRect(0, 0, this.numberLineWidth, this.numberLineHeight);

    const centerY = this.numberLineHeight / 2;
    const padding = 50;
    const lineLength = this.numberLineWidth - 2 * padding;

    // Draw main line
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(this.numberLineWidth - padding, centerY);
    ctx.stroke();

    // Draw tick marks and labels
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#374151';

    for (let i = this.numberLineMin; i <= this.numberLineMax; i++) {
      const x = padding + ((i - this.numberLineMin) / (this.numberLineMax - this.numberLineMin)) * lineLength;
      
      ctx.beginPath();
      ctx.moveTo(x, centerY - 8);
      ctx.lineTo(x, centerY + 8);
      ctx.stroke();
      
      ctx.fillText(i.toString(), x, centerY + 25);
    }

    // Draw selected intervals
    this.drawNumberLineSelections(ctx, centerY, padding, lineLength);
  }

  private drawNumberLineSelections(ctx: CanvasRenderingContext2D, centerY: number, padding: number, lineLength: number): void {
    const solutionSet = this.question.solutionData?.solutionSet;
    if (!solutionSet || !Array.isArray(solutionSet)) return;

    ctx.fillStyle = 'rgba(37, 99, 235, 0.3)';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;

    solutionSet.forEach((value: any) => {
      if (typeof value === 'number') {
        // Point solution
        const x = padding + ((value - this.numberLineMin) / (this.numberLineMax - this.numberLineMin)) * lineLength;
        ctx.beginPath();
        ctx.arc(x, centerY, 6, 0, 2 * Math.PI);
        ctx.fill();
      } else if (typeof value === 'string' && value.includes('≤')) {
        // Interval solution like "x ≤ 3"
        const parts = value.split('≤');
        if (parts.length === 2) {
          const endValue = parseFloat(parts[1].trim());
          const endX = padding + ((endValue - this.numberLineMin) / (this.numberLineMax - this.numberLineMin)) * lineLength;
          
          ctx.beginPath();
          ctx.moveTo(padding, centerY);
          ctx.lineTo(endX, centerY);
          ctx.stroke();
          
          // Closed circle at end
          ctx.beginPath();
          ctx.arc(endX, centerY, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    });
  }

  // Coordinate conversion helpers
  private graphXToCanvas(x: number): number {
    return ((x - this.xMin) / (this.xMax - this.xMin)) * this.graphWidth;
  }

  private graphYToCanvas(y: number): number {
    return this.graphHeight - ((y - this.yMin) / (this.yMax - this.yMin)) * this.graphHeight;
  }

  private canvasXToGraph(x: number): number {
    return this.xMin + (x / this.graphWidth) * (this.xMax - this.xMin);
  }

  private canvasYToGraph(y: number): number {
    return this.yMin + ((this.graphHeight - y) / this.graphHeight) * (this.yMax - this.yMin);
  }

  // Event handlers
  onCanvasClick(event: MouseEvent): void {
    const canvas = this.graphCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Determine which region was clicked
    const clickedRegion = this.determineClickedRegion(x, y);
    if (clickedRegion) {
      this.toggleRegion(clickedRegion.id);
    }
  }

  private determineClickedRegion(canvasX: number, canvasY: number): SolutionRegion | null {
    const graphX = this.canvasXToGraph(canvasX);
    const graphY = this.canvasYToGraph(canvasY);

    // Check each line to determine position relative to it
    for (const line of this.graphLines) {
      const lineY = line.slope * graphX + line.yIntercept;
      
      if (graphY > lineY) {
        return this.availableRegions.find(r => r.type === 'above' && r.lineId === line.id) || null;
      } else if (graphY < lineY) {
        return this.availableRegions.find(r => r.type === 'below' && r.lineId === line.id) || null;
      }
    }

    return null;
  }

  toggleRegion(regionId: string): void {
    const index = this.selectedRegions.indexOf(regionId);
    if (index > -1) {
      this.selectedRegions.splice(index, 1);
    } else {
      this.selectedRegions.push(regionId);
    }

    this.updateAnswerAndCorrectness();
    this.drawGraph();
  }

  onRegionButtonClick(regionId: string): void {
    this.toggleRegion(regionId);
  }

  clearSelections(): void {
    this.selectedRegions = [];
    this.updateAnswerAndCorrectness();
    this.drawGraph();
  }

  // Correctness evaluation
  private evaluateCorrectness(): boolean | undefined {
    const correctAnswer = this.question.correctAnswer;
    if (!correctAnswer || !Array.isArray(correctAnswer)) {
      return undefined;
    }

    if (this.selectedRegions.length === 0) {
      return undefined;
    }

    // Check if selected regions match correct answer
    if (this.selectedRegions.length !== correctAnswer.length) {
      return false;
    }

    return this.selectedRegions.every(region => correctAnswer.includes(region));
  }

  private updateAnswerAndCorrectness(): void {
    this.answerChange.emit(this.selectedRegions);
    const isCorrect = this.evaluateCorrectness();
    console.log('Solution-set correctness:', { userAnswer: this.selectedRegions, correctAnswer: this.question.correctAnswer, isCorrect });
    this.correctnessChange.emit(isCorrect);
  }

  // Visual feedback methods
  getRegionButtonClass(regionId: string): string {
    const isSelected = this.selectedRegions.includes(regionId);
    let baseClass = 'region-button px-4 py-2 rounded-lg border-2 transition-all duration-200 ';
    
    if (!this.showAnswer) {
      return baseClass + (isSelected ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100');
    }

    // Show answer mode
    const correctAnswer = this.question.correctAnswer || [];
    const isCorrect = correctAnswer.includes(regionId);
    
    if (isSelected && isCorrect) {
      return baseClass + 'bg-green-100 border-green-500 text-green-800';
    } else if (isSelected && !isCorrect) {
      return baseClass + 'bg-red-100 border-red-500 text-red-800';
    } else if (!isSelected && isCorrect) {
      return baseClass + 'bg-green-50 border-green-300 text-green-600 border-dashed';
    } else {
      return baseClass + 'bg-gray-50 border-gray-300 text-gray-500';
    }
  }

  shouldShowCorrectAnswer(): boolean {
    if (!this.showAnswer) return false;
    
    const correctAnswer = this.question.correctAnswer || [];
    return !correctAnswer.every((region: string) => this.selectedRegions.includes(region));
  }

  getCorrectAnswerText(): string {
    const correctAnswer = this.question.correctAnswer || [];
    const regionNames = correctAnswer.map((id: string) => {
      const region = this.availableRegions.find(r => r.id === id);
      return region ? `${region.type} ${region.lineId}` : id;
    });
    return `Correct regions: ${regionNames.join(', ')}`;
  }

  getRegionDisplayName(regionId: string): string {
    const region = this.availableRegions.find(r => r.id === regionId);
    if (!region) return regionId;
    
    const lineNumber = region.lineId?.replace('line', '');
    return `${region.type.charAt(0).toUpperCase() + region.type.slice(1)} Line ${lineNumber}`;
  }

  getRegionColor(regionId: string): string {
    const region = this.availableRegions.find(r => r.id === regionId);
    return region?.color || '#3b82f6';
  }
}