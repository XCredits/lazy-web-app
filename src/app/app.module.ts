import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http'; // Deprecation https://angular.io/api/http/HttpModule
import { RouterModule } from '@angular/router';
import { LocalStorageModule } from 'angular-2-local-storage';
import { AppComponent } from './app.component';
import { UserService } from './user.service';
import { StatsService } from './stats.service';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

// Material modules
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';

// Below is for Progressive Web App (PWA) functionality
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';

// Routes
import { HomeComponent } from './home/home.component';
import { HelpComponent } from './help/help.component';
import { SettingsComponent } from './settings/settings.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FeedComponent } from './feed/feed.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotUsernameComponent } from './forgot-username/forgot-username.component';
import { RegisterComponent } from './register/register.component';
import { MailingListComponent } from './mailing-list/mailing-list.component';
import { ProfileComponent } from './profile/profile.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';
import { AdminComponent } from './admin/admin.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { MailingListChartComponent } from './mailing-list-chart/mailing-list-chart.component';
import { UserRegisterChartComponent } from './user-register-chart/user-register-chart.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HelpComponent,
    SettingsComponent,
    PageNotFoundComponent,
    FeedComponent,
    ContactsComponent,
    AboutComponent,
    LoginComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ChangePasswordComponent,
    ForgotUsernameComponent,
    RegisterComponent,
    MailingListComponent,
    ProfileComponent,
    UserDropdownComponent,
    AdminComponent,
    UnauthorizedComponent,
    MailingListChartComponent,
    UserRegisterChartComponent,
    TermsComponent,
    PrivacyComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    LocalStorageModule.withConfig({
        prefix: 'app',
        storageType: 'localStorage'
    }),

    RouterModule.forRoot([
      {
        path: 'home',
        component: HomeComponent,
        data: { title: 'Home' },
      },
      {
        path: 'feed',
        component: FeedComponent,
        data: { title: 'Feed' },
      },
      {
        path: 'contacts',
        component: ContactsComponent,
        data: { title: 'Contacts' },
      },
      {
        path: 'help',
        component: HelpComponent,
        data: { title: 'Help' },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: { title: 'Profile' },
        canActivate: [AuthGuard],
      },
      {
        path: 'mailing-list',
        component: MailingListComponent,
        data: { title: 'Mailing list' },
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { title: 'Settings' },
      },
      {
        path: 'about',
        component: AboutComponent,
        data: { title: 'About' },
      },
      {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login' },
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        data: { title: 'Forgot Password' },
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        data: { title: 'Reset Password' },
      },
      {
        path: 'forgot-username',
        component: ForgotUsernameComponent,
        data: { title: 'Forgot Username' },
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'Register' },
      },
      {
        path: 'admin',
        component: AdminComponent,
        data: { title: 'Admin' },
        canActivate: [AdminGuard],
      },
      {
        path: 'terms',
        component: TermsComponent,
        data: { title: 'Terms' },
      },
      {
        path: 'privacy',
        component: PrivacyComponent,
        data: { title: 'Privacy' },
      },
      {
        path: 'unauthorized',
        component: UnauthorizedComponent,
        data: { title: 'Unauthorized' },
      },
      { // Default route
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
      },
      {
        path: '**',
        component: PageNotFoundComponent,
        data: { title: 'Page Not Found' },
      },
    ]),

    BrowserAnimationsModule,
    // NgbModule,
    AngularFontAwesomeModule,

    // Material modules
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,

    // Below is for Progressive Web App (PWA) functionality
    ServiceWorkerModule.register('/ngsw-worker.js',
        {enabled: environment.production})
  ],
  providers: [UserService, StatsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
