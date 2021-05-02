import { Component, OnDestroy, OnInit } from '@angular/core';
import { isEmpty } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  maxNodesPerNode : number = 1000;
  maxTotalNodes : number = 10000;
  colorBlind : boolean = false;

  constructor(

  ) { }

  ngOnInit(): void {

    let maxNodesPerNode = Number(localStorage.getItem('MaxNodesPerNode'));
    let maxTotalNodes = Number(localStorage.getItem('MaxTotalNodes'));
    let colorBlind = Number(localStorage.getItem('ColorBlind'));


    if(colorBlind != null && colorBlind !== null){
      console.log('OnInit ' + colorBlind);
      if(colorBlind == 1){
        this.colorBlind = true;
      }else{
        this.colorBlind = false;
      }
    }else{
      this.colorBlind = false;
    }

    if(!isNaN(maxNodesPerNode) && !isNaN(maxTotalNodes) && maxNodesPerNode > 0 && maxTotalNodes > 0){
      this.maxTotalNodes = maxTotalNodes;
      this.maxNodesPerNode = maxNodesPerNode;

      //this.colorBlind = colorBlind;
    } else{
      this.maxTotalNodes = 10000;
      this.maxNodesPerNode = 1000;

    }
  }
  ngOnDestroy(): void {
    this.saveToLocaleStorage();
  }

  onTextBoxChangeNodesPerNode(event : Event){
    let inputValue = (event.target as HTMLInputElement).valueAsNumber;
    if(inputValue > 0){
      this.maxNodesPerNode = inputValue;
      this.saveToLocaleStorage();
    }
  }
  onSliderChangeNodesPerNode(event : Event){
    this.maxNodesPerNode = (event.target as HTMLInputElement).valueAsNumber;
    this.saveToLocaleStorage();
  }

  onTextBoxChangeTotalNodes(event : Event){
    let inputValue = Number((event.target as HTMLInputElement).valueAsNumber);
    if(inputValue > 0){
      this.maxTotalNodes = inputValue;
      this.saveToLocaleStorage();
    }
  }
  onSliderChangeTotalNodes(event : Event){
    this.maxTotalNodes = (event.target as HTMLInputElement).valueAsNumber;
    this.saveToLocaleStorage();
  }
  onCheckBox(event : Event){
    this.colorBlind = (event.target as HTMLInputElement).checked;
    this.saveToLocaleStorage();
  }

  saveToLocaleStorage(){
    localStorage.setItem('MaxNodesPerNode', String(this.maxNodesPerNode));
    localStorage.setItem('MaxTotalNodes', String(this.maxTotalNodes));
    if(this.colorBlind){
      localStorage.setItem('ColorBlind', '1');
    }else{
      localStorage.setItem('ColorBlind', '0');
    }
  }
}
