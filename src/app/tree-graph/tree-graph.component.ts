import { Component, OnDestroy, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { SearchService } from '../services/search.service';
import { HostListener } from "@angular/core";
import { Article } from '../models/article.model';
import { ActivatedRoute, Router } from '@angular/router';


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
  clickedArticleColorDescription : string = "";
  pressed: boolean = false;

  constructor(
    private searchService: SearchService,
    private route : ActivatedRoute,
    private router : Router,

  ) {
    this.getScreenSize();
    setInterval(()=> {
      this.countTotalLoaded = this.searchService.countTotal;
      this.countTotalUnloaded = this.searchService.totalCountTree;
      this.countLoadedSinceLast = this.countTotalLoaded - this.countTotalLoadedOnScreen;
      this.done = this.searchService.done;
    }, 1 * 1000);
  }

  /**
   * To get the screen size of the device
   */
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;
  }

  /**
   * Builds the tree from data set in search service
   * Uses d3 magic with some variables for sizing and customisation
   */
  onBuildTree() {
    this.countTotalLoadedOnScreen = this.countTotalLoaded;
    this.countTotalUnloadedOnScreen = this.countTotalUnloaded;

    this.countTotalUnloaded = this.searchService.countTotal;
    var obj = d3.hierarchy(this.searchService.root);
    var count = obj.count();
    if (this.pressed && count.value > 0) {
      d3.select("svg").remove();
      var obj = d3.hierarchy(this.searchService.root);
      var count = obj.count();

      this.widthScreen = count.value * 275;

      if(this.widthScreen < 12000){
        this.widthScreen = 12000;
      }

      let draw = (source) => {
        let margin = { top: 20, right: 500, bottom: 20, left: 20 };
        let width = this.widthScreen - margin.left - margin.right + 400;
        let height = 500 - margin.top - margin.bottom;
        let treemap = d3.tree<Article>().nodeSize([width/count.value, 0.5]);
        root = root.sort((a,b) => {return +a.$year - b.$year});
        let treeData = treemap(root);
        let nodes = treeData.descendants();
        let links = treeData.descendants().slice(1);
        let max;
        if(this.in){
          max = -5000;
        }
        else{
          max = 5000;
        }
        // To sett different length of edjes
        nodes.forEach((d) => {
          if(this.in){
            if(this.widthScreen * 0.4 > 5000){
              max =  -this.widthScreen * 0.4;
            }
          }else{
            if(this.widthScreen * 0.4 > 5000){
              max =  this.widthScreen * 0.4;
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
            this.clickedArticle = d.data;
            draw(this.clickedArticle);
            this.articleClicked = true;
            this.updateColorDescription();
          });

        nodeEnter
          .append('circle')
          .attr('class', 'node')
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
          )
          .text((d) =>  d.data['year']);

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

      let ratio = 0.82;
      let height = this.screenHeight * 0.82 - 500;
      this.graphWidth = this.screenWidth * 0.693

      if(this.screenWidth <= 992){
        ratio = 0.60;
        this.graphWidth = this.screenWidth * 0.9665;
        height = this.screenHeight * 0.82 - 300;
      }

      let margin = { top: 30, right: 200, bottom: 500, left: 200 };
      let width = this.graphWidth;

      //The following three variables determine the initial postion and scale of the graph
      let translateX = width/2;
      let translateY = height;
      let scale = (width/500)/count.value;

      let transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

      let zoom = d3.zoom().on('zoom', function () {
        svg.attr('transform', d3.event.transform);
      })
      let svg = d3
        .select('#container')
        .append('svg')
        .attr('width', this.graphWidth)
        .attr('height', this.screenHeight * ratio)
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
      root.x0 = 0;
      root.y0 =  0;

      draw(root);
    }
  }

  /**
   * sets default values and initial position for the window
   */
   ngOnInit() {
    this.articleClicked = false;
    window.scroll(0,0);
    this.getScreenSize();
    this.onFetchArticle();
    this.route.queryParams.subscribe( params => {
      var type = params['state'];
      this.paperId = params['paperId'];
    });
  }

  /**
   * Cleans up the workspace and stops building of the tree graph
   */
  ngOnDestroy() {
    this.resetVariables();
    this.stop();
  }

  /**
   * Gets article information based from search parameters and builds the tree
   */
  onFetchArticle() {
    var type;

    this.route.queryParams.subscribe( params => {
      type = params['state'];
      this.paperId = params['paperId'];
    })
    if(type == 'in'){
      this.in = true;
    }
    else{
      this.in = false;
    }

    this.searchService.buildTree(type, this.paperId);
    this.pressed = true;
    this.showGraph = true;
  }

  /**
   * Stops the building of the tree
   */
  stop() {
    this.searchService.stopped = true;
  }

  /*
   *  Function that redraws a graph for a selected node
   *  Required variables below
  */
  async onRedraw(state: string) {
    this.stop(); // Stops the building of the previous tree
    await this.searchService.delay(1000); // Waits to ensure that the building has stopped
    let newRootArticle = this.clickedArticle;
    this.resetVariables();
    state != "in" ? this.in = false : this.in = true;
    this.router.navigate(['tree'], {
      queryParams: {
        paperId: newRootArticle.$S2PaperID,
        state: state,
      },
    } );
    this.searchService.buildTree(state, newRootArticle.$S2PaperID);
  }

  /**
   * Resets all variables used for building a tree
   */
  resetVariables() {
    this.searchService.stopped = true;
    this.searchService.countTotal = 0;
    this.searchService.totalCountTree = 1;
    this.searchService.root = this.clickedArticle;
    this.articleClicked = false;
    this.clickedArticle = null;
    this.searchService.queue = [];
    this.searchService.child = null;
    this.countTotalLoadedOnScreen = 0;
    this.countTotalLoaded = 0;
    this.countTotalUnloaded = 0;
    this.countLoadedSinceLast = 0;
  }
  /**
   * Set the right color description
   */
  updateColorDescription(){
    let type = this.clickedArticle.$type;
    if(type == "normal"){
      this.clickedArticleColorDescription = "This article is not open access";
    }
    if(this.clickedArticle.$isOpenAccess){
      this.clickedArticleColorDescription = "This article is open access";
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
