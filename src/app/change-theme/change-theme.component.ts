import { Component, OnInit } from '@angular/core';
import { SettingsService } from './../settings.service';

@Component({
  selector: 'app-change-theme',
  templateUrl: './change-theme.component.html',
  styleUrls: ['./change-theme.component.scss']
})
export class ChangeThemeComponent implements OnInit {
  initialChecked: boolean;

  constructor(private settingsService: SettingsService) {
    // Set checkbox to current setting
    settingsService.themeObservable.pipe()
        .subscribe(theme => {
          if (theme === 'dark') {
            this.initialChecked = true;
          }
        }).unsubscribe();
  }

  ngOnInit() { }


  toggleTheme(event) {
    const theme: string = event.checked ? 'dark' : 'light';
    this.settingsService.updateTheme(theme);
  }
}
