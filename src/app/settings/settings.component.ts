import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  // Default values
  maxNodesPerNode : number = 1000;
  maxTotalNodes : number = 10000;
  colorBlind : boolean = false;

  constructor() { }
  /**
   * Sets previous settings as current values if set.
   */
  ngOnInit(): void {
    let maxNodesPerNode = Number(localStorage.getItem('MaxNodesPerNode'));
    let maxTotalNodes = Number(localStorage.getItem('MaxTotalNodes'));
    let colorBlindNum = Number(localStorage.getItem('ColorBlind'));

    if(colorBlindNum != null && colorBlindNum !== null){
      if(colorBlindNum == 1){
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
    } else{
      this.maxTotalNodes = 10000;
      this.maxNodesPerNode = 1000;

    }
  }
  /**
   * Save when leaving screen
   */
  ngOnDestroy(): void {
    this.saveToLocaleStorage();
  }

  /**
   * The following on* methods validate input and set the values of corresponding text boxes and sliders to be the same.
   */
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

  /**
   * Save values to local storage
   */
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
