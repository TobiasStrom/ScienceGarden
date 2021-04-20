import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss']
})
export class SearchFieldComponent implements OnInit {

  @ViewChild('searchInput',{static:false}) searchInputRef: ElementRef;
  @Output() type = new EventEmitter<String>();
  @Output() text = new EventEmitter<String>();



  haveSearch = true;
  buttonType = 'title'
  buttonName = 'Title'
  constructor( private router : Router) { }

  ngOnInit(): void {
  }
  changeModus(modus : string){

    switch(modus){
      case 'title':
        this.buttonName = 'Title';
        this.buttonType = modus;
        break;
      case 'id':
        this.buttonName = 'PaperID';
        this.buttonType = modus;
        break;
        case 'doi':
        this.buttonName = 'DOI';
        this.buttonType = modus;
        break;
    }
  }
  onBuildTree(event: Event){
    //event.preventDefault();
    if(this.searchInputRef.nativeElement.value != "")
    this.router.navigate(['/search'], { queryParams : { 'type': this.buttonType, 'search': this.searchInputRef.nativeElement.value }});
    this.type.emit(this.buttonType);
    this.text.emit(this.searchInputRef.nativeElement.value);
    window.scroll(0,0);
    //console.log(this.searchInputRef.nativeElement.value);
  }
}
