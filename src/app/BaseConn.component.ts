// Use card
// Position:fixed, to the right below the menu bar
import { Component, OnInit } from '@angular/core';

@Component({
  template: ''
})
export class BaseComponent {

  constructor() {
      this.logNavigation();
  }


  private logNavigation() {
    console.log('This is the base class');
}
}
