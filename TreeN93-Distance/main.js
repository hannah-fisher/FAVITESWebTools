/*
SHOULD PUT A DESCRIPTION OF THE PROJECT HERE ...

assumptions:
  newick inputted file is formatted correctly
  all leaf nodes are exactly the same distance from the root

things to note:
  threshold cuttof is >, not >=
  if a cluster consists of a single leaf, no branch will be colored for that cluster
  if threshold > maxDistance, problems occur

PROBLEM - SCROLL GUIDE THING
  it uses the height of the entire page (from scroll bar range)
  but, should only be height of the tree svg
  problem is also for width
*/

/*
variables that may be used throughout
*/
var tree; //holds the phylotree
var reader; //FileReader object to read in the selected newick file
var maxDistance; //distance of leaves from root
var threshold = 0.035; //cutoff distance from root
var clustersList; //list of root nodes of clusters
var clustersLeafsNamesList = []; //list of concatenated names of leaf nodes in each cluster
var clusterToColorDict = {0: "blue", 1: "purple", 2: "green", 3: "orange"}; //arbitrary colors for clusters
var guideTree;
var guideHeight = 400;
var guideWidth = 400;

/*
Divs on the html page
*/
var selectFileDiv = document.createElement("DIV");
document.body.appendChild(selectFileDiv);

var treeDisplayDiv = document.createElement("DIV");
document.body.appendChild(treeDisplayDiv);

var textDiv = document.createElement("DIV");
document.body.appendChild(textDiv);

var guideTreeDisplayDiv = document.createElement("DIV");
document.body.appendChild(guideTreeDisplayDiv);

/*
make the svg that the tree is displayed on
put it in the treeDisplayDiv
*/
var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.id = "tree_display";
treeDisplayDiv.appendChild(svg);

/*
make the svg that the guide tree is displayed on
put it in the guideTreeDisplayDiv
*/
var svg_guideTree = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg_guideTree.id = "tree_guide";
guideTreeDisplayDiv.appendChild(svg_guideTree);

/*
add some style to the guideTreeDisplayDiv
*/
guideTreeDisplayDiv.style["position"] = "fixed";
guideTreeDisplayDiv.style["top"] = "25px";
guideTreeDisplayDiv.style["right"] = "25px";
guideTreeDisplayDiv.style["border-style"] = "solid";
guideTreeDisplayDiv.style["border-color"] = "black";
guideTreeDisplayDiv.style["border-width"] = "1px";
guideTreeDisplayDiv.style["background"] = "white";
guideTreeDisplayDiv.style["width"] = guideWidth + "px";
guideTreeDisplayDiv.style["height"] = guideHeight + "px";

/*
add some style to the textDiv
*/
textDiv.style["position"] = "fixed";
textDiv.style["width"] = "300px";
textDiv.style["height"] = "200px";
textDiv.style["top"] = "25px";
textDiv.style["right"] = "475px";
textDiv.style["border-style"] = "solid";
textDiv.style["border-color"] = "black";
textDiv.style["border-width"] = "1px";
textDiv.style["background"] = "white";

/*
make the button to select a nwk file
put it in the selectFileDiv
*/
selectFileDiv.appendChild(document.createElement("BR"));
var fileInputter = document.createElement("INPUT");
fileInputter.setAttribute("type", "file");
selectFileDiv.appendChild(fileInputter);
selectFileDiv.appendChild(document.createElement("BR"));

/*
add functionality to the fileInputter button
*/
fileInputter.addEventListener("change", onFileSelect);
function onFileSelect(e){
  textDiv.innerHTML = "<br>";
  var files = e.target.files;
  if (files.length == 1){
    var f = files[0];
    textDiv.innerHTML += "Found file: " + f.name + "<br>";
    reader = new FileReader();
    reader.readAsText(f);
    reader.onload = function(e){
      tree = d3.layout.phylotree().svg(d3.select("#tree_display"));
      tree(d3.layout.newick_parser(reader.result)).layout();
      textDiv.innerHTML += "Finished loading file and displaying tree";
      calcMaxDistance();
      doEverythingTreeClusters();
      makeGuideTree();
    }
  }
}

