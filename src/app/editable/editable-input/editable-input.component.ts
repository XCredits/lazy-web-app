import { Component, Input, Output, EventEmitter, OnChanges, ViewEncapsulation } from '@angular/core';
import { EditableComponent } from '../editable.component';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-editable-input',
  templateUrl: 'editable-input.component.html'
})
export class EditableInputComponent extends EditableComponent implements OnChanges {

  @Input() public type = 'text';
}
