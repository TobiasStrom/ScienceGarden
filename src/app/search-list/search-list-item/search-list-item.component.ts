import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from 'src/app/models/article.model';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search-list-item',
  templateUrl: './search-list-item.component.html',
  styleUrls: ['./search-list-item.component.scss']
})
export class SearchListItemComponent{
  @Input() article : Article;
  moreInfo = false;
  noMoreInfo = false;
  buttonInDisable: boolean = false;
  buttonOutDisable: boolean = false;

  constructor(private searchService: SearchService, private router: Router) {}

  /**
    * When user choose to build an inn or out graph
      if it the article don't have any in-citations or out-citations
      the corresponding button will be deactivated
  */
  onNavigate(paperId:string, state : string){
    this.searchService.fetchNodes(paperId, 'id', state).subscribe(
      post => {
        if(post.$S2PaperID != '-1'){
          this.article = post;
          if(state == 'in' && post.$inCitations > 0){
            this.router.navigate(['tree'], {
              queryParams: {
                paperId: paperId,
                state: state,
              }
            });
          }
          if(state == 'in' && post.$inCitations == 0){
            this.buttonInDisable = true;
          }
          if(state == 'out' && post.$outCitations > 0){
            this.router.navigate(['tree'], {
              queryParams: {
                paperId: paperId,
                state: state,
              }
            });
          }
          if(state == 'out' && post.$outCitations == 0){
            this.buttonOutDisable = true;
          }
        }
        else{
          this.noMoreInfo = true;
        }
      }
    )
  }

  /**
    * When the more info button i pressed.
      it return more information and make the card bigger
   */
  onMoreInfo(paperId: string, state : string){
    this.searchService.fetchNodes(paperId, 'id', 'root').subscribe(
      post => {
        if(post.$S2PaperID != '-1'){
          if(post.$outCitations == 0){
            this.buttonOutDisable = true;
          }
          if(post.$inCitations == 0){
            this.buttonInDisable = true;
          }
          this.article = post;
        }
        else{
          this.noMoreInfo = true;
        }
        if(post.$DOI == 'null'){
          post.$DOI = "This paper has no DOI"
        }

        if(post.$paperAbstract == 'null'){
          post.$paperAbstract = "This paper has no abstract."
        }
        this.article ;
      }
    )
    this.moreInfo = !this.moreInfo;
  }

}
