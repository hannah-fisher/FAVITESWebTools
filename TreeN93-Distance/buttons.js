/*
A file to create and add functionality to the buttons on the page
*/

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
  thresholdInput.value = 0;
  thresholdSlider.value = 0;
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
    branchIndex = 0;
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
  branchIndex = 0;
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
      thresholdInput.value = 0;
      thresholdSlider.value = 0;
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
    addCustomNodeMenus();
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
  branchIndex = 0;
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
  branchIndex = 0;
  d3.layout.phylotree.trigger_refresh(guideTree);
}

/*
create button to save main svg
*/
var saveTreeSVGButton = document.createElement("button");
saveTreeSVGButton.innerHTML = "Save Tree SVG";
saveTreeSVGButton.addEventListener("click", function(){
  saveTreeSVG(svg);
});
buttons1Div.appendChild(saveTreeSVGButton);

/*
create button to save guide tree svg
*/
var saveGuideTreeSVGButton = document.createElement("button");
saveGuideTreeSVGButton.innerHTML = "Save Guide Tree SVG";
saveGuideTreeSVGButton.addEventListener("click", function(){
  saveTreeSVG(svg_guideTree);
});
buttons1Div.appendChild(saveGuideTreeSVGButton);

/*
function to save an svg tree, called by button click
*/
function saveTreeSVG(svg){
  svg.setAttribute("version", "1.1");
  var defsEl = document.createElement("defs");
  svg.insertBefore(defsEl, svg.firstChild);
  var styleEl = document.createElement("style");
  defsEl.appendChild(styleEl);
  styleEl.setAttribute("type", "text/css");
  svg.removeAttribute("xmlns");
  svg.removeAttribute("xlink");
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  var source = new XMLSerializer()
    .serializeToString(svg)
    .replace("</style>", "<![CDATA[" + styles + "]]></style>");
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
  var to_download = [doctype + source];
  var image_string = "data:image/svg+xml;base66," + encodeURIComponent(to_download);
  var img = new Image();
  img.onload = function onload(){
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(onsuccess);
  }
  img.src = image_string;
}

/*
function for the canvas and blob, actually downloads the thing
*/
function onsuccess(blob){
  var url = window.URL.createObjectURL(blob);
  var pom = document.createElement("a");
  pom.setAttribute("download", "image.png");
  pom.setAttribute("href", url);
  $("body").append(pom);
  pom.click();
  pom.remove();
}

/*
hold the string that has the tree style
can't figure out how to access it from phylotree.css file
so I've just retyped it here
ommitted the on hover style, because that is irrelevant in a picture file
*/
var styles = "";
styles += ".tree-selection-brush .extent {fill-opacity: .05; stroke: #fff; shape-rendering: crispEdges;}";
styles += ".tree-scale-bar text {font: sans-serif;}";
styles += ".tree-scale-bar line, .tree-scale-bar path {fill: none; stroke: #000; shape-rendering: crispEdges;}";
styles += ".node circle, .node ellipse, .node rect {fill: steelblue; stroke: black; stroke-width: 0.5px}";
styles += ".internal-node circle, .internal-node ellipse, .internal-node rect{fill: #CCC; stroke: black; stroke-width: 0.5px;}";
styles += ".node {font: 10px sans-serif;}";
styles += ".node-selected {fill: #f00 !important;}";
styles += ".node-collapsed circle, .node-collapsed ellipse, .node-collapsed rect {fill: black !important;}";
styles += ".node-tagged {fill: #00f;}";
styles += ".branch {fill: none; stroke: #999; stroke-width: 2px;}";
styles += ".clade {fill: #1f77b4; stroke: #444; stroke-width: 2px; opacity: 0.5;}";
styles += ".branch-selected {stroke: #f00 !important; stroke-width: 3px}";
styles += ".branch-tagged {stroke: #00f; stroke-dasharray: 10,5; stroke-width: 2px;}";
styles += ".branch-tracer {stroke: #bbb; stroke-dasharray: 3,4; stroke-width: 1px;}";
styles += ".branch-multiple {stroke-dasharray: 5, 5, 1, 5; stroke-width: 3px;}";
styles += ".tree-widget {}";
