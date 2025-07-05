# TEI Practice Frontend

## Overview

This is an Angular-based web application designed to help students practice SHSAT (Specialized High School Admissions Test) Technology-Enhanced Items (TEIs). The application provides an interactive learning environment where students can familiarize themselves with 12 different types of TEI questions commonly found in standardized tests.

## System Architecture

### Frontend Architecture
- **Framework**: Angular 19.2.14 with TypeScript
- **Architecture Pattern**: Component-based with NgModule structure (not standalone components)
- **Styling**: Tailwind CSS 4.1.11 for responsive design and utility-first styling
- **State Management**: Local component state with services for data management
- **Routing**: Angular Router with lazy loading for the exam module

### Key Components

#### Core Application Structure
- **AppComponent**: Main application shell with navigation
- **HomeComponent**: Landing page with TEI type overview
- **ExamModule**: Lazy-loaded feature module containing exam functionality

#### Exam System
- **ExamComponent**: Main exam controller managing question flow and scoring
- **QuestionRendererComponent**: Dynamic component renderer that switches between different TEI types
- **12 TEI Components**: Individual components for each question type (drag-drop, fill-blank, hot-spot, etc.)

#### Services and Models
- **QuestionService**: Provides demo questions and manages question data
- **Question Model**: Comprehensive interface supporting all TEI question types

## Data Flow

1. **Application Bootstrap**: Angular bootstraps AppModule and loads the main shell
2. **Navigation**: Users navigate between Home (/) and Exam (/exam) routes
3. **Exam Initialization**: ExamComponent loads demo questions from QuestionService
4. **Question Rendering**: QuestionRendererComponent dynamically renders appropriate TEI component
5. **Answer Management**: Each TEI component manages its own answer state and emits changes
6. **Progress Tracking**: ExamComponent tracks answers, progress, and calculates final score

## External Dependencies

### Core Angular Dependencies
- `@angular/core`, `@angular/common`, `@angular/router`: Core Angular framework
- `@angular/forms`: Template-driven and reactive forms
- `@angular-devkit/build-angular`: Build tools and development server

### Styling and UI
- `tailwindcss`: Utility-first CSS framework
- `postcss` and `autoprefixer`: CSS processing
- Font Awesome: Icon library loaded via CDN

### Runtime Dependencies
- `rxjs`: Reactive programming library
- `zone.js`: Angular's change detection mechanism
- `tslib`: TypeScript runtime helpers

## Deployment Strategy

### Development
- Uses Angular CLI development server (`ng serve`)
- Hot reload enabled for rapid development
- Source maps enabled for debugging

### Production Build
- Optimized bundle sizes with budget limits (500KB initial, 1MB max)
- Component style budget (2KB warning, 4KB error)
- Output hashing for cache busting
- Tree-shaking and minification enabled

### Configuration
- TypeScript strict mode enabled
- Modern ES2022 target with ESM modules
- Experimental decorators for Angular features

## Key Architectural Decisions

### Module Strategy
- **Choice**: Traditional NgModule approach instead of standalone components
- **Rationale**: Provides clear module boundaries and dependency injection scoping
- **Benefits**: Better organization for feature modules, explicit dependency management

### TEI Component Architecture
- **Choice**: Individual components for each TEI type with shared interfaces
- **Rationale**: Separation of concerns and maintainability
- **Benefits**: Easy to add new TEI types, isolated component logic

### State Management
- **Choice**: Local component state with service-based data management
- **Rationale**: Application complexity doesn't warrant complex state management
- **Benefits**: Simpler architecture, faster development, easier testing

### Styling Strategy
- **Choice**: Tailwind CSS with custom component classes
- **Rationale**: Rapid UI development with consistent design system
- **Benefits**: Utility-first approach, responsive design, smaller CSS bundle

## Changelog

- July 05, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.