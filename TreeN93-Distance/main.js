/*
SHOULD PUT A DESCRIPTION OF THE PROJECT HERE ...

assumptions:
  newick inputted file is formatted correctly
  all leaf nodes are exactly the same distance from the root

things to note:
  threshold cuttof is >=, not >
  if a cluster consists of a single leaf, no branch will be colored for that cluster
  threshold is distance from leaves, not distance from root
*/

/*
variables that may be used throughout
*/
var tree; //holds the phylotree
var reader; //FileReader object to read in the selected newick file
var maxDistance; //distance of leaves from root
var threshold = 1e-10; //cutoff distance from leaves
var clustersList = []; //list of root nodes of clusters
var clustersLeafsNamesList = []; //list of concatenated names of leaf nodes in each cluster
var clusterToColorDict = {0: "blue", 1: "purple", 2: "green", 3: "orange"}; //arbitrary colors for clusters
var guideTree; //same shape as tree, but different settings
var guideHeight = 400; //height of box holding guide tree
var guideWidth = 400; //width of box holding guide tree

/*
Divs on the html page
*/
var treeDisplayDiv = document.createElement("DIV");
document.body.appendChild(treeDisplayDiv);

var textDiv = document.createElement("DIV");
document.body.appendChild(textDiv);

var guideTreeDisplayDiv = document.createElement("DIV");
document.body.appendChild(guideTreeDisplayDiv);

var buttonsDiv = document.createElement("DIV");
document.body.appendChild(buttonsDiv);

/*
make the svg that the tree is displayed on
put it in the treeDisplayDiv
*/
var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.id = "tree_display";
treeDisplayDiv.appendChild(svg);
//svg.setAttribute("transform", "scale(-1,1)");

/*
make the svg that the guide tree is displayed on
put it in the guideTreeDisplayDiv
*/
var svg_guideTree = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg_guideTree.id = "tree_guide";
guideTreeDisplayDiv.appendChild(svg_guideTree);
//svg_guideTree.setAttribute("transform", "scale(-1,1)");

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
textDiv.style["height"] = "90px";
textDiv.style["top"] = "175px";
textDiv.style["left"] = "25px";
textDiv.style["border-style"] = "solid";
textDiv.style["border-color"] = "black";
textDiv.style["border-width"] = "1px";
textDiv.style["background"] = "white";
textDiv.style["padding"] = "5px";

/*
add some style to the buttonsDiv
*/
buttonsDiv.style["position"] = "fixed";
buttonsDiv.style["width"] = "300px";
buttonsDiv.style["height"] = "125px";
buttonsDiv.style["top"] = "25px";
buttonsDiv.style["left"] = "25px";
buttonsDiv.style["border-style"] = "solid";
buttonsDiv.style["border-color"] = "black";
buttonsDiv.style["border-width"] = "1px";
buttonsDiv.style["background"] = "white";
buttonsDiv.style["padding"] = "5px";

/*
make the button to select a nwk file
put it in the buttonsDiv
*/
var fileInputter = document.createElement("INPUT");
fileInputter.setAttribute("type", "file");
buttonsDiv.appendChild(fileInputter);
buttonsDiv.appendChild(document.createElement("BR"));

/*
make the text input to set the threshold value
add it to the buttonsDiv
and add onchange function
*/
var thresholdInput = document.createElement("INPUT");
thresholdInput.setAttribute("type", "text");
thresholdInput.setAttribute("placeholder", "Threshold value");
thresholdInput.setAttribute("size", 12);
buttonsDiv.appendChild(thresholdInput);
thresholdInput.onchange = function(){
  threshold = parseFloat(thresholdInput.value);
  if (threshold <= maxDistance && threshold > 0){
    thresholdSlider.value = threshold * 20000;
    clustersList = [];
    clustersLeafsNamesList = [];
    doEverythingTreeClusters();
    makeGuideTree();
  }
};

/*
make a slider to set the threshold value
*/
var thresholdSlider = document.createElement("INPUT");
thresholdSlider.setAttribute("class", "slider");
thresholdSlider.setAttribute("type", "range");
buttonsDiv.appendChild(thresholdSlider);

/*
make function for anytime threshold slider is moved
*/
thresholdSlider.oninput = function(){
  threshold = this.value * maxDistance / 1000;
  if (threshold > 0){
    clustersList = [];
    clustersLeafsNamesList = [];
    doEverythingTreeClusters();
    makeGuideTree();
  }
}

/*
add functionality to the fileInputter button
*/
fileInputter.addEventListener("change", onFileSelect);
function onFileSelect(e){
  var files = e.target.files;
  if (files.length == 1){
    var f = files[0];
    reader = new FileReader();
    reader.readAsText(f);
    reader.onload = function(e){
      tree = d3.layout.phylotree().svg(d3.select("#tree_display"));
      var line = d3.select("#tree_display")
        .append("line")
        .attr("x1", 100)
        .attr("y1", 0)
        .attr("x2", 100)
        .attr("y2", window.innerHeight)
        .style("stroke", "red")
        .style("stroke-width", 2);
      tree(d3.layout.newick_parser(reader.result)).layout();
      calcMaxDistance();
      doEverythingTreeClusters();
      makeGuideTree();
      thresholdSlider.setAttribute("min", "0");
      thresholdSlider.setAttribute("max", "1000");
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
  var line = d3.select("#tree_guide")
    .append("line")
    .attr("x1", ((maxDistance - threshold) / maxDistance) * guideWidth)
    .attr("y1", 0)
    .attr("x2", ((maxDistance - threshold) / maxDistance) * guideWidth)
    .attr("y2", 400)
    .style("stroke", "red")
    .style("stroke-width", 2);
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
  guideTree = guideTree.style_edges(edgeStylerReset);
  guideTree = guideTree.style_edges(edgeStyler);
  d3.layout.phylotree.trigger_refresh(guideTree);
}

/*
function that does all of the cluster calculations and displaying
called anytime the threshold distance is changed
*/
function doEverythingTreeClusters(){
  textDiv.innerHTML = "Root to leaf distance: " + maxDistance + "<br>";
  clustersList = [];
  getClusters(d3.layout.newick_parser(reader.result).json, 0.0, clustersList);
  textDiv.innerHTML += "Threshold: " + threshold;
  var csCounts = calcClustersSinglesCount();
  textDiv.innerHTML += "<br>Number of singletons: " + csCounts[1];
  textDiv.innerHTML += "<br>Number of clusters: " + csCounts[0];
  for (var i in clustersList){
    var nodesInCluster = getNodesBelow(clustersList[i]);
    clustersLeafsNamesList.push(nodeNameListToString(nodesInCluster));
  }
  tree = tree.style_edges(edgeStylerReset);
  d3.layout.phylotree.trigger_refresh(tree);
  tree = tree.style_edges(edgeStyler)
  tree = tree.style_nodes(nodeStyler)
  d3.layout.phylotree.trigger_refresh(tree);
}

/*
function to calculate the number of clusters and the number of singletons
assuming the clustersList is already filled
*/
function calcClustersSinglesCount(){
  var c = 0;
  var s = 0;
  for (var root of clustersList){
    if (root.children == null){
      s += 1;
    }
    else{
      c += 1;
    }
  }
  return [c, s];
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
  textDiv.innerHTML += "Distance of leaves from root: " + maxDistance + "<br>";
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
    if (dist + distanceAlready >= (maxDistance - threshold)){
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
another function to style the branches
resets all the branches to null
needs to be called after threshold is changed
*/
function edgeStylerReset(dom_element, edge_object){
  dom_element.style("stroke", null);
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
