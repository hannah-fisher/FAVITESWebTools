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

/*
create button to save main svg
*/
var saveTreeSVGButton = document.createElement("button");
saveTreeSVGButton.innerHTML = "Save Tree SVG";
saveTreeSVGButton.addEventListener("click", function(){
  var bBox = svg.getBBox();
  var canvas = document.createElement("canvas");
  canvas.width = bBox.width;
  canvas.height = bBox.height;
  var context = canvas.getContext("2d");
  var image = new Image();
  image.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg));
  image.onload = function(){
    context.drawImage(image, 0, 0);
    var imageURL = canvas.toDataURL("image/png");
    var dLink = document.createElement("a");
    dLink.download = "tree.png";
    dLink.href = imageURL;
    dLink.dataset.downloadurl = ["image/png", dLink.download, dLink.href].join(":");
    dLink.click();
  }
});
buttons1Div.appendChild(saveTreeSVGButton);

/*
create button to save guide tree svg
*/
var saveGuideTreeSVGButton = document.createElement("button");
saveGuideTreeSVGButton.innerHTML = "Save Guide Tree SVG";
saveGuideTreeSVGButton.addEventListener("click", function(){
  var canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  var context = canvas.getContext("2d");
  var image = new Image();
  image.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg_guideTree));
  image.onload = function(){
    context.drawImage(image, 0, 0);
    var imageURL = canvas.toDataURL("image/png");
    var dLink = document.createElement("a");
    dLink.download = "guideTree.png";
    dLink.href = imageURL;
    dLink.dataset.downloadurl = ["image/png", dLink.download, dLink.href].join(":");
    dLink.click();
  }
});
buttons1Div.appendChild(saveGuideTreeSVGButton);