/*
function to make and display the guide tree
guide tree is displayed in the svg_guideTree which has id tree_guide
this is in the div guideTreeDisplayDiv
*/
function makeGuideTree(){
  guideTree = d3.layout.phylotree()
    .svg(d3.select("#tree_guide"))
    .options({
      'left-right-spacing': 'fit-to-size',
      'top-bottom-spacing': 'fit-to-size',
      'collapsible': false,
      'transitions': false,
      'show-scale': false,
      'brush': false,
      'selectable': false
    })
    .size([guideHeight, guideWidth])
    .node_circle_size(0);
  guideTree(d3.layout.newick_parser(reader.result)).layout();
  var x = d3.scale.linear()
    .domain([0, document.body.scrollWidth])
    .range([0, guideWidth]);
  var y = d3.scale.linear()
    .domain([0, document.body.scrollHeight])
    .range([0, guideHeight]);
  var rect = d3.select("#tree_guide")
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .style('opacity', .6)
    .attr('width', x(window.innerWidth))
    .attr('height', y(window.innerHeight));
  document.body.onscroll = function(e){
    rect.attr("x", x(window.scrollX))
      .attr("y", y(window.scrollY));
  };
  d3.select("#tree_guide").on("click", function(){
    var coords = d3.mouse(this),
      new_x = x.invert(coords[0]) - window.innerWidth/2,
      new_y = y.invert(coords[1]) - window.innerHeight/2;
    window.scrollTo(new_x, new_y);
  })
  tree.selection_callback(function(selected){
    guide_tree.sync_edge_labels();
  })
  guideTree = guideTree.style_edges(edgeStyler);
  d3.layout.phylotree.trigger_refresh(guideTree);
}

/*
function that does all of the cluster calculations and displaying
called anytime the threshold distance is changed
*/
function doEverythingTreeClusters(){
  clustersList = [];
  getClusters(d3.layout.newick_parser(reader.result).json, 0.0, clustersList);
  textDiv.innerHTML += "Threshold: " + threshold;
  textDiv.innerHTML += "<br>Number of clusters: " + clustersList.length + "<br>";
  for (var i in clustersList){
    var nodesInCluster = getNodesBelow(clustersList[i]);
    //textDiv.innerHTML += "Cluster " + i + ": " + nodesInCluster + "<br>";
    clustersLeafsNamesList.push(nodeNameListToString(nodesInCluster));
  }
  tree = tree.style_edges(edgeStyler)
  tree = tree.style_nodes(nodeStyler)
  d3.layout.phylotree.trigger_refresh(tree);
}

/*
function to calculate the distance of the leaf nodes from the root
*/
function calcMaxDistance(){
  var json_and_error = d3.layout.newick_parser(reader.result);
  var json = json_and_error.json
  var d = 0;
  var children = json.children;
  while (children != null){
    var c = children[0];
    d += parseFloat(c.attribute);
    children = c.children;
  }
  maxDistance = d;
  textDiv.innerHTML += "<br>Distance of leaves from root: " + maxDistance + "<br>";
}

/*
function to display the tree sort of
*/
function showTree(){
  for (var n of tree.get_nodes()){
    textDiv.innerHTML += "<br>" + n.name + "__" + n.attribute + "__" + n.children;
  }
}

/*
function to get the clusters using the threshold value
uses recursion
the root of each cluster is appended to the clustersList
*/
function getClusters(root, distanceAlready, clustersList){
  for (var child of root.children){
    var dist = parseFloat(child.attribute);
    if (dist + distanceAlready > threshold){
      clustersList.push(child);
    }
    else{
      getClusters(child, distanceAlready + dist, clustersList);
    }
  }
}

/*
function to get the name of all the leaf nodes in a given tree
really, given the root node
this works on both json style nodes and original nodes ... ?
  ^ totally not sure if that statement is true, but I sure hope it is
*/
function getNodesBelow(root){
  var nodeList = [];
  getNodesBelowHelper(root, nodeList);
  return nodeList;
}

/*
helper function for getNodesBelow function
uses recursion
*/
function getNodesBelowHelper(root, nodeList){
  if (root.children == undefined){
    nodeList.push(root.name);
  }
  else{
    for (var child of root.children){
      getNodesBelowHelper(child, nodeList);
    }
  }
}

/*
function to style the branches
*/
function edgeStyler(dom_element, edge_object){
  var thisS = nodeNameListToString(getNodesBelow(edge_object.source));
  for (var i in clustersLeafsNamesList){
    var s = clustersLeafsNamesList[i];
    if (s.includes(thisS)){
      dom_element.style("stroke", clusterToColorDict[i % 4]);
    }
  }
}

/*
function to turn a list of node names into a single string
*/
function nodeNameListToString(nodeNameList){
  var s = "";
  for (var n of nodeNameList){
    s += n;
  }
  return s;
}


/*
function to style the nodes
*/
function nodeStyler(dom_element, node_object){
  //CURRENTLY DOES NOTHING - SHOULD CHANGE THAT
}
