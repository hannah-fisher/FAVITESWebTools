/*
Tool to view phylogenetic trees
and view clusters based on TN93 distance.
User can input tree files in the newick format.
The threshold can be set in an input text box, or using a range slider.
The resulting node clusters can be viewed and downloaded.

assumptions:
  newick inputted file is formatted correctly
  all leaf nodes are exactly the same distance from the root
  every node has a unique name

things to note:
  threshold cuttof is >=, not >
  if a cluster consists of a single leaf, no branch will be colored for that cluster
  threshold is distance from leaves, not distance from root
  branch lengths could be zero
  SOMETIMES THERE ARE CLUSTER COLLECTION MISTAKES
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

/*
Divs on the html page
*/
var treeDisplayDiv = document.createElement("DIV");
var textDiv = document.createElement("DIV");
var guideTreeDisplayDiv = document.createElement("DIV");
var buttons1Div = document.createElement("DIV");
var buttons2Div = document.createElement("DIV");
var divList = [treeDisplayDiv, textDiv, guideTreeDisplayDiv, buttons1Div, buttons2Div];
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
make button to set the tree to the example tree file
put it in the buttonsDiv
*/
var fileChooseExampleButton = document.createElement("BUTTON");
fileChooseExampleButton.innerHTML = "Load Example Tree";
fileChooseExampleButton.style.marginBottom = "5px";
fileChooseExampleButton.addEventListener("click", function(){
  readerResult = "(((((A: 0.1, B: 0.1): 0.1, C: 0.2): 0.2, D: 0.4): 0.3, ((E: 0.3, F: 0.3): 0.3, G: 0.6): 0.1): 0.3, (H: 0.6, ((I: 0.4, J: 0.4): 0.1, (((K: 0.1, L: 0.1): 0.1, M: 0.2): 0.1, N: 0.3): 0.2): 0.1): 0.4);";
  threshold = 0;
  makeTree();
  calcMaxDistance();
  calculateNumLeaves();
  doEverythingTreeClusters();
  updateGuideTree();
  thresholdSlider.setAttribute("min", "0");
  thresholdSlider.setAttribute("max", sliderSize.toString());
});
buttons1Div.appendChild(fileChooseExampleButton);

/*
make the button to select a nwk file
put it in the buttonsDiv
*/
var fileInputter = document.createElement("INPUT");
fileInputter.setAttribute("type", "file");
buttons1Div.appendChild(fileInputter);
buttons1Div.appendChild(document.createElement("BR"));

/*
make the text input to set the threshold value
add it to the buttonsDiv
and add onchange function
*/
var thresholdInput = document.createElement("INPUT");
thresholdInput.setAttribute("type", "text");
thresholdInput.setAttribute("placeholder", "Threshold value");
thresholdInput.setAttribute("size", 12);
buttons1Div.appendChild(thresholdInput);
thresholdInput.onchange = function(){
  threshold = parseFloat(thresholdInput.value);
  if (threshold <= maxDistance && threshold >= 0){
    thresholdSlider.value = threshold * sliderSize / maxDistance;
    doEverythingTreeClusters();
    updateGuideTree();
  }
};

/*
make a slider to set the threshold value
*/
var thresholdSlider = document.createElement("INPUT");
thresholdSlider.setAttribute("class", "slider");
thresholdSlider.setAttribute("type", "range");
buttons1Div.appendChild(thresholdSlider);
buttons1Div.appendChild(document.createElement("br"));

/*
make function for anytime threshold slider is moved
*/
thresholdSlider.oninput = function(){
  threshold = this.value * maxDistance / sliderSize;
  thresholdInput.value = this.value * maxDistance / sliderSize;
  doEverythingTreeClusters();
  updateGuideTree();
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
      readerResult = reader.result;
      threshold = 0;
      makeTree();
      calcMaxDistance();
      calculateNumLeaves();
      doEverythingTreeClusters();
      updateGuideTree();
      thresholdSlider.setAttribute("min", "0");
      thresholdSlider.setAttribute("max", sliderSize.toString());
    }
  }
}

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
}

/*
make buttons to preview and download cluster list
*/
var previewClustersButton = document.createElement("button");
var downloadClustersButton = document.createElement("button");
previewClustersButton.innerHTML = "Preview Clusters";
downloadClustersButton.innerHTML = "Download Clusters";
previewClustersButton.addEventListener("click", previewClusters);
downloadClustersButton.addEventListener("click", downloadClusters);
buttons1Div.appendChild(previewClustersButton);
buttons1Div.appendChild(downloadClustersButton);

/*
function to get a string to display the clusters
called by previewClusters and downloadClusters buttons
*/
function getAllClustersString(){
  s = "SequenceName\tClusterNumber\n";
  var i = 1;
  for (var leafListString of clustersLeafsNamesList){
    var leafList = leafListString.split(",");
    if (leafList.length == 2){ //singleton
      s += leafList[0] + "\t-1\n";
    }
    else{ //cluster
      for (var leaf of leafList){
        if (leaf != ""){
          s += leaf + "\t" + i + "\n";
        }
      }
      i += 1;
    }
  }
  return s;
}

/*
function called by preview clusters button
opens in new tab
*/
function previewClusters(){
  var page = window.open();
  page.document.open();
  page.document.write("<html><body><pre>");
  page.document.write(getAllClustersString());
  page.document.write("</pre></body></html>");
  page.document.close();
}

/*
function called by download clusters button
*/
function downloadClusters(){
  var link = document.createElement("a");
  link.href="data:text/txt," + encodeURIComponent(getAllClustersString());
  link.download = "clusters.txt";
  link.click();
}

/*
function to make the guide tree
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
    guide_tree.sync_edge_labels();
  })
  sortNodes(sortNodesUp);
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
  tree = tree.style_edges(edgeStyler);
  tree = tree.style_nodes(nodeStyler);
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
    d += parseFloat(c.attribute);
    children = c.children;
  }
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
function to style the branches
*/
function edgeStyler(dom_element, edge_object){
  dom_element.style("stroke", null);
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
      dom_element.style("stroke", clusterToColorDict[i % 4]);
    }
  }
}

/*
function to style the nodes
*/
function nodeStyler(dom_element, node_object){
  dom_element.style("fill", null);
  var color = clusterToColorDict[nodeNameToClusterNum[node_object.name] % 4];
  dom_element.style("fill", color);
}

/*
make buttons to compress and expand tree spacing
*/
var sizeButtons = [];
for (var i = 0; i < 4; i ++){
  var b = document.createElement("button");
  b.style.margin = "3px";
  (i < 2) ? b.xyFunc = "X" : b.xyFunc = "Y";
  (i < 2) ? b.xyDisp = "Y" : b.xyDisp = "X";
  (i % 2 == 0) ? b.func = "Expand" : b.func = "Compress";
  b.innerHTML = b.func + " " + b.xyDisp;
  b.addEventListener("click", function(){
    var delta = 0;
    (this.func == "Expand") ? delta = 1 : delta = -1;
    (this.xyFunc == "X") ? x_spacing += delta : y_spacing += delta;
    (this.xyFunc == "X") ? tree = tree.spacing_x(x_spacing, true) : tree = tree.spacing_y(y_spacing, true);
    tree(d3.layout.newick_parser(readerResult)).layout();
    sortNodes(sortNodesUp);
    updateGuideTree();
  });
  sizeButtons.push(b);
  buttons2Div.appendChild(b);
}

/*
make buttons that when pressed it sorts the nodes
so they are shown in prettier layout on tree
*/
var sortTreeUpButton = document.createElement("button");
sortTreeUpButton.style.margin = "3px";
sortTreeUpButton.innerHTML += "Sort Up";
sortTreeUpButton.addEventListener("click", function(){
  sortNodesUp = true;
  sortNodes(sortNodesUp);
});
buttons2Div.appendChild(sortTreeUpButton);
var sortTreeDownButton = document.createElement("button");
sortTreeDownButton.style.margin = "3px";
sortTreeDownButton.innerHTML += "Sort Down";
sortTreeDownButton.addEventListener("click",function(){
  sortNodesUp = false;
  sortNodes(sortNodesUp);
});
buttons2Div.appendChild(sortTreeDownButton);

/*
function to sort the nodes
either ascending or descending order based on asc
*/
function sortNodes(asc) {
  tree.traverse_and_compute(function (n){
    var d = 1;
    if (n.children && n.children.length){
      d += d3.max(n.children, function(d){ return d["count_depth"];});
    }
    n["count_depth"] = d;
  });
  tree.resort_children(function(a,b){
    return (a["count_depth"] - b["count_depth"]) * (asc ? 1 : -1);
  });
  d3.layout.phylotree.trigger_refresh(tree);
  guideTree.traverse_and_compute(function (n){
    var d = 1;
    if (n.children && n.children.length){
      d += d3.max(n.children, function(d){ return d["count_depth"];});
    }
    n["count_depth"] = d;
  });
  guideTree.resort_children(function(a,b){
    return (a["count_depth"] - b["count_depth"]) * (asc ? 1 : -1);
  });
  d3.layout.phylotree.trigger_refresh(guideTree);
}
