/*
SHOULD PUT A DESCRIPTION OF THE PROJECT HERE ...

assumptions:
  newick inputted file is formatted correctly
  all leaf nodes are exactly the same distance from the root
*/

/*
variables that may be used throughout
*/
var tree;
var reader;
var maxDistance; //distance of leaves from root
var threshold = 0.35; //cutoff distance from leaves

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
      var clustersList = [];
      getClusters(d3.layout.newick_parser(reader.result).json, 0.0, clustersList);
      textDiv.innerHTML += "<br>test<br>";
      textDiv.innerHTML += "Threshold: " + threshold;
      textDiv.innerHTML += "<br>number of clusters: " + clustersList.length + "<br>";
      for (var root of clustersList){
        var nodesInCluster = getNodesBelow(root);
        textDiv.innerHTML += nodesInCluster + "<br>";
      }

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
  textDiv.innerHTML += "<br>in getClusters";
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
