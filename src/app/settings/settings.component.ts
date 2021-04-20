import { Component, OnInit } from '@angular/core';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(
    private searchService: SearchService,
  ) { }

  ngOnInit(): void {
  }

  onTextBoxChange(){
    //this.previousElementSibling.value = this.value
  }
  onSliderChange(){
    //this.previousElementSibling.value = this.value
  }
  onTextChange(event: any){
  }

}
