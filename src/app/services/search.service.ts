import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpEventType
} from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Article } from 'src/app/models/article.model';



@Injectable({ providedIn: 'root' })
export class SearchService{
  constructor(private http: HttpClient) {}
  startUrl : string = "http://dettefunker.no/api/article";

  maxTotalNodes = 10000;

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

    searchParams = searchParams.append('state', state);

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
          var paperAbstract : string = String(responseData["PaperAbstract"]);
          var authors : string[] = [];
          for(let id in responseData["Authors"]){
              authors.push(responseData["Authors"][id]);

          }
          var children : Article[] = [];
          var inCount: number = 0;
          var outCount : number = 0;
          if(state == 'in'){
            for(let id in responseData['InCitations']){
              if(this.superTotalCount <= this.maxTotalNodes){
                var inArticle = new Article(responseData['InCitations'][id], null, null, null,null,null , null, null, null, "#3A5F0B", null);
                children.push(inArticle);
                this.superTotalCount++;
                inCount++;
              }
            }
            for(let id in responseData["OutCitations"]){
              outCount++;
            }

          }
          else{
            for(let id in responseData["OutCitations"]){
              if(this.superTotalCount <= this.maxTotalNodes){
                var outArticle = new Article(responseData['OutCitations'][id], null, null, null,null,null , null, null, null, "#D2B48C", null);
                children.push(outArticle);
                outCount++;
                this.superTotalCount++;
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
            console.log("This one i open for public")
          }

          var paperID = String(responseData['S2PaperID']);


          var title = String(responseData['Title']);
          var year = responseData["Year"];

          var type = "normal";
          if(title.toUpperCase().includes("RETRACTED:")){
            type = 'retracted';
          }


          let article = new Article(paperID, paperAbstract, authors, children, doi, isOpenAccess,
            isPublisherLicensed, title, Number(year), null,  type, inCount, outCount);

          return article;
        }
      ),

      catchError(errorRes => {
          // Send to analytics server
          return throwError('FEil');
        })
      );
  }

  root : Article = null;
  current : Article;
  title : string;
  value: boolean = false;
  count: number = 0;
  stopped : boolean = false;
  //nodes : Article;


  queue : Article[] = [];


  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(()=>resolve(), ms)).then();
  }


  async buildTree(type: string, rootId : string){
    this.value = false;
    this.current = null;
    this.stopped = false;
    this.count = 0;

    const sub = this.fetchNodes(rootId, 'S2PaperId', type).subscribe(node => {

      this.root = node;
      this.root.$type = 'root';
      this.root.$color = '#8B4513';
      this.value = true;
      this.countTotal++;
    });

    while(!this.value){
      await this.delay(10);
    }

    sub.unsubscribe();
    console.log('Started gathering information');
    this.BFSTreeBuilder(type, this.root);
  }

  child : Article = null;
  countTotal : number = 0;
  superTotalCount: number = 1;

  async BFSTreeBuilder(type: string, node: Article){
    let BFSQueue : Article[] =[];
    BFSQueue.push(node);
    let limitReached = false;

    while (BFSQueue.length > 0 && !this.stopped){
      if(limitReached) break;
      let currentNode : Article = BFSQueue.shift();
      this.queue.push(currentNode);
      if(this.nodes.includes(currentNode.$S2PaperID)){
        currentNode.$children = [];
        currentNode.$type = "exist";
        //console.log('Exists'+ currentNode.$S2PaperID);
      }else{
        this.nodes.push(currentNode.$S2PaperID);
      }


      currentNode = this.setColor(currentNode, type);
      for(let i=0; i < currentNode.$children.length; i++){
        this.value = false;
        const sub = this.fetchNodes(currentNode.$children[i].$S2PaperID, 'S2PaperId', type).subscribe(post => {

          if(!this.stopped)
          {
            if (this.countTotal >= this.maxTotalNodes + 1){
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
          }
        });

        while(!this.value){
          await this.delay(10);
        }
        sub.unsubscribe();

        if (limitReached){
          console.log(this.root);
          break;
        }
      }
    }
    console.log('Done');
  }
  nodes : string[] = [];
  setColor(node: Article, type : String){
    if(type == 'in'){
      if(node.$type == "retracted"){
        node.$color = "#FF0000";
        return node;
      }
      if(node.$type == "normal"){
        node.$color = "#5cb85c";
      }
      if(node.$isOpenAccess == true){
        node.$color = "#006400";
      }
      if(node.$isPublisherLicensed == true){
        node.$color = '#FFFF00'
      }
      if(node.$type == 'exist'){
        node.$color = "blue";
        return node;
      }
      if(node.$type == 'root') {
        node.$color = "#8B4513";
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
}
