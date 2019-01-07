import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  themeObservable: Subject<string> = new ReplaySubject<string>(1);
  constructor() {
    this.themeObservable.next(undefined);
  }

  updateTheme(themeString: string) {
    if (themeString !== 'light' && themeString !== 'dark') {
      console.log('Error: theme type not found.');
    }
    this.themeObservable.next(themeString);
  }
}
