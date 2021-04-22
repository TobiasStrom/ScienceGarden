import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { FunctionalityService } from '../services/functionality-service';
import { SearchService } from '../services/search.service';
import { HostListener } from "@angular/core";
import { tree } from 'd3';
import { Article } from '../models/article.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-tree-graph',
  templateUrl: './tree-graph.component.html',
  styleUrls: ['./tree-graph.component.scss']
})
export class TreeGraphComponent implements OnInit, OnDestroy {

  d3: d3.TreeLayout<any>;
  duration: number = 0;
  i: number = 0;
  linkColor  = "#654321";
  linkWidth: string = '20px';
  nodeSize : number = 120;
  map: any;
  screenHeight: number;
  screenWidth: number;
  graphWidth : number;
  graphHeight : number;
  totalNodeCount: number;
  widthScreen : number;
  in : boolean = true;
  paperId: string;
  showGraph : boolean = false;
  clickedArticle : Article;
  articleClicked : boolean;
  firstLoad : boolean = true;
  stopValue : boolean= false;
  countTotalLoaded : number = 0;
  countTotalUnloaded : number = 0;
  countTotalLoadedOnScreen: number = 0;
  countTotalUnloadedOnScreen: number = 0;

  countLoadedSinceLast: number = 0;
  done: boolean = false;

  constructor(
    private functionalityService: FunctionalityService,
    private searchService: SearchService,
    private route : ActivatedRoute,
    private router : Router,

  ) {
    this.getScreenSize();
    setInterval(()=> {
      this.countTotalLoaded = this.searchService.countTotal;
      this.countTotalUnloaded = this.searchService.superTotalCount;
      this.countLoadedSinceLast = this.countTotalLoaded - this.countTotalLoadedOnScreen;
      this.done = this.searchService.done;
    }, 1 * 1000);

  }
  //selectedArticle : Article = this.searchService.selectedArticle;

  @HostListener('window:resize', ['$event'])
    getScreenSize(event?) {
          this.screenHeight = window.innerHeight;
          this.screenWidth = window.innerWidth;

    }

