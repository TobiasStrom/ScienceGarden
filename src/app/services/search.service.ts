import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service'
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpEventType
} from '@angular/common/http';
import { map, catchError, first } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Article } from 'src/app/models/article.model';
//import { Settings } from '../settings/settings.component'


@Injectable({ providedIn: 'root' })
export class SearchService{
  maxNodesPerNode : number = 1000;
  maxTotalNodes : number = 10000;

  constructor(
    private http: HttpClient,

    ) {
      this.updateMaxValues();
    }
    startUrl : string = "https://api.sciencegarden.org/api/article";



   fetchPosts(title : string, method : string, page : number) {
    var url : string = "";
    let searchParams = new HttpParams();
    searchParams = searchParams.append('state', 'root');
    searchParams = searchParams.append('bySearchEngine', 'no');

    url = this.startUrl+"/title/"+title;
    searchParams = searchParams.append('pageID', page.toString());



    return this.http
      .get<{ [key: string]: Article }>(
        url,
        {
          params: searchParams,
          responseType: 'json'
        }
      )
      .pipe(
        map(responseData => {
          if(responseData['error']){
            return [];
           }
          const searchArray: Article[] = [];
          for (var id in responseData) {
            if (responseData.hasOwnProperty('papers')) {
              for(var element in responseData[id]){
                var doi = "";
                if(responseData[id][element]['DOI'] != ''){
                    doi = responseData[id][element]['DOI'];
                }
                else
                {
                  doi = "This paper has no DOI"
                }
                let article = new Article(responseData[id][element]['S2PaperID'], null , [], [], doi, false, false,  responseData[id][element]['Title'], null);

                searchArray.push(article);
              }
            }
          }
          return searchArray;
        }),
        catchError(errorRes => {
          // Send to analytics server
          return throwError(errorRes);
        })
      );
  }

  fetchNodes(input: string, method: string, state: string) {
    var url : string = "";
    let searchParams = new HttpParams();

    searchParams = searchParams.append('state', 'root');

    if(method == "doi"){
      url = this.startUrl+"/DOI/"+input;
    }
    else{
      url = this.startUrl+"/S2PaperID/"+input;
    }

    return this.http
      .get<{ [key: string]: Article }>(
        url,
        {
          headers: new HttpHeaders({ 'Access-Control-Allow-Origin': '*' }),
          params: searchParams,
          responseType: 'json'
        }
      )
      .pipe(
        map(responseData => {
          if(responseData['error']){
            return new Article('-1');
           }

          var paperAbstract : string = String(responseData["PaperAbstract"]);
          var authors : string[] = [];
          for(let id in responseData["Authors"]){
              authors.push(responseData["Authors"][id]);
          }
          var children : Article[] = [];
          var inCount: number = 0;
          var outCount : number = 0;
          if(state == 'in'){

            for(let i = 0; i < Object.keys(responseData["InCitations"]).length; i++){
              if(this.totalCountTree < this.maxTotalNodes){
                if(i < this.maxNodesPerNode){
                  var inArticle = new Article(responseData['InCitations'][i], null, null, null,null,null , null, null, null, "#dae0e6", null);
                  children.push(inArticle);
                  this.totalCountTree++;
                }
                inCount++;
              }
            }
            for(let id in responseData["OutCitations"]){
              outCount++;
            }

          }
          else{
            for (let i = 0; i < Object.keys(responseData["OutCitations"]).length; i++) {
            //for(let id in responseData["OutCitations"]){
              if(this.totalCountTree < this.maxTotalNodes){
                if(i < this.maxNodesPerNode){
                  var outArticle = new Article(responseData['OutCitations'][i], null, null, null,null,null , null, null, null, "#dae0e6", null);
                  children.push(outArticle);
                  this.totalCountTree++;
                }
                outCount++;
              }

            }
            for(let id in responseData['InCitations']){
              inCount++;
            }

          }


          var doi = "";
          if (responseData.hasOwnProperty('Doi')) {
            if(String(responseData['Doi']) != '' || typeof(responseData['Doi']) != "string"){
              doi = String(responseData['Doi']);
            }
            else{
              doi = "This paper has no DOI"
            }

          }



          var isOpenAccess : boolean = false;
          if(String(responseData['IsOpenAccess']) === "true"){
            isOpenAccess = true;
          }

          var isPublisherLicensed : boolean = false;
          if(String(responseData['IsPublisherLicensed']) === "true"){
            isPublisherLicensed = true;

          }

          var paperID = String(responseData['S2PaperID']);


          var title = String(responseData['Title']);
          var year = responseData["Year"];

          var type = "normal";


          if(
            title.toUpperCase().includes("RETRACTED:") ||
            title.toUpperCase().includes("RETRACTED :") ||
            title.toUpperCase().includes("WITHDRAWN:") ||
            title.toUpperCase().includes("RETRACTED ARTICLE:")||
            title.toUpperCase().includes("(RETRACTED ARTICLE)")||
            title.toUpperCase().includes("(RETRACTED ARTICLE):")||
            title.toUpperCase().includes("RETRACTED ARTICLE:")||
            title.toUpperCase().includes("[RETRACTED]")||
            title.toUpperCase().includes("(RETRACTED)")||
            title.toUpperCase().includes("- RETRACTED")||
            title.toUpperCase().includes("RETRACTED. \"A")||
            title.toUpperCase().includes("RETRACTED PAPER:")||
            title.toUpperCase().includes("(RETRACTED ARTICLE. ")||
            title.toUpperCase().includes("TAXING: RETRACTED ARTICLE")||
            title.toUpperCase().includes("RETRACTED Book Review:")||
            title.toUpperCase().includes("THIS ARTICLE HAS BEEN RETRACTED")||
            title.toUpperCase().includes("[ARTICLE RETRACTED]")||
            title.toUpperCase().includes("RETRACTED REVIEW:")
            ){
            type = 'retracted';
          }


          let article = new Article(paperID, paperAbstract, authors, children, doi, isOpenAccess,
            isPublisherLicensed, title, Number(year), null,  type, inCount, outCount);

          return article;
        }
      ),

      catchError(errorRes => {
          // Send to analytics server
          return throwError('Vi får en feil');
        })
      );
  }

