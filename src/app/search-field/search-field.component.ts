import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss']
})
export class SearchFieldComponent {
  @ViewChild('searchInput',{static:false}) searchInputRef: ElementRef; // get input from field
  buttonType = 'title'
  buttonName = 'Title'
  constructor( private router : Router) { }

  // to change value on dropdown menu
  changeModus(modus : string){
    switch(modus){
      case 'title':
        this.buttonName = 'Title';
        this.buttonType = modus;
        break;
      case 'id':
        this.buttonName = 'S2PaperId';
        this.buttonType = modus;
        break;
      case 'doi':
        this.buttonName = 'DOI';
        this.buttonType = modus;
        break;
    }
  }

  //When user presses search button
  onSearch(event: Event){
    if(this.searchInputRef.nativeElement.value != ""){ // only if there are some info in field
      this.router.navigate(['/search'], { queryParams : { 'type': this.buttonType, 'search': this.searchInputRef.nativeElement.value }}); // navigate to search window
      window.scroll(0,0); // navigate to top of screen
    }
  }
}
