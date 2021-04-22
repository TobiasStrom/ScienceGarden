import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { InfoComponent } from './info/info.component';
import { SearchFieldComponent } from './search-field/search-field.component';
import { SearchListComponent } from './search-list/search-list.component';
import { SearchListItemComponent } from './search-list/search-list-item/search-list-item.component';
import { TreeGraphComponent } from './tree-graph/tree-graph.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { NavbarComponent } from './navbar/navbar.component';
import { SettingsComponent } from './settings/settings.component';
import { HashLocationStrategy, LocationStrategy  } from '@angular/common';



@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,

    HomeComponent,
    InfoComponent,
    SearchFieldComponent,
    SearchListComponent,
    SearchListItemComponent,
    TreeGraphComponent,
    NavbarComponent,
    SettingsComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatProgressSpinnerModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatCardModule,

  ],
  providers: [
    {provide : LocationStrategy , useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
