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

  constructor( private http: HttpClient) {this.updateMaxValues()}
    startUri : string = "https://api.sciencegarden.org/api/article";


  /**
   * Returns a array of articles based on a search query by title
   */
  fetchArticles(title : string, page : number) {
  let searchParams = new HttpParams();
  searchParams = searchParams.append('bySearchEngine', 'no');   // Appends search params
  searchParams = searchParams.append('pageID', page.toString()); //PageID
  var uri = this.startUri+"/title/"+title;                      //Appends /title/ to URI

  return this.http //Request
    .get<{ [key: string]: Article }>(
      uri,
      {
        params: searchParams,
        responseType: 'json'
      }
    )
    .pipe(
      map(responseData => { //Pipe response and map
        if(responseData['error']){ // Check if there are no results, or other error
          return [new Article('-1')]; // return new Article with S2PaperId equal to "-1" as indicator;
        }
        const searchArray: Article[] = []; //Array for results
        for (var id in responseData) { // Loops through results
          if (responseData.hasOwnProperty('papers')) { // Check if response has papers
            for(var element in responseData[id]){
              var doi = "";
              if(responseData[id][element]['Doi'] != ''){ // Check if response has DOI
                  doi = responseData[id][element]['Doi']; // Add DOI
              }else{
                doi = "This paper has no DOI" // No DOI
              }
              //New Article with response data
              let article = new Article(responseData[id][element]['S2PaperID'], null , [], [], doi, false, false,
                responseData[id][element]['Title'], null);
              searchArray.push(article); //Add Article object to array
            }
          }
        }
        return searchArray; //Return results as array
      }),
      catchError(errorRes => {
        return throwError(errorRes);
      })
    );
  }

  /**
   * Gets a node from API with information based on a search query by S2PaperID or DOI. Similar to fetchPosts
   */
  fetchArticle(input: string, method: string, state: string) {
    var url : string = this.startUri+"/S2PaperID/"+input;
    let searchParams = new HttpParams().append('state', 'root');

    if(method == "doi"){
      url = this.startUri+"/DOI/"+input;
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

           return this.convertResponseToArticle(responseData, state); // Convert response to Article object

        }
      ),

      catchError(errorRes => {
          return throwError(errorRes);
        })
      );
  }

  /**
   *  Takes the response as responseData with state, and convert the response to an Article object
   */
  convertResponseToArticle(responseData : { [key: string]: Article }, state: string){
    var paperAbstract : string = String(responseData["PaperAbstract"]);
          var authors : string[] = []; // Keeps track of Authors
          for(let id in responseData["Authors"]){
              authors.push(responseData["Authors"][id]);
          }
          var children : Article[] = [];
          var inCount: number = 0;
          var outCount : number = 0;

          // If the graph is an in-citation graph, add in-citations to children array of type Article
          if(state == 'in'){

            for(let i = 0; i < Object.keys(responseData["InCitations"]).length; i++){
              if(this.totalCountTree < this.maxTotalNodes){
                if(i < this.maxNodesPerNode){// Only add to list if [i] is less than [maxNodesPerNode]
                  var inArticle = new Article(responseData['InCitations'][i], null, null, null,null,null , null, null, null, "#dae0e6", null);
                  children.push(inArticle);
                  this.totalCountTree++;
                }
                inCount++; // Keeps track of in-citation count to display later
              }
            }
            outCount = Object.keys(responseData["OutCitations"]).length; // Keeps track of out-citation count to display later


          }else{ // If the graph is an out-citation graph, add out-citations to children array of type Article
            for (let i = 0; i < Object.keys(responseData["OutCitations"]).length; i++) {
              if(this.totalCountTree < this.maxTotalNodes){
                if(i < this.maxNodesPerNode){ // only add to list if [i] is less than [maxNodesPerNode]
                  var outArticle = new Article(responseData['OutCitations'][i], null, null, null,null,null , null, null, null, "#dae0e6", null);
                  children.push(outArticle);
                  this.totalCountTree++;
                }
                outCount++; // Keeps track of out-citation count to display later
              }

            }
            inCount = Object.keys(responseData["InCitations"]).length; // Keeps track of in-citation count to display later

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
          //IsOpenAccess
          var isOpenAccess : boolean = false;
          if(String(responseData['IsOpenAccess']) === "true"){
            isOpenAccess = true;
          }

          // Publisher Licensed
          var isPublisherLicensed : boolean = false;
          if(String(responseData['IsPublisherLicensed']) === "true"){
            isPublisherLicensed = true;
          }

          var paperID = String(responseData['S2PaperID']); // PaperID
          var title = String(responseData['Title']); //Title
          var year = responseData["Year"]; // Tear
          var type = "none"; //Type, none -> no/false for all metrics

          // Checks if the title contains some of the keywords indicating that it has been retracted
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

    const sub = this.fetchArticle(rootId, 'S2PaperId', type).pipe(first()).subscribe(node => {
      this.root = node;
      if(this.root.$type != 'retracted'){
        this.root.$type = 'root';
      }
      this.value = true;
      this.countTotal++;
    });
    // Wait for response
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
        this.totalCountTree -= currentNode.$children.length;
        currentNode.$children = [];
        currentNode.$type = "exist";
      }else{
        this.nodes.push(currentNode.$S2PaperID);
      }

      currentNode = this.setColor(currentNode, type);
      for(let i=0; i < currentNode.$children.length; i++){ // Adds all children, with data, to the queue
        if (this.stopped){
          break;
        }
        this.value = false;
        const sub = this.fetchArticle(currentNode.$children[i].$S2PaperID, 'S2PaperId', type).pipe(first()).subscribe(post => { // get information from api

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
              console.log(this.countTotal);
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

  /*
   * A method that determines what color a node should be displayed as
   */
  setColor(node: Article, type : String){
    if(Number(localStorage.getItem('ColorBlind')) == 0){ // Checks if colorblind mode has been enabled. If 0, then not enabled.

      if(node.$type == "none"){ // no/false for all quality metrics
        node.$color = "#7d942a";
      }
      if(node.$isOpenAccess == true){ // is open access
        node.$color = "#51d63d";
      }
      if(node.$type == 'exist'){ // duplicate(s) within the graph
        node.$color = "#0000FF";
        return node;
      }
      if(node.$type == 'root') { // seed node
        node.$color = "#8B4513";
      }
      if(node.$type == "retracted"){ // retracted article
        node.$color = "#FF0000";
        return node;
      }
    }else{
      if(node.$type == "retracted"){
        node.$color = "#000099";
        return node;
      }
      if(node.$type == "none"){
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
      this.maxTotalNodes = 10000; // Default value
      this.maxNodesPerNode = 10000; // ----||----
    }
  }
}
