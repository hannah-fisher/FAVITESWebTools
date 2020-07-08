/*
SHOULD PUT A DESCRIPTION OF THE PROJECT HERE ...

assumptions:
  newick inputted file is formatted correctly
  all leaf nodes are exactly the same distance from the root

things to note:
  threshold cuttof is >, not >=
  if a cluster consists of a single leaf, no branch will be colored for that cluster
*/

/*
variables that may be used throughout
*/
var tree;
var reader;
var maxDistance; //distance of leaves from root
var threshold = 0.35; //cutoff distance from root
var clustersList; //list of root nodes of clusters
var clustersLeafsNamesList = []; //list of concatenated names of leaf nodes in each cluster
var clusterToColorDict = {0: "blue", 1: "purple", 2: "green", 3: "orange"}; //arbitrary, should be temporary

/*
Divs on the html page
*/
var selectFileDiv = document.createElement("DIV");
document.body.appendChild(selectFileDiv);

var treeDisplayDiv = document.createElement("DIV");
document.body.appendChild(treeDisplayDiv);

var textDiv = document.createElement("DIV");
document.body.appendChild(textDiv);

/*
make the svg that the tree is displayed on
put it in the treeDisplayDiv
*/
var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.id = "tree_display";
treeDisplayDiv.appendChild(svg);

/*
make the button to select a nwk file
put it in the selectFileDiv
*/
var fileInputter = document.createElement("INPUT");
fileInputter.setAttribute("type", "file");
selectFileDiv.appendChild(fileInputter);

/*
add functionality to the fileInputter button
*/
fileInputter.addEventListener("change", onFileSelect);
function onFileSelect(e){
  textDiv.innerHTML = "";
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
      //showTree();
      clustersList = [];
      getClusters(d3.layout.newick_parser(reader.result).json, 0.0, clustersList);
      textDiv.innerHTML += "Threshold: " + threshold;
      textDiv.innerHTML += "<br>Number of clusters: " + clustersList.length + "<br>";
      for (var i in clustersList){
        var nodesInCluster = getNodesBelow(clustersList[i]);
        textDiv.innerHTML += "Cluster " + i + ": " + nodesInCluster + "<br>";
        clustersLeafsNamesList.push(nodeNameListToString(nodesInCluster));
      }
      tree = tree.style_edges(edgeStyler)
      tree = tree.style_nodes(nodeStyler)
      textDiv.innerHTML += "<br>Styled<br>";

    }
  }
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
function nodeStyler(){
  //CURRENTLY DOES NOTHING - SHOULD CHANGE THAT
}

/*
how to - color coding branches and nodes by clusters

var clustering = {}; is a dictionary mapping node names to clusters
var coloring_scheme = d3.scale.category10(); default scheme to color by date

function edgeStyler(dom_element, edge_object) {
  dom_element.style("stroke", "cluster" in edge_object.target ? coloring_scheme(edge_object.target.cluster) : null);
}

function nodeStyler(dom_element, node_object) {
  if ("bootstrap" in node_object && node_object.bootstrap) {
    var label = dom_element.selectAll(".bootstrap");
    if (label.empty()) {
      dom_element.append("text").classed("bootstrap", true).text(node_object.bootstrap).attr("dx", ".3em").attr("text-anchor", "start").attr("alignment-baseline", "middle");
    }
  }
}




*/
