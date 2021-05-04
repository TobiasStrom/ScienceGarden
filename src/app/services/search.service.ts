import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,

} from '@angular/common/http';
import { map, catchError, first } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Article } from 'src/app/models/article.model';


@Injectable({ providedIn: 'root' })
export class SearchService{
  maxNodesPerNode : number = 1000;
  maxTotalNodes : number = 10000;
  root : Article = null;
  current : Article;
  title : string;
  value: boolean = false;
  stopped : boolean = false;
  done: boolean = false;
  queue : Article[] = [];
  child : Article = null;
  countTotal : number = 0;
  totalCountTree: number = 1;
  nodes : string[] = [];

  constructor( private http: HttpClient) { this.updateMaxValues()}
    startUrl : string = "https://api.sciencegarden.org/api/article";

    /**
     * Returns a list of articles based on a search query by title
     */
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
            return [new Article('-1')];
           }
          const searchArray: Article[] = [];
          for (var id in responseData) {
            if (responseData.hasOwnProperty('papers')) {
              for(var element in responseData[id]){
                var doi = "";
                if(responseData[id][element]['DOI'] != ''){
                    doi = responseData[id][element]['DOI'];
                }else{
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

  /**
   * Gets a node from API with information based on a search query by S2PaperID or DOI.
   */
  fetchNodes(input: string, method: string, state: string) {
    var url : string = this.startUrl+"/S2PaperID/"+input;
    let searchParams = new HttpParams().append('state', 'root');

    if(method == "doi"){
      url = this.startUrl+"/DOI/"+input;
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

          // If the tree is in-tree it fills the node with all the In-citations
          if(state == 'in'){

            for(let i = 0; i < Object.keys(responseData["InCitations"]).length; i++){
              if(this.totalCountTree < this.maxTotalNodes){
                if(i < this.maxNodesPerNode){// Only add to list if [i] is les than [maxNodesPerNode]
                  var inArticle = new Article(responseData['InCitations'][i], null, null, null,null,null , null, null, null, "#dae0e6", null);
                  children.push(inArticle);
                  this.totalCountTree++;
                }
                inCount++; // Keeps track of InCitation count to display later
              }
            }
            for(let id in responseData["OutCitations"]){
              outCount++; // Keeps track of outCitation count to display later
            }

          }else{ // If the tree is out-tree it fills the node with all the out-citations
            for (let i = 0; i < Object.keys(responseData["OutCitations"]).length; i++) {
              if(this.totalCountTree < this.maxTotalNodes){
                if(i < this.maxNodesPerNode){ // only add to list if [i] is les than [maxNodesPerNode]
                  var outArticle = new Article(responseData['OutCitations'][i], null, null, null,null,null , null, null, null, "#dae0e6", null);
                  children.push(outArticle);
                  this.totalCountTree++;
                }
                outCount++; // Keeps track of outCitation count to display later
              }

            }
            for(let id in responseData['InCitations']){
              inCount++;  // Keeps track of InCitation count to display later
            }

          }

          // Checks if DOI exists and either assigns it as the value, or assigns it as "This paper has no DOI"
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

          // Checks if the title contains some of the keywords indicating it has been retracted
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

          // Builds an article with the data received and returns it
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

  /**
   *  A delay function for utility purposes. Waits a given amount of seconds
   */
  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(()=>resolve(), ms));
  }

  /**
   * A method called when building a tree. Takes the input node and builds it gradually using BFSSTreeBuilder function
   */
  async buildTree(type: string, rootId : string){
    // resets default values
    this.value = false; // a variable used to recognise that subscription has finished
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
    // Wait for responce
    while(!this.value){
      await this.delay(10);
    }

    sub.unsubscribe();
    this.BFSTreeBuilder(type, this.root);
  }


  /**
   * A method for filling the root node with its citations and its data.
   *
   * Description:
   *  1. It uses a queue to fill in the citations for a layer.
   *  2. It checks if limits have been reached before proceeding
   *  3. A node from queue is popped, its children are received with data and added to the queue for future building
   *  4. If the queue is not empty, it moves for the next node in the queue
   *
   * Stop cases:
   *  1. The tree is finished building
   *  2. The tree has reached a limit set in settings
   *  3. User input has stopped the building
   */
  async BFSTreeBuilder(type: string, node: Article){
     this.updateMaxValues(); // Updates max values set from settings

    // Queue is created and root node added
    let BFSQueue : Article[] =[];
    BFSQueue.push(node);

    // Default values
    let limitReached = false;
    this.nodes = []; // A list of total nodes in the tree
    this.done = false;

    while (BFSQueue.length > 0 && !this.stopped){ // [this.stopped] is a variable determining if the tree building has been cancelled by user input
      if(limitReached) break;
      let currentNode : Article = BFSQueue.shift();
      this.queue.push(currentNode);
      if(this.nodes.includes(currentNode.$S2PaperID)){ // if it includes s2paperId then it exists in Semantic database and has data
        currentNode.$children = [];
        currentNode.$type = "exist";
      }else{
        this.nodes.push(currentNode.$S2PaperID);
      }

      currentNode = this.setColor(currentNode, type);
      for(let i=0; i < currentNode.$children.length; i++){ // Adds all children with data into the database
        if (this.stopped){
          break;
        }
        this.value = false;
        const sub = this.fetchNodes(currentNode.$children[i].$S2PaperID, 'S2PaperId', type).pipe(first()).subscribe(post => { // get information from api

          if(!this.stopped){
            if (this.countTotal >= this.maxTotalNodes){ // Checks if limits have been reached
              limitReached = true;
              this.value = true;
            }else{
              currentNode.$children[i] = post;
              this.child = post;
              currentNode.$children[i] = this.setColor(currentNode.$children[i], type);

              BFSQueue.push(post);
              this.value = true;
              this.countTotal++;
            }
          }
        });

        while(!this.value && !this.stopped){ // wait for response
          await this.delay(10);
        }
        sub.unsubscribe();

        if (limitReached){ // Checks if limits have been reached
          break;
        }
      }
      if (this.stopped || this.done){ // Exit conditions
        break;
      }
    }
    this.done = true;
  }

  /**
   * A method that determines what color a node should be displayed as
   */
  setColor(node: Article, type : String){
    if(Number(localStorage.getItem('ColorBlind')) == 0){ // Checks if colorblind mode has been enabled. If 0, then not enabled.

      if(node.$type == "normal"){
        node.$color = "#7d942a";
      }
      if(node.$isOpenAccess == true){
        node.$color = "#51d63d";
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
    }else{
      if(node.$type == "retracted"){
        node.$color = "#000099";
        return node;
      }
      if(node.$type == "normal"){
        node.$color = "#FFD89D";
      }
      if(node.$isOpenAccess == true){
        node.$color = "#8B6900";
      }
      if(node.$type == 'exist'){
        node.$color = "#86c1ff";
        return node;
      }
      if(node.$type == 'root') {
        node.$color = "#8B4513";
      }
    }
    return node;
  }

  /**
   * A method that retrieves the max-values set in settings
   */
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
