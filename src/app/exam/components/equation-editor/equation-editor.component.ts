import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Question } from '../../../models/question';

interface HistoryEntry {
  equation: string;
  cursorPosition: number;
  timestamp: number;
}

@Component({
  selector: 'app-equation-editor',
  templateUrl: './equation-editor.component.html',
  styleUrls: ['./equation-editor.component.css'],
  standalone: false
})
export class EquationEditorComponent implements OnInit, OnDestroy {
  @Input() question!: Question;
  @Input() userAnswer: string = '';
  @Input() showAnswer: boolean = false;
  @Output() answerChange = new EventEmitter<string>();
  @Output() correctnessChange = new EventEmitter<boolean | undefined>();

  @ViewChild('equationInput') equationInput!: ElementRef<HTMLTextAreaElement>;

  currentEquation: string = '';
  variables: string[] = [];
  operators: string[] = [];
  cursorPosition: number = 0;
  
  // History management for undo/redo
  private history: HistoryEntry[] = [];
  private historyIndex: number = -1;
  private readonly MAX_HISTORY_SIZE = 50;
  
  // Validation
  private validationErrors: string[] = [];
  
  // Auto-save
  private autoSaveTimer: any;
  private readonly AUTO_SAVE_DELAY = 1000;

  ngOnInit(): void {
    this.initializeComponent();
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }

  private initializeComponent(): void {
    this.variables = this.question.equationData?.variables || ['x', 'y', 'z', 'a', 'b', 'c'];
    this.operators = this.question.equationData?.operators || ['+', '-', '×', '÷', '=', '≠', '<', '>', '≤', '≥'];
    this.currentEquation = this.userAnswer || '';
    
    // Initialize history
    this.addToHistory();
    
    // Set up auto-save
    this.scheduleAutoSave();
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
  }

  private handleGlobalKeyDown(event: KeyboardEvent): void {
    // Only handle shortcuts when the equation input is focused
    if (document.activeElement !== this.equationInput?.nativeElement) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'z':
          event.preventDefault();
          if (event.shiftKey) {
            this.redoLastAction();
          } else {
            this.undoLastAction();
          }
          break;
        case 'y':
          event.preventDefault();
          this.redoLastAction();
          break;
      }
    }
  }

  // Input Event Handlers
  onDirectInput(event: any): void {
    this.currentEquation = event.target.value;
    this.cursorPosition = event.target.selectionStart || 0;
    this.validateEquation();
    this.scheduleAutoSave();
    this.addToHistory();
  }

  onCursorChange(event: any): void {
    this.cursorPosition = event.target.selectionStart || 0;
  }

  onKeyDown(event: KeyboardEvent): void {
    // Handle special key combinations
    if (event.key === 'Tab') {
      event.preventDefault();
      this.insertSymbol('    '); // Insert 4 spaces for indentation
    }
  }

  onInputFocus(): void {
    this.announceToScreenReader('Equation input focused. Type your equation or use the symbol palette.');
  }

  onInputBlur(): void {
    this.validateEquation();
    this.updateAnswer();
  }

  // Symbol Insertion Methods
  insertSymbol(symbol: string): void {
    const before = this.currentEquation.substring(0, this.cursorPosition);
    const after = this.currentEquation.substring(this.cursorPosition);
    this.currentEquation = before + symbol + after;
    this.cursorPosition += symbol.length;
    
    // Update the answer immediately
    this.updateAnswer();
    this.updateCursorPosition();
    this.validateEquation();
    this.scheduleAutoSave();
    this.addToHistory();
    
    this.announceToScreenReader(`Inserted ${symbol}`);
  }

  insertNumber(number: string): void {
    this.insertSymbol(number);
  }

  insertVariable(variable: string): void {
    this.insertSymbol(variable);
  }

  insertOperator(operator: string): void {
    // Add spaces around operators for better readability
    const spacedOperator = ` ${operator} `;
    this.insertSymbol(spacedOperator);
  }

  insertFunction(func: string): void {
    const functionText = `${func}(`;
    this.insertSymbol(functionText);
  }

  insertParenthesis(paren: string): void {
    this.insertSymbol(paren);
    
    // Auto-close parentheses
    if (paren === '(' && this.shouldAutoClose()) {
      const before = this.currentEquation.substring(0, this.cursorPosition);
      const after = this.currentEquation.substring(this.cursorPosition);
      this.currentEquation = before + ')' + after;
      // Keep cursor between parentheses
      this.updateCursorPosition();
    }
  }

  private shouldAutoClose(): boolean {
    // Simple heuristic: auto-close if the next character isn't already a closing paren
    const nextChar = this.currentEquation.charAt(this.cursorPosition);
    return nextChar !== ')';
  }

  // Control Methods
  clearEquation(): void {
    if (this.currentEquation.length > 0) {
      this.currentEquation = '';
      this.cursorPosition = 0;
      this.updateCursorPosition();
      this.validateEquation();
      this.updateAnswer();
      this.addToHistory();
      this.announceToScreenReader('Equation cleared');
    }
  }

  backspace(): void {
    if (this.cursorPosition > 0) {
      const before = this.currentEquation.substring(0, this.cursorPosition - 1);
      const after = this.currentEquation.substring(this.cursorPosition);
      this.currentEquation = before + after;
      this.cursorPosition = Math.max(0, this.cursorPosition - 1);
      
      this.updateCursorPosition();
      this.validateEquation();
      this.scheduleAutoSave();
      this.addToHistory();
    }
  }

  // History Management
  undoLastAction(): void {
    if (this.canUndo()) {
      this.historyIndex--;
      const entry = this.history[this.historyIndex];
      this.currentEquation = entry.equation;
      this.cursorPosition = entry.cursorPosition;
      this.updateCursorPosition();
      this.validateEquation();
      this.updateAnswer();
      this.announceToScreenReader('Undid last action');
    }
  }

  redoLastAction(): void {
    if (this.canRedo()) {
      this.historyIndex++;
      const entry = this.history[this.historyIndex];
      this.currentEquation = entry.equation;
      this.cursorPosition = entry.cursorPosition;
      this.updateCursorPosition();
      this.validateEquation();
      this.updateAnswer();
      this.announceToScreenReader('Redid last action');
    }
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  private addToHistory(): void {
    const entry: HistoryEntry = {
      equation: this.currentEquation,
      cursorPosition: this.cursorPosition,
      timestamp: Date.now()
    };

    // Remove any entries after current index (when adding new entry after undo)
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add new entry
    this.history.push(entry);
    this.historyIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.MAX_HISTORY_SIZE) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  // Validation Methods
  isValidEquation(): boolean {
    this.validateEquation();
    return this.validationErrors.length === 0;
  }

  getValidationErrors(): string[] {
    return this.validationErrors;
  }

  private validateEquation(): void {
    this.validationErrors = [];
    
    if (!this.currentEquation.trim()) {
      return; // Empty equation is valid
    }

    // Check for balanced parentheses
    if (!this.hasBalancedParentheses()) {
      this.validationErrors.push('Unbalanced parentheses');
    }

    // Check for invalid character sequences
    if (this.hasInvalidSequences()) {
      this.validationErrors.push('Invalid operator sequences');
    }

    // Check for incomplete functions
    if (this.hasIncompleteFunctions()) {
      this.validationErrors.push('Incomplete function calls');
    }

    // Check for proper equation structure
    if (this.hasEqualsSign() && !this.hasValidEquationStructure()) {
      this.validationErrors.push('Invalid equation structure');
    }
  }

  private hasBalancedParentheses(): boolean {
    let count = 0;
    for (const char of this.currentEquation) {
      if (char === '(') count++;
      if (char === ')') count--;
      if (count < 0) return false;
    }
    return count === 0;
  }

  private hasInvalidSequences(): boolean {
    // Check for consecutive operators
    const operatorPattern = /[+\-×÷=≠<>≤≥]{2,}/;
    return operatorPattern.test(this.currentEquation);
  }

  private hasIncompleteFunctions(): boolean {
    // Check for function names not followed by parentheses
    const functionPattern = /\b(sin|cos|tan|log|ln)\b(?!\s*\()/;
    return functionPattern.test(this.currentEquation);
  }

  private hasEqualsSign(): boolean {
    return this.currentEquation.includes('=');
  }

  private hasValidEquationStructure(): boolean {
    // Basic check: equation should have content on both sides of equals
    const parts = this.currentEquation.split('=');
    if (parts.length !== 2) return false;
    
    return parts[0].trim().length > 0 && parts[1].trim().length > 0;
  }

  // Helper Methods
  getNumberButtons(): string[] {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  }

  getOperatorName(operator: string): string {
    const names: { [key: string]: string } = {
      '+': 'plus',
      '-': 'minus',
      '×': 'multiply',
      '÷': 'divide',
      '=': 'equals',
      '≠': 'not equals',
      '<': 'less than',
      '>': 'greater than',
      '≤': 'less than or equal',
      '≥': 'greater than or equal'
    };
    return names[operator] || operator;
  }

  private updateCursorPosition(): void {
    // Update cursor position in the textarea
    setTimeout(() => {
      if (this.equationInput?.nativeElement) {
        this.equationInput.nativeElement.setSelectionRange(this.cursorPosition, this.cursorPosition);
        this.equationInput.nativeElement.focus();
      }
    }, 0);
  }

  private scheduleAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.updateAnswer();
    }, this.AUTO_SAVE_DELAY);
  }

  private updateAnswer(): void {
    this.answerChange.emit(this.currentEquation);
    this.evaluateCorrectness();
  }

  private evaluateCorrectness(): boolean | undefined {
    if (!this.currentEquation.trim()) {
      this.correctnessChange.emit(undefined);
      return undefined;
    }

    const correctEquation = this.question.equationData?.correctEquation || this.question.correctAnswer;
    if (!correctEquation) {
      this.correctnessChange.emit(undefined);
      return undefined;
    }

    // Normalize equations for comparison by removing extra spaces and standardizing operators
    const normalize = (eq: string) => {
      return eq.trim()
        .replace(/\s+/g, ' ')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .toLowerCase();
    };

    const isCorrect = normalize(this.currentEquation) === normalize(correctEquation);
    this.correctnessChange.emit(isCorrect);
    return isCorrect;
  }

  // Accessibility Methods
  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Advanced Features
  insertTemplate(template: string): void {
    // Insert common equation templates and special symbols
    const templates: { [key: string]: string } = {
      'quadratic': 'ax² + bx + c = 0',
      'linear': 'y = mx + b',
      'circle': '(x - h)² + (y - k)² = r²',
      'distance': 'd = √((x₂ - x₁)² + (y₂ - y₁)²)',
      'x²': 'x²',
      'x³': 'x³', 
      'xⁿ': 'xⁿ',
      'x/y': 'x/y',
      '√x': '√x',
      '∛x': '∛x'
    };
    
    if (templates[template]) {
      this.insertSymbol(templates[template]);
    } else {
      // If not a template, insert as symbol
      this.insertSymbol(template);
    }
  }

  formatEquation(): void {
    // Auto-format the equation for better readability
    let formatted = this.currentEquation;
    
    // Add spaces around operators if missing
    formatted = formatted.replace(/([+\-×÷=≠<>≤≥])/g, ' $1 ');
    
    // Remove extra spaces
    formatted = formatted.replace(/\s+/g, ' ').trim();
    
    // Update equation if it changed
    if (formatted !== this.currentEquation) {
      this.currentEquation = formatted;
      this.updateAnswer();
      this.addToHistory();
      this.announceToScreenReader('Equation formatted');
    }
  }

  // Export/Import Methods
  exportEquation(): string {
    return JSON.stringify({
      equation: this.currentEquation,
      timestamp: Date.now(),
      metadata: {
        variables: this.variables,
        operators: this.operators
      }
    });
  }

  importEquation(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.equation) {
        this.currentEquation = parsed.equation;
        this.cursorPosition = this.currentEquation.length;
        this.updateCursorPosition();
        this.validateEquation();
        this.updateAnswer();
        this.addToHistory();
        return true;
      }
    } catch (error) {
      console.error('Failed to import equation:', error);
    }
    return false;
  }

  // Visual feedback methods for showAnswer mode
  getEditorClass(): string {
    if (!this.showAnswer) return '';
    
    const currentEquation = this.currentEquation.trim();
    const correctEquation = this.question.equationData?.correctEquation?.trim() || this.question.correctAnswer?.trim() || '';
    
    if (!currentEquation) return '';
    
    // Normalize equations for comparison
    const normalize = (eq: string) => {
      return eq.trim()
        .replace(/\s+/g, ' ')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .toLowerCase();
    };
    
    if (normalize(currentEquation) === normalize(correctEquation)) {
      return 'border-green-500 bg-green-50';
    } else {
      return 'border-red-500 bg-red-50';
    }
  }

  shouldShowCorrectAnswer(): boolean {
    if (!this.showAnswer) return false;
    
    const currentEquation = this.currentEquation.trim();
    const correctEquation = this.question.equationData?.correctEquation?.trim() || this.question.correctAnswer?.trim() || '';
    
    if (!currentEquation || !correctEquation) return false;
    
    // Normalize equations for comparison
    const normalize = (eq: string) => {
      return eq.trim()
        .replace(/\s+/g, ' ')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .toLowerCase();
    };
    
    return normalize(currentEquation) !== normalize(correctEquation);
  }

  getCorrectAnswerText(): string {
    return this.question.equationData?.correctEquation || this.question.correctAnswer || '';
  }
}