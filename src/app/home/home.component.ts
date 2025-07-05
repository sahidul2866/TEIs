import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent {
  teiTypes = [
    {
      name: 'Drag and Drop',
      description: 'Move items to their correct positions with intuitive drag-and-drop interactions',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zM16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/></svg>',
      difficulty: 'easy',
      features: ['Visual feedback', 'Snap to target', 'Undo support'],
      questionCount: 8,
      timeEstimate: 2
    },
    {
      name: 'Fill in the Blank',
      description: 'Complete sentences with the correct words or phrases',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
      difficulty: 'easy',
      features: ['Auto-complete', 'Spell check', 'Context hints'],
      questionCount: 12,
      timeEstimate: 3
    },
    {
      name: 'Hot Spot',
      description: 'Click on specific areas of an image or diagram',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      difficulty: 'medium',
      features: ['Visual overlays', 'Zoom support', 'Multi-select'],
      questionCount: 6,
      timeEstimate: 2
    },
    {
      name: 'Equation Editor',
      description: 'Build mathematical expressions using symbols and functions',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>',
      difficulty: 'hard',
      features: ['Symbol palette', 'Live preview', 'LaTeX support'],
      questionCount: 10,
      timeEstimate: 4
    },
    {
      name: 'Hot Text',
      description: 'Select words or phrases within a passage of text',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg>',
      difficulty: 'medium',
      features: ['Highlight text', 'Multi-selection', 'Reading mode'],
      questionCount: 9,
      timeEstimate: 3
    },
    {
      name: 'Multiple Choice',
      description: 'Choose the single best answer from multiple options',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      difficulty: 'easy',
      features: ['Clear options', 'Instant feedback', 'Explanation'],
      questionCount: 15,
      timeEstimate: 2
    },
    {
      name: 'Multiple Response',
      description: 'Select multiple correct answers from a list of options',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 7l-1.41-1.41-6.34 6.34-2.83-2.83L6 10.51l4.24 4.24z"/></svg>',
      difficulty: 'medium',
      features: ['Multi-select', 'Progress indicator', 'Partial credit'],
      questionCount: 8,
      timeEstimate: 3
    },
    {
      name: 'Inline Choice',
      description: 'Select from dropdown menus embedded within text',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>',
      difficulty: 'medium',
      features: ['Context aware', 'Smart suggestions', 'Flow control'],
      questionCount: 7,
      timeEstimate: 3
    },
    {
      name: 'Table Grid',
      description: 'Fill in data using an interactive table interface',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 10.02h5V21h-5zM17 21h3c1.1 0 2-.9 2-2v-9h-5v11zm3-18H5c-1.1 0-2 .9-2 2v3h19V5c0-1.1-.9-2-2-2zM3 19c0 1.1.9 2 2 2h3V10H3v9z"/></svg>',
      difficulty: 'medium',
      features: ['Cell validation', 'Auto-fill', 'Sort & filter'],
      questionCount: 6,
      timeEstimate: 4
    },
    {
      name: 'Point Graph',
      description: 'Plot points on an interactive coordinate plane',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>',
      difficulty: 'hard',
      features: ['Grid snapping', 'Coordinate display', 'Point editing'],
      questionCount: 5,
      timeEstimate: 4
    },
    {
      name: 'Shape Transform',
      description: 'Transform geometric shapes using various operations',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
      difficulty: 'hard',
      features: ['Real-time preview', 'Animation', 'Measurement tools'],
      questionCount: 4,
      timeEstimate: 5
    },
    {
      name: 'Solution Set',
      description: 'Enter multiple solutions to mathematical equations',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
      difficulty: 'hard',
      features: ['Set notation', 'Validation', 'Multiple formats'],
      questionCount: 5,
      timeEstimate: 4
    }
  ];

  scrollToTeiTypes(): void {
    const element = document.getElementById('tei-types');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}