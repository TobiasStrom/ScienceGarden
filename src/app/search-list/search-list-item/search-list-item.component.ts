import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from 'src/app/models/article.model';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search-list-item',
  templateUrl: './search-list-item.component.html',
  styleUrls: ['./search-list-item.component.scss']
})
export class SearchListItemComponent implements OnInit {
  @Input() article : Article;
  moreInfo = false;

  open: boolean = false;
  out : string  = "Info";
  noMoreInfo = false;
  articles : Article;
  buttonInDisable: boolean = false;
  buttonOutDisable: boolean = false;

  constructor(private http: HttpClient, private searchService: SearchService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
  }
  onNavigate(paperId: string, state : string){
    this.searchService.fetchNodes(paperId, 'id', state).subscribe(
      post => {

        console.log(state)


        if(post.$S2PaperID != '-1'){
          this.article = post;
          if(state == 'in' && post.$inCitations > 0){
            this.router.navigate(['tree'], {
              queryParams: {
                paperId: paperId,
                state: state,
              }
            } );
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
            } );

          }
          if(state == 'out' && post.$outCitations == 0){
            this.buttonOutDisable = true;
          }

        }
        else{

          this.noMoreInfo = true; // One article when search for test, page 5, 8 from top;
        }

      }
    )

  }


  onMoreInfo(paperId: string, state : string){
    this.searchService.fetchNodes(paperId, 'id', 'root').subscribe(
      post => {
        console.log(post);
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
          this.noMoreInfo = true; // One article when search for test, page 5, 8 from top;
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