  root : Article = null;
  current : Article;
  title : string;
  value: boolean = false;
  stopped : boolean = false;
  //nodes : Article;
  done: boolean = false;



  queue : Article[] = [];


  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(()=>resolve(), ms));
  }


  async buildTree(type: string, rootId : string){
    this.value = false;
    this.current = null;
    this.stopped = false;

    const sub = this.fetchNodes(rootId, 'S2PaperId', type).pipe(first()).subscribe(node => {
      this.root = node;
      if(this.root.$type != 'retracted'){
        this.root.$type = 'root';
      }
      this.value = true;
      this.countTotal++;
    });

    while(!this.value){
      await this.delay(10);
    }

    sub.unsubscribe();

    this.BFSTreeBuilder(type, this.root);
  }

  child : Article = null;
  countTotal : number = 0;
  totalCountTree: number = 1;

  async BFSTreeBuilder(type: string, node: Article){
    this.delay(1000);
    this.updateMaxValues();

    let BFSQueue : Article[] =[];
    BFSQueue.push(node);
    let limitReached = false;
    this.nodes = [];
    this.done = false;

    while (BFSQueue.length > 0 && !this.stopped){
      if(limitReached) break;
      let currentNode : Article = BFSQueue.shift();
      this.queue.push(currentNode);
      if(this.nodes.includes(currentNode.$S2PaperID)){
        currentNode.$children = [];
        currentNode.$type = "exist";
      }else{
        this.nodes.push(currentNode.$S2PaperID);
      }


      currentNode = this.setColor(currentNode, type);
      for(let i=0; i < currentNode.$children.length; i++){
        if (this.stopped){
          this.done = true;
          break;
        }
        this.value = false;
        const sub = this.fetchNodes(currentNode.$children[i].$S2PaperID, 'S2PaperId', type).pipe(first()).subscribe(post => {

          if(!this.stopped){
            if (this.countTotal >= this.maxTotalNodes){
              limitReached = true;
              this.value = true;
            }else{

              currentNode.$children[i] = post;
              this.child = post;
              currentNode.$children[i] = this.setColor(currentNode.$children[i], type);

              BFSQueue.push(post);
              this.value = true;
              this.countTotal++;

              if(this.countTotal % 10 == 0){
                console.log(this.countTotal);
              }

            }
          }else{
            console.log("STOOOOOPPPPP");
            this.done = true;
          }
        });

        while(!this.value && !this.stopped){
          await this.delay(10);
        }
        sub.unsubscribe();

        if (limitReached){
          this.done = true;
          break;
        }
      }
      if (this.stopped || this.done){
        this.done = true;
        break;
      }
    }

    this.done = true;
    console.log('Done in BFSTree');
  }
  nodes : string[] = [];
  setColor(node: Article, type : String){

    let green = "#51d63d"
    let green1 = "#6bb534"
    let green2 = "#86942a"
    let green3 = "#ad651d"
    let green4 = "#d7320e"
    let green5 = "#fe0200"

    if(Number(localStorage.getItem('ColorBlind')) == 0){

      if(node.$type == "normal"){
        node.$color = "#5cb85c";
      }
      if(node.$isOpenAccess == true){
        node.$color = "#006400";
      }
      /*
      if(node.$isPublisherLicensed == true){
        node.$color = '#FFFF00'
      }
      */
      if(node.$isPublisherLicensed == true && node.$isOpenAccess == true){
        node.$color = '#FFFF00'
      }
      if(node.$type == 'exist'){
        node.$color = "blue";
        return node;
      }
      if(node.$type == 'root') {
        node.$color = "#8B4513";
      }
      if(node.$type == "retracted"){
        node.$color = "#FF0000";
        return node;
      }
    }
    else{
      if(node.$type == "retracted"){
        node.$color = "#FF0000";
        return node;
      }
      if(node.$type == "normal"){
        node.$color = "brown";
      }
      if(node.$isOpenAccess == true){
        node.$color = "#c69146";
      }
      if(node.$isPublisherLicensed == true){
        node.$color = '#835d27'
      }
      if(node.$isPublisherLicensed == true && node.$isOpenAccess == true){
        node.$color = '#FFFF00'
      }
      if(node.$type == 'exist'){
        node.$color = "#ebd8bd";
        return node;
      }
      if(node.$type == 'root') {
        node.$color = "#8B4513";
      }
    }

    /*
    if(node.$children.length == 0){
      node.$color = "orange";
    }
    */
    return node;
  }

  updateMaxValues(){
    let maxNodesPerNode = Number(localStorage.getItem('MaxNodesPerNode'));
    let maxTotalNodes = Number(localStorage.getItem('MaxTotalNodes'));

    if(!isNaN(maxNodesPerNode) && !isNaN(maxTotalNodes) && maxNodesPerNode > 0 && maxTotalNodes > 0){
      this.maxTotalNodes = maxTotalNodes;
      this.maxNodesPerNode = maxNodesPerNode;
    } else{
      this.maxTotalNodes = 10000;
      this.maxNodesPerNode = 10000;
    }
  }
}
