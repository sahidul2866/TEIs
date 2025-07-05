import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ExamRoutingModule } from './exam-routing.module';
import { ExamComponent } from './exam.component';
import { QuestionRendererComponent } from './components/question-renderer/question-renderer.component';
import { DragDropComponent } from './components/drag-drop/drag-drop.component';
import { FillBlankComponent } from './components/fill-blank/fill-blank.component';
import { HotSpotComponent } from './components/hot-spot/hot-spot.component';
import { EquationEditorComponent } from './components/equation-editor/equation-editor.component';
import { HotTextComponent } from './components/hot-text/hot-text.component';
import { MultipleChoiceComponent } from './components/multiple-choice/multiple-choice.component';
import { MultipleResponseComponent } from './components/multiple-response/multiple-response.component';
import { InlineChoiceComponent } from './components/inline-choice/inline-choice.component';
import { TableGridComponent } from './components/table-grid/table-grid.component';
import { PointGraphComponent } from './components/point-graph/point-graph.component';
import { ShapeTransformComponent } from './components/shape-transform/shape-transform.component';
import { SolutionSetComponent } from './components/solution-set/solution-set.component';

@NgModule({
  declarations: [
    ExamComponent,
    QuestionRendererComponent,
    DragDropComponent,
    FillBlankComponent,
    HotSpotComponent,
    EquationEditorComponent,
    HotTextComponent,
    MultipleChoiceComponent,
    MultipleResponseComponent,
    InlineChoiceComponent,
    TableGridComponent,
    PointGraphComponent,
    ShapeTransformComponent,
    SolutionSetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ExamRoutingModule
  ]
})
export class ExamModule { }
