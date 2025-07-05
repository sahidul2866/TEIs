export interface Question {
  id: string;
  type: TEIType;
  title: string;
  instruction: string;
  content: string;
  options?: string[];
  correctAnswer?: any;
  points: number;
  timeLimit?: number;
  metadata?: {
    subject?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    topic?: string;
  };
  // Specific fields for different TEI types
  dragItems?: DragItem[];
  dropZones?: DropZone[];
  blanks?: BlankField[];
  hotSpots?: HotSpot[];
  hotTexts?: HotText[];
  gridData?: GridCell[][];
  graphData?: GraphData;
  shapeData?: ShapeData;
  equationData?: EquationData;
  choiceData?: ChoiceData[];
  tableData?: TableData;
  solutionData?: SolutionData;
}

export type TEIType = 
  | 'drag-drop' 
  | 'fill-blank' 
  | 'hot-spot' 
  | 'equation-editor' 
  | 'hot-text' 
  | 'multiple-choice' 
  | 'multiple-response' 
  | 'inline-choice' 
  | 'table-grid' 
  | 'point-graph' 
  | 'shape-transform' 
  | 'solution-set';

export interface DragItem {
  id: string;
  content: string;
  type?: string;
}

export interface DropZone {
  id: string;
  label: string;
  acceptedTypes?: string[];
  correctItemId?: string;
}

export interface BlankField {
  id: string;
  placeholder: string;
  correctAnswer: string;
  position: number;
}

export interface HotSpot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rectangle' | 'circle' | 'polygon';
  correct: boolean;
}

export interface HotText {
  id: string;
  text: string;
  selectable: boolean;
  correct: boolean;
}

export interface GridCell {
  id: string;
  row: number;
  col: number;
  content?: string;
  selectable: boolean;
  correct: boolean;
}

export interface GraphData {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  gridSize: number;
  correctPoints: { x: number; y: number }[];
}

export interface ShapeData {
  shapes: Shape[];
  transformations: string[];
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'polygon';
  coordinates: number[];
  color: string;
}

export interface EquationData {
  variables: string[];
  operators: string[];
  template?: string;
  correctEquation: string;
}

export interface ChoiceData {
  position: number;
  options: string[];
  correctIndex: number;
}

export interface TableData {
  rows: number;
  cols: number;
  headers: string[];
  data: any[][];
  selectableRows: boolean;
  selectableCols: boolean;
}

export interface SolutionData {
  equation: string;
  solutionSet: number[] | string[];
  inequalities?: string[];
}

export interface UserAnswer {
  questionId: string;
  answer: any;
  timeSpent: number;
  attempts: number;
}
