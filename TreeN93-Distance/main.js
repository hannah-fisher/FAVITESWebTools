/*
Tool to view phylogenetic trees and view clusters based on TN93 distance.
User can input tree files in the newick format.
The threshold can be set in an input text box, or using a range slider.
The resulting node clusters can be viewed and downloaded.
And the tree visualization and guide tree can be downloaded as png or svg.

Assumptions:
  newick inputted file is formatted correctly
  all leaf nodes are exactly the same distance from the root
  every leaf node has a unique name

Things to note:
  threshold cuttof is >=, not >
  if a cluster consists of a single leaf, no branch will be colored for that cluster
  threshold is distance from leaves, not distance from root
  branch lengths could be zero
  SOMETIMES THERE ARE SLIGHT CLUSTER COLLECTION MISTAKES
  THIS IS BECAUSE SOME DECIMAL NUMBERS CANNOT BE REPRESENTED EXACTLY IN BINARY
*/

/*
variables that may be used throughout
*/
var tree; //holds the phylotree
var reader; //FileReader object to read in the selected newick file
var readerResult;
var maxDistance; //distance of leaves from root
var threshold = 0; //cutoff distance from leaves
var clustersList = []; //list of root nodes of clusters
var clustersLeafsNamesList = []; //list of concatenated names of leaf nodes in each cluster
var clusterToColorDict = {0: "Green", 1: "Teal", 2: "Navy", 3: "Purple"}; //arbitrary colors for clusters
var guideTree; //same shape as tree, but different settings
var guideHeight = 400; //height of box holding guide tree
var guideWidth = 400; //width of box holding guide tree
var nodeNameToClusterNum = {};
var x_spacing = 10; //for tree display
var y_spacing = 10; //for tree display
var numLeaves;
var precision = 7; //how many decimals on distance numbers
var sliderSize = 100; //how many different locations are on the slider
var sortNodesUp = true;
var branchToColorDict = {};
var branchIndex = 0; //used as an index when style_edges is called

/*
Divs on the html page
*/
var treeDisplayDiv = document.createElement("DIV");
var textDiv = document.createElement("DIV");
var guideTreeDisplayDiv = document.createElement("DIV");
var buttons1Div = document.createElement("DIV");
var buttons2Div = document.createElement("DIV");
var divList = [treeDisplayDiv, textDiv, guideTreeDisplayDiv, buttons2Div, buttons1Div];
for (var div of divList){
  document.body.appendChild(div);
}

/*
function to update the text div contents
*/
function updateTextDiv(){
  textDiv.innerHTML = "";
  textDiv.innerHTML += "Number of leaves: " + numLeaves + "<br>";
  textDiv.innerHTML += "Height: " + maxDistance + "<br>";
  textDiv.innerHTML += "Threshold: " + threshold + "<br>";
  var csCounts = calcClustersSinglesCount();
  textDiv.innerHTML += "Number of clusters: " + csCounts[0] + "<br>";
  textDiv.innerHTML += "Number of singletons: " + csCounts[1] + "<br>";
}

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
function to make and display the main tree
tree is displayed in the svg which has id tree_display
this is in the div treeDisplayDiv
*/
function makeTree(){
  tree = d3.layout.phylotree().svg(d3.select("#tree_display"))
  .options({
    "left-offset": 10,
    "layout": "right-to-left",
    "show-scale": false,
    "label-nodes-with-name": false,
    "align-tips": true,
    "selectable": false,
  });
  tree = tree.spacing_x(x_spacing, true);
  tree = tree.spacing_y(y_spacing, true);
  tree(d3.layout.newick_parser(readerResult)).layout();
  addCustomNodeMenus();
}

/*
function to make and update the guide tree
*/
function updateGuideTree(){
  guideTree = d3.layout.phylotree()
    .svg(d3.select("#tree_guide"))
    .options({
      'left-right-spacing': 'fit-to-size',
      'top-bottom-spacing': 'fit-to-size',
      'collapsible': false,
      'transitions': false,
      'show-scale': false,
      'brush': false,
      'selectable': false,
      "layout": "right-to-left"
    })
    .size([guideHeight - 6, guideWidth - 6])
    .node_circle_size(0);
  guideTree(d3.layout.newick_parser(readerResult)).layout();
  var x = d3.scale.linear()
    .domain([0, document.body.scrollWidth])
    .range([0, guideWidth - 6]);
  var y = d3.scale.linear()
    .domain([0, document.body.scrollHeight])
    .range([0, guideHeight - 6]);
  var line = d3.select("#tree_guide")
    .append("line")
    .attr("x1", (threshold / maxDistance) * guideWidth)
    .attr("y1", 0)
    .attr("x2", (threshold / maxDistance) * guideWidth)
    .attr("y2", guideHeight)
    .style("stroke", "red")
    .style("stroke-width", 2);
  var rect = d3.select("#tree_guide")
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .style('opacity', .4)
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
    guideTree.sync_edge_labels();
  })
  sortNodes(sortNodesUp);
  branchIndex = 0;
  guideTree = guideTree.style_edges(edgeStyler);
  d3.layout.phylotree.trigger_refresh(guideTree);
}

/*
function that does all of the cluster calculations and displaying
called anytime the threshold distance is changed
*/
function doEverythingTreeClusters(){
  clustersList = [];
  clustersLeafsNamesList = [];
  branchToColorDict = {};
  nodeNameToClusterNum = {};
  getClusters(d3.layout.newick_parser(readerResult).json, 0.0, clustersList);
  updateTextDiv();
  for (var i in clustersList){
    var nodesInCluster = getNodesBelow(clustersList[i]);
    clustersLeafsNamesList.push(nodeNameListToString(nodesInCluster));
    for (var nodeName of nodesInCluster){
      nodeNameToClusterNum[nodeName] = i;
    }
  }
  branchIndex = 0;
  tree = tree.style_edges(edgeStylerDictFiller);
  d3.layout.phylotree.trigger_refresh(tree);
  branchIndex = 0;
  tree = tree.style_edges(edgeStyler);
  tree = tree.style_nodes(nodeStyler);
  d3.layout.phylotree.trigger_refresh(tree);
}

/*
function to add custom menu items to the nodes
*/
function addCustomNodeMenus(){
  tree.get_nodes().forEach(function(n){
    var h = calcDistanceNodeToLeaf(n);
    d3.layout.phylotree.add_custom_menu(n,
      function(n){
        return "Height: " + h;
      },
      function(){},
      function(){
        return true;
      }
    );
    d3.layout.phylotree.add_custom_menu(n,
      function(){
        return "Snap threshold to here";
      },
      function(){
        threshold = h;
        thresholdSlider.value = threshold * sliderSize / maxDistance;
        thresholdInput.value = threshold;
        doEverythingTreeClusters();
        updateGuideTree();
      },
      function(){
        return true;
      }
    );
  });
  branchIndex = 0;
  tree = tree.style_edges(edgeStyler);
  tree = tree.style_nodes(nodeStyler);
  d3.layout.phylotree.trigger_refresh(tree);
}

/*
function to calculate the distance of a given node from the leaves
*/
function calcDistanceNodeToLeaf(n){
  var d = 0;
  var current = n;
  while (current.children != null){
    current = current.children[0];
    d += parseFloat(Number(current.attribute).toFixed(precision));
  }
  return d;
}

/*
function to calculate the number of clusters and the number of singletons
assuming the clustersList is already filled
*/
function calcClustersSinglesCount(){
  var c = 0;
  var s = 0;
  for (var root of clustersList){
    root.children == null ? s += 1 : c += 1;
  }
  return [c, s];
}

/*
function to calculate the distance of the leaf nodes from the root
*/
function calcMaxDistance(){
  var json_and_error = d3.layout.newick_parser(readerResult);
  var json = json_and_error.json
  var d = 0;
  var children = json.children;
  while (children != null){
    var c = children[0];
    d += parseFloat(Number(c.attribute).toFixed(precision));
    children = c.children;
  }
  d = parseFloat(Number(d).toFixed(precision));
  maxDistance = d;
}

/*
function to get the clusters using the threshold value
uses recursion
the root of each cluster is appended to the clustersList
had to really convert the number and use toFixed
*/
function getClusters(root, distanceAlready, clustersList){
  if (distanceAlready >= (maxDistance - threshold)){
    clustersList.push(root);
  }
  else{
    if (root.children != null){
      for (var child of root.children){
        var dist = parseFloat(Number(child.attribute).toFixed(precision));
        var passDist = parseFloat(Number(dist + distanceAlready).toFixed(precision));
        getClusters(child, passDist, clustersList);
      }
    }
  }
}

/*
function to get the name of all the leaf nodes in a given tree
really, given the root node
somehow this works on both json style nodes and original nodes ... ?
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
function to turn a list of node names into a single string
*/
function nodeNameListToString(nodeNameList){
  var s = "";
  for (var n of nodeNameList){
    s += n + ",";
  }
  return s;
}

/*
function to calculate the number of leaf nodes
*/
function calculateNumLeaves(){
  var c = 0;
  for (var n of tree.get_nodes()){
    if (n.children == null){
      c += 1;
    }
  }
  numLeaves = c;
}

/*
function to fill the branchToColorDict
in the format of edgeStyler to reach all edges
*/
function edgeStylerDictFiller(dom_element, edge_object){
  branchIndex += 1;
  var thisS = nodeNameListToString(getNodesBelow(edge_object.source));
  var nodesBelow = getNodesBelow(edge_object.source);
  for (var i in clustersLeafsNamesList){
    var thisNamesList = clustersLeafsNamesList[i];
    var match = true;
    for (var n of nodesBelow){
      if (!thisNamesList.includes(n)){
        match = false;
        break;
      }
    }
    if (match){
      branchToColorDict[branchIndex] = clusterToColorDict[i % 4];
    }
  }
}

/*
function to style the branches
*/
function edgeStyler(dom_element, edge_object){
  branchIndex += 1;
  dom_element.style("stroke", branchToColorDict[branchIndex]);
}

/*
function to style the nodes
*/
function nodeStyler(dom_element, node_object){
  dom_element.style("fill", null);
  var color = clusterToColorDict[nodeNameToClusterNum[node_object.name] % 4];
  dom_element.style("fill", color);
}
