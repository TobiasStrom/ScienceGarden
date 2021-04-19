import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from '../models/article.model';
import { SearchService } from '../services/search.service';

interface SearchMethods {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss']
})
export class SearchListComponent implements OnInit {

  totalAngularPackages = "test";
  out : string = "Info"
  loading : boolean = false;
  page : number = 1;
  list : Array<Article> = [];

  methods: SearchMethods[] = [
    {value: 'title', viewValue: 'Title'},
    {value: 'doi', viewValue: 'DOI'},
    {value: 's2paperId', viewValue: 'S2PaperID'}
  ];

  selected : string;

  @ViewChild('nameInput',{static:false}) nameInputRef: ElementRef;

  //articles$: Observable;
  searchIn: string;
  type : string;

  constructor(private http: HttpClient, private searchService: SearchService, private route: ActivatedRoute, private router: Router) {

    this.searchIn = this.route.snapshot.paramMap.get('search');
    //var type = this.route.snapshot.paramMap.get('type');
  }


  ngOnInit(): void {
    //var searchIn : string;
    this.route.queryParams.subscribe( params => {
      this.type = params['type'];
      this.searchIn = params['search'];
      this.onFetchArticle();
      this.list = [];
      this.loading= true;
      this.page = 1;
    }
    );


  }

  onFetchSearch(type: string, searchIn : string){
    var encoded : string;
    console.log(type);

    encoded = btoa(searchIn);
    if(type == "title"){
      this.searchService.fetchPosts(encoded, this.selected, this.page).subscribe(
        post => {
          this.list = post;

        }
      );
    }
    else{
      if(type == "id" || type == 'doi'){
        encoded = searchIn;
      }
      this.searchService.fetchNodes(encoded, this.selected, "root").subscribe(
        post => {
          console.log(post);
          this.list = [];
          this.list.push(post);

        }
      );
    }

  }


  onFetchArticle(){
    this.loading = true;
    var name = this.searchIn;
    var encoded : string;

    encoded = btoa(name);
    if(this.type == "title"){
      this.searchService.fetchPosts(encoded, this.type , this.page).subscribe(
        post => {
          this.list = post;
        }
      );
    }
    else{
      if(this.type == "id"){
        encoded = name;
      }

      this.searchService.fetchNodes(encoded, this.type, "root").subscribe(
        post => {
          //console.log(post);
          this.list = [];
          this.list.push(post);
          this.loading = false;
        }
      );
    }



  }

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
