import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SearchService } from '../services/search.service';
import { CookieService } from 'ngx-cookie-service'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  maxNodesPerNode : number = 100000;
  maxTotalNodes : number = 100000;

  constructor(
    private searchService: SearchService, private cookieService : CookieService
  ) { }

  ngOnInit(): void {
    let maxNodesPerNode = Number(this.cookieService.get("MaxNodesPerNode"));
    let maxTotalNodes = Number(this.cookieService.get("MaxTotalNodes"));

    if(!isNaN(maxNodesPerNode) && !isNaN(maxTotalNodes) && maxNodesPerNode > 0 && maxTotalNodes > 0){
      this.maxTotalNodes = maxTotalNodes;
      this.maxNodesPerNode = maxNodesPerNode;
    } else{
      this.maxTotalNodes = 10000;
      this.maxNodesPerNode = 10000;
    }
  }

  onTextBoxChangeNodesPerNode(event : Event){
    let inputValue = (event.target as HTMLInputElement).valueAsNumber;
    if(inputValue > 0){
      this.maxNodesPerNode = inputValue;
      this.generateCookies();
    }


    //this.previousElementSibling.value = this.value
  }
  onSliderChangeNodesPerNode(event : Event){
    //this.previousElementSibling.value = this.value
    this.maxNodesPerNode = (event.target as HTMLInputElement).valueAsNumber;
    this.generateCookies();
  }
  onTextBoxChangeTotalNodes(event : Event){
    let inputValue = Number((event.target as HTMLInputElement).valueAsNumber);
    if(inputValue > 0){
      this.maxTotalNodes = inputValue;
      this.generateCookies();
    }
    //this.previousElementSibling.value = this.value
  }
  onSliderChangeTotalNodes(event : Event){
    //this.previousElementSibling.value = this.value
    this.maxTotalNodes = (event.target as HTMLInputElement).valueAsNumber;
    this.generateCookies();
  }

  generateCookies(){
    this.cookieService.set('MaxNodesPerNode', String(this.maxNodesPerNode));
    this.cookieService.set('MaxTotalNodes', String(this.maxTotalNodes));;
  }


}
