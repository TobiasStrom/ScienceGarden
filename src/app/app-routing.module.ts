import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { InfoComponent } from './info/info.component';
import { SearchListComponent } from './search-list/search-list.component';
import { TreeGraphComponent } from './tree-graph/tree-graph.component';

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'info', component: InfoComponent},
  {path: 'search', component: SearchListComponent},
  {path: 'tree', component: TreeGraphComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