  onBuildTree() {
    this.countTotalLoadedOnScreen = this.countTotalLoaded;
    this.countTotalUnloadedOnScreen = this.countTotalUnloaded;
    console.log(this.searchService.root);
    this.countTotalUnloaded = this.searchService.countTotal;
    var obj = d3.hierarchy(this.searchService.root);
    var count = obj.count();
    if (this.pressed && count.value > 0) {
      d3.select("svg").remove();
      var obj = d3.hierarchy(this.searchService.root);
      var count = obj.count();
      console.log("Number of leaves: ", count.value)
      this.widthScreen = count.value * 275;
      if(this.widthScreen < 12000){
        this.widthScreen = 12000;
      }
      let draw = (source) => {
        let margin = { top: 20, right: 500, bottom: 20, left: 20 };
        let width = this.widthScreen- margin.left - margin.right + 400;
        let height = 500 - margin.top - margin.bottom;
        let treemap = d3.tree<Article>().nodeSize([width/count.value, height/1000]);
        root = root.sort((a,b) => {return +a.$year - b.$year});
        let treeData = treemap(root);//.sort((a,b) => { return +a.$year- +b.$year});
        let nodes = treeData.descendants();
        let links = treeData.descendants().slice(1);
        let max;
        if(this.in){
          max = -5000;
        }
        else{
          max = 5000;
        }

        nodes.forEach((d) => {
          if(this.in){
            if(this.widthScreen * 0.4 > 5000){
              max =  -this.widthScreen * 0.4;  //-(count * 10 * 0.4);
            }
          }else{
            if(this.widthScreen * 0.4 > 5000){
              max =  this.widthScreen * 0.4;  //-(count * 10 * 0.4);
            }
          }

          switch(d.depth){
            case 0 : {
              d.y = max * 0;
              break;
            }
            case 1 : {
              d.y = max * 0.3;
              break;
            }
            case 2 : {
              d.y = max * 0.55;
              break;
            }
            case 3 : {
              d.y = max* 0.75;
              break;

            }
            case 4 : {
              d.y = max*0.95;
              break;
            }
            default :{
              d.y = max * 0.95 + ( (d.depth - 4 ) * (max*0.10));
            }
          }

        });

        let node = g
          .selectAll('g.node')
          .data(nodes, (d) => d['id'] || (d['id'] = ++this.i));

        let nodeEnter = node
          .enter()
          .append('g')
          .attr('class', 'node')
          .attr('style', 'cursor: pointer')
          .attr(
            'transform',
            (d) => 'translate(' + source.x0 + ',' + source.y0 + ')'
          )
          .on('click', (d) => {
            this.clickedArticle = this.functionalityService.click(d).data;
            draw(this.clickedArticle);
            this.articleClicked = true;
            this.updateColorDescription();
          });

        nodeEnter
          .append('circle')
          .attr('class', 'node')
          //.attr("stroke", "black")
          .attr('stroke-width', '1.5px')
          .attr('fill', (d) => (d['_children'] ? 'bluelightsteelblue' : '#fff'))
          .attr('r', 1e-6);

        nodeEnter
          .append('text')
          .attr('dy', '.35em')
          .attr('style', 'font: 80px sans-serif')
          .attr('x', (d) => (+150))
          .attr('y', (d) => (-200))
          .attr('transform', (d) =>
          'rotate(330)')
          .attr('text-anchor', (d) =>'end'
          //d.children || d['_children'] ? 'end' : 'start'
          )
          .text((d) => /*d.data['type'] + ' ' +*/ d.data['year']);

        let nodeUpdate = nodeEnter.merge(<any>node);

        nodeUpdate
          .transition()
          .duration(this.duration)
          .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');

          nodeUpdate
          .select('circle')
          .attr('r', (d) => (d['data']['isOpenAccess'] ? this.nodeSize : this.nodeSize)) // set radius of node
          .attr('fill', (d) =>
            d['_children'] ? 'lightsteelblue' : d['data']['color']
          )
          .attr('cursor', 'pointer');


        let nodeExit = node
          .exit()
          .transition()
          .duration(this.duration)
          .attr(
            'transform',
            (d) => 'translate(' + source.x + ',' + source.y + ')'
          )
          .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle').attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text').style('fill-opacity', 1e-6);

        // Let's draw links
        let link = g.selectAll('path.link').data(links, (d) => d['id']);

        // Work on enter links, draw straight lines

        let linkEnter = link
          .enter()
          .insert('path', 'g')
          .attr('class', 'link')
          .attr('fill', 'none')
          .attr('stroke', this.linkColor)
          .attr('stroke-width', this.linkWidth)
          .attr('d', () => {
            let o = { x: source.x0, y: source.y0 };
            return diagonal(o, o);
          });

        // UPDATE
        let linkUpdate = linkEnter.merge(<any>link);
        // Transition back to the parent element position, now draw a link from node to it's parent
        linkUpdate
          .transition()
          .duration(this.duration)
          .attr('d', (d) => diagonal(d, d.parent));

        // Remove any exiting links
        let linkExit = link
          .exit()
          .transition()
          .duration(this.duration)
          .attr('d', (d) => {
            let o = { x: source.x, y: source.y };
            return diagonal(o, o);
          })
          .remove();

        // Store the old positions for transition.
        nodes.forEach(function (d) {
          d['x0'] = d.x;
          d['y0'] = d.y;
        });
      };

      //Curved lines
      let diagonal = (s, d) => {
        const path =
          'M' +
          d.x +
          ',' +
          d.y +
          'C' +
          d.x +
          ',' +
          (d.y + s.y) / 2 +
          ' ' +
          s.x +
          ',' +
          (d.y + s.y) / 2 +
          ' ' +
          s.x +
          ',' +
          s.y;
        return path;
      };

      let margin = { top: 30, right: 200, bottom: 500, left: 200 };
      let width = this.screenWidth -margin.left - margin.right;  //2500 - margin.left - margin.right + 400;
      let height = this.screenHeight - margin.top - margin.bottom;


      //The following three variables determine the initial postion and scale of the graph
      let translateX = width/2;
      let translateY = height;
      let scale = (width/500)/count.value;


      let transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

      this.graphWidth = this.screenWidth;

      if(this.screenWidth > 992){
        this.graphWidth = this.graphWidth * 0.693
      }
      else{
        this.graphWidth = this.graphWidth * 0.95


      //this.firstLoad = false;
      }
      let zoom = d3.zoom().on('zoom', function () {
        svg.attr('transform', d3.event.transform);
      })
      let svg = d3
        .select('#container')
        .append('svg')
        .attr('width', this.graphWidth)//width + margin.right + margin.left)
        .attr('height', this.screenHeight * 0.94) //height + margin.top + margin.bottom)
        .call(d3.zoom().transform, transform)
        .call(zoom)
        .append('g')
        .attr("transform","translate(" + translateX + "," + translateY + ") scale(" + scale + "," + scale + ")");

      let g = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      let root;
      root = this.searchService.root;
      root = d3.hierarchy(root);
      root.x0 = this.graphWidth/ 2;
      root.y0 = 0;

      draw(root);
      console.log('done building');
    }
  }

   ngOnInit() {
    this.articleClicked = false;
    window.scroll(0,0);
    this.getScreenSize();
    this.onFetchArticle();
    this.route.queryParams.subscribe( params => {
      var type = params['state'];
      this.paperId = params['paperId'];
      //done = true;
    });

  }



  ngOnDestroy() {
    console.log('Den skal nå stoppes')
    this.resetVariables();
  }
  pressed: boolean = false;


  getTotalNodes(){


  }


  onFetchArticle() {
    var type;
    var searchIn;
    //var done = false;
    this.route.queryParams.subscribe( params => {
      type = params['state'];
      this.paperId = params['paperId'];
      //done = true;
    })
    if(type == 'in'){
      this.in = true;
    }
    else{
      this.in = false;
    }

    //while(!done);

    this.searchService.buildTree(
      type, this.paperId
      //'6e1013b0e858e322217a923caed3cc66aa615d08' //Super high at 50
      //'f617e842e6b5f06a49aa0299812df889dc308d5c' // Round 80 nodes
      //'516ec6346b0c0555663e3a74d3db40bd2c8fcf38' //This have a node that is retracted
      //'4a28ca8a14021c83d554852fdc6642b9a41e839e' //Retracted
      //'e6fadc508584b0a70cbd0f8b8ceb63071aeaa8b8' //
      //'e49b19ea3a134f83d5498d32ec904ae67ab760bb' // THIS FAILS
    );
    this.pressed = true;
    this.showGraph = true;
  }

  stop() {
    this.searchService.stopped = true
    this.stopValue = true;
  }


  /*
   *  Function that redraws a graph for a selected node
   *  Required variables below
  */
  buttonInDisable = false;
  buttonOutDisable = false

  onRedraw(state: string) {
    //cleanup
    console.log('Den skal nå stoppes');
    stop();

    let newRootArticle = this.clickedArticle;
    this.resetVariables();
    state != "in" ? this.in = false : this.in = true;
    //this.router.navigate(['/search'], { queryParams : { 'type': state, 'search': newRootArticle.$S2PaperID }});
    this.router.navigate(['tree'], {
      queryParams: {
        paperId: newRootArticle.$S2PaperID,
        state: state,
      },
    } );
    this.searchService.buildTree(state, newRootArticle.$S2PaperID);
  }


  resetVariables() {
    console.log('Reset');
    this.searchService.stopped = true;
    this.searchService.countTotal = 0;
    this.searchService.superTotalCount = 1;
    this.searchService.root = this.clickedArticle;
    this.articleClicked = false;
    this.clickedArticle = null;
    this.searchService.queue = [];
    this.searchService.child = null;
    this.stopValue = false;
    this.countTotalLoadedOnScreen = 0;
    this.countTotalLoaded = 0;
    this.countTotalUnloaded = 0;
    this.countLoadedSinceLast = 0;
  }

  clickedArticleColorDescription : string = "";
  updateColorDescription(){
    let type = this.clickedArticle.$type;
    if(type == "normal"){
      this.clickedArticleColorDescription = "This article is not open access or publisher licensed";
    }
    if(this.clickedArticle.$isOpenAccess){
      this.clickedArticleColorDescription = "This article is open access";
    }
    if (this.clickedArticle.$isPublisherLicensed){
      this.clickedArticleColorDescription = "This article is publisher licensed";
    }
    if(this.clickedArticle.$isPublisherLicensed && this.clickedArticle.$isOpenAccess){
      this.clickedArticleColorDescription = "This article is publisher licensed and open access.";
    }
    if(type == "retracted"){
      this.clickedArticleColorDescription = "This article has been retracted";
    }
    if(type == "exist"){
      this.clickedArticleColorDescription = "This article has duplicates that are present in the graph"
    }
    if(type == "root"){
      this.clickedArticleColorDescription = "This article is the seed node of the graph"
    }
    if(this.clickedArticle.$title == null){
      this.clickedArticleColorDescription = "This article has not finished loading"
    }
  }
}

//se om man kan sortere nodene etter år
//Trym vil helst ikke ha animasjon DONE
