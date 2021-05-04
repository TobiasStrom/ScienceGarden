import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { Article } from '../models/article.model';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss']
})
export class SearchListComponent implements OnInit {
  page : number = 1;
  list : Array<Article> = [];
  searchIn: string
  type : string;

  constructor(private searchService: SearchService, private route: ActivatedRoute) {}


  ngOnInit(): void {
    // get the parameters for the Url
    this.route.queryParams.subscribe( params => {
      this.type = params['type'];
      this.searchIn = params['search'];
      this.onFetchArticle();
      this.list = [];
      this.page = 1;
    });
  }

  // fetch information from search and adds it to the list visible on the page
  onFetchArticle(){
    var name = this.searchIn;
    var encoded : string;
    encoded = btoa(name);
    if(this.type == "title"){
      this.searchService.fetchPosts(encoded, this.type , this.page).pipe(first()).subscribe(
        post => {
          this.list = post;
        }
      );
    }
    else{
      if(this.type == "id"){
        encoded = name;
      }
      this.searchService.fetchNodes(encoded, this.type, "root").pipe(first()).subscribe(
        post => {
          this.list = [];
          this.list.push(post);
        }
      );
    }
  }

  // go to next and previous page
  nextPage(yes: boolean){
    if(yes){
      this.page++;
      this.onFetchArticle();
    }else{
      this.page--;
      this.onFetchArticle();
    }
    window.scroll(0,0);
  }
}
