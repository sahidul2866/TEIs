import { Injectable } from '@angular/core';
import { Question, TEIType } from '../models/question';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  
  constructor() { }

  getDemoQuestions(): Question[] {
    return [
      {
        id: 'q1',
        type: 'drag-drop',
        title: 'Classify Elements',
        instruction: 'Drag each element to the correct category',
        content: 'Classify the following elements as metals, non-metals, or metalloids.',
        points: 3,
        dragItems: [
          { id: 'iron', content: 'Iron (Fe)', type: 'metal' },
          { id: 'oxygen', content: 'Oxygen (O)', type: 'non-metal' },
          { id: 'silicon', content: 'Silicon (Si)', type: 'metalloid' },
          { id: 'gold', content: 'Gold (Au)', type: 'metal' },
          { id: 'carbon', content: 'Carbon (C)', type: 'non-metal' }
        ],
        dropZones: [
          { id: 'metals', label: 'Metals', acceptedTypes: ['metal'] },
          { id: 'non-metals', label: 'Non-Metals', acceptedTypes: ['non-metal'] },
          { id: 'metalloids', label: 'Metalloids', acceptedTypes: ['metalloid'] }
        ],
        correctAnswer: {
          metals: ['iron', 'gold'],
          'non-metals': ['oxygen', 'carbon'],
          metalloids: ['silicon']
        }
      },
      {
        id: 'q2',
        type: 'fill-blank',
        title: 'Complete the Sentence',
        instruction: 'Fill in the blanks with the correct words',
        content: 'The process of photosynthesis converts _____ and _____ into glucose and oxygen using _____.',
        points: 3,
        blanks: [
          { id: 'blank1', placeholder: 'gas', correctAnswer: 'carbon dioxide', position: 1 },
          { id: 'blank2', placeholder: 'liquid', correctAnswer: 'water', position: 2 },
          { id: 'blank3', placeholder: 'energy source', correctAnswer: 'sunlight', position: 3 }
        ],
        correctAnswer: ['carbon dioxide', 'water', 'sunlight']
      },
      {
        id: 'q3',
        type: 'hot-spot',
        title: 'Identify Cell Parts',
        instruction: 'Click on the nucleus of the cell',
        content: 'Look at the diagram of a plant cell and identify the nucleus.',
        points: 2,
        hotSpots: [
          { id: 'nucleus', x: 150, y: 100, width: 40, height: 40, shape: 'circle', correct: true },
          { id: 'chloroplast', x: 80, y: 80, width: 30, height: 30, shape: 'circle', correct: false },
          { id: 'vacuole', x: 200, y: 150, width: 50, height: 50, shape: 'circle', correct: false }
        ],
        correctAnswer: ['nucleus']
      },
      {
        id: 'q4',
        type: 'equation-editor',
        title: 'Solve for X',
        instruction: 'Create an equation to solve for x',
        content: 'If 3x + 5 = 17, write the equation to solve for x.',
        points: 4,
        equationData: {
          variables: ['x', 'y', 'z'],
          operators: ['+', '-', '*', '/', '='],
          correctEquation: '3x + 5 = 17'
        },
        correctAnswer: '3x + 5 = 17'
      },
      {
        id: 'q5',
        type: 'hot-text',
        title: 'Select Adjectives',
        instruction: 'Select all the adjectives in the sentence',
        content: 'The quick brown fox jumps over the lazy dog.',
        points: 2,
        hotTexts: [
          { id: 'the1', text: 'The', selectable: false, correct: false },
          { id: 'quick', text: 'quick', selectable: true, correct: true },
          { id: 'brown', text: 'brown', selectable: true, correct: true },
          { id: 'fox', text: 'fox', selectable: true, correct: false },
          { id: 'jumps', text: 'jumps', selectable: true, correct: false },
          { id: 'over', text: 'over', selectable: false, correct: false },
          { id: 'the2', text: 'the', selectable: false, correct: false },
          { id: 'lazy', text: 'lazy', selectable: true, correct: true },
          { id: 'dog', text: 'dog', selectable: true, correct: false }
        ],
        correctAnswer: ['quick', 'brown', 'lazy']
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        title: 'Capital of France',
        instruction: 'Select the correct answer',
        content: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        points: 1
      },
      {
        id: 'q7',
        type: 'multiple-response',
        title: 'Prime Numbers',
        instruction: 'Select all prime numbers',
        content: 'Which of the following numbers are prime?',
        options: ['2', '4', '7', '9', '11', '15'],
        correctAnswer: [0, 2, 4],
        points: 3
      },
      {
        id: 'q8',
        type: 'inline-choice',
        title: 'Complete the Passage',
        instruction: 'Choose the correct word for each blank',
        content: 'The scientific method involves making observations, forming a [hypothesis/theory/law], and conducting [experiments/surveys/interviews] to test it.',
        choiceData: [
          { position: 1, options: ['hypothesis', 'theory', 'law'], correctIndex: 0 },
          { position: 2, options: ['experiments', 'surveys', 'interviews'], correctIndex: 0 }
        ],
        correctAnswer: [0, 0],
        points: 2
      },
      {
        id: 'q9',
        type: 'table-grid',
        title: 'Select Correct Cells',
        instruction: 'Select the cells that represent prime numbers',
        content: 'In the grid below, select all cells containing prime numbers.',
        tableData: {
          rows: 3,
          cols: 3,
          headers: ['Col 1', 'Col 2', 'Col 3'],
          data: [
            [2, 4, 6],
            [3, 5, 8],
            [7, 9, 11]
          ],
          selectableRows: false,
          selectableCols: false
        },
        gridData: [
          [
            { id: '0-0', row: 0, col: 0, content: '2', selectable: true, correct: true },
            { id: '0-1', row: 0, col: 1, content: '4', selectable: true, correct: false },
            { id: '0-2', row: 0, col: 2, content: '6', selectable: true, correct: false }
          ],
          [
            { id: '1-0', row: 1, col: 0, content: '3', selectable: true, correct: true },
            { id: '1-1', row: 1, col: 1, content: '5', selectable: true, correct: true },
            { id: '1-2', row: 1, col: 2, content: '8', selectable: true, correct: false }
          ],
          [
            { id: '2-0', row: 2, col: 0, content: '7', selectable: true, correct: true },
            { id: '2-1', row: 2, col: 1, content: '9', selectable: true, correct: false },
            { id: '2-2', row: 2, col: 2, content: '11', selectable: true, correct: true }
          ]
        ],
        correctAnswer: ['0-0', '1-0', '1-1', '2-0', '2-2'],
        points: 5
      },
      {
        id: 'q10',
        type: 'point-graph',
        title: 'Plot the Points',
        instruction: 'Plot the points that satisfy y = 2x + 1',
        content: 'On the coordinate plane, plot three points that lie on the line y = 2x + 1.',
        graphData: {
          xMin: -5,
          xMax: 5,
          yMin: -5,
          yMax: 5,
          gridSize: 1,
          correctPoints: [
            { x: 0, y: 1 },
            { x: 1, y: 3 },
            { x: 2, y: 5 }
          ]
        },
        correctAnswer: [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }],
        points: 3
      },
      {
        id: 'q11',
        type: 'shape-transform',
        title: 'Transform the Shape',
        instruction: 'Apply a 90-degree clockwise rotation to the triangle',
        content: 'Rotate the given triangle 90 degrees clockwise about the origin.',
        shapeData: {
          shapes: [
            {
              id: 'triangle1',
              type: 'triangle',
              coordinates: [0, 0, 3, 0, 0, 3],
              color: '#3b82f6'
            }
          ],
          transformations: ['rotate-90-cw', 'rotate-90-ccw', 'reflect-x', 'reflect-y']
        },
        correctAnswer: 'rotate-90-cw',
        points: 3
      },
      {
        id: 'q12',
        type: 'solution-set',
        title: 'Find Solution Set',
        instruction: 'Determine the solution set for the inequality',
        content: 'Find the solution set for the inequality: 2x + 3 > 7',
        solutionData: {
          equation: '2x + 3 > 7',
          solutionSet: ['x > 2'],
          inequalities: ['x > 2', 'x < 2', 'x ≥ 2', 'x ≤ 2']
        },
        correctAnswer: 'x > 2',
        points: 2
      }
    ];
  }

  getQuestionById(id: string): Question | undefined {
    return this.getDemoQuestions().find(q => q.id === id);
  }

  getQuestionsByType(type: TEIType): Question[] {
    return this.getDemoQuestions().filter(q => q.type === type);
  }
}
