/*
A file to create and add functionality to the buttons on the page
*/

/*
add some text to the buttons1 div
*/
var chooseTreeText = document.createElement("p");
chooseTreeText.innerHTML += "Choose Tree:";
buttons1Div.appendChild(chooseTreeText);

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
  setTimeout(() => {sortTreeUpButton.click();}, 500); //this is suss but idk what to do about it...
  thresholdSlider.setAttribute("min", "0");
  thresholdSlider.setAttribute("max", sliderSize.toString());
  branchIndex = 0;
  tree = tree.style_edges(edgeStylerDictFiller);
  d3.layout.phylotree.trigger_refresh(tree);
  branchIndex = 0;
  tree = tree.style_edges(edgeStyler);
  tree = tree.style_nodes(nodeStyler);
  d3.layout.phylotree.trigger_refresh(tree);
});
buttons1Div.appendChild(fileChooseExampleButton);
buttons1Div.appendChild(document.createElement("BR"));

/*
make the button to select a nwk file
put it in the buttonsDiv
*/
var fileInputter = document.createElement("INPUT");
fileInputter.setAttribute("type", "file");
buttons1Div.appendChild(fileInputter);
buttons1Div.appendChild(document.createElement("BR"));

/*
add some text to the buttons1 div
*/
var chooseThresholdText = document.createElement("span");
chooseThresholdText.innerHTML += "Choose Threshold: ";
buttons1Div.appendChild(chooseThresholdText);

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
previewClustersButton.innerHTML = " - Preview";
downloadClustersButton.innerHTML = " - Download";
previewClustersButton.addEventListener("click", previewClusters);
downloadClustersButton.addEventListener("click", downloadClusters);

/*
create clickable dropdown for previewing or downloading the clusters
*/
var clustersDropdown = document.createElement("button");
clustersDropdown.innerHTML = "Save Clusters";
var clustersDropdownContent = document.createElement("div");
var clustersDropdownList = [previewClustersButton, downloadClustersButton];
for (var b of clustersDropdownList){
  clustersDropdownContent.appendChild(b);
  clustersDropdownContent.appendChild(document.createElement("br"));
}
clustersDropdownContent.style["display"] = "none";
clustersDropdown.onclick = function(){
  if (clustersDropdownContent.style["display"] == "none"){
    clustersDropdownContent.style["display"] = "block";
  }
  else{
    clustersDropdownContent.style["display"] = "none";
  }
};

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
for lists: expand x, compress x, expand y, compress y
*/
var sizeButtons = [];
var sizeButtonsIcons = ["fa fa-arrows-v", "fa fa-compress fa-rotate-135", "fa fa-arrows-h", "fa fa-compress fa-rotate-45"];
for (var i = 0; i < 4; i ++){
  var b = document.createElement("button");
  b.style.margin = "3px";
  (i < 2) ? b.xyFunc = "X" : b.xyFunc = "Y";
  (i < 2) ? b.xyDisp = "Y" : b.xyDisp = "X";
  (i % 2 == 0) ? b.func = "Expand" : b.func = "Compress";
  b.innerHTML = '<i class="' + sizeButtonsIcons[i] + '" ></i>';
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
sortTreeUpButton.innerHTML += '<i class="fa fa-sort-amount-desc" ></i>';
sortTreeUpButton.addEventListener("click", function(){
  sortNodesUp = true;
  sortNodes(sortNodesUp);
});
buttons2Div.appendChild(sortTreeUpButton);
var sortTreeDownButton = document.createElement("button");
sortTreeDownButton.style.margin = "3px";
sortTreeDownButton.innerHTML += '<i class="fa fa-sort-amount-asc" ></i>';
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
function called by save tree as png and as svg
*/
function saveTreeBoth(svg){
  svg.setAttribute("version", "1.1");
  svg.removeAttribute("xmlns");
  svg.removeAttribute("xlink");
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  var defsEl = document.createElement("defs");
  svg.insertBefore(defsEl, svg.firstChild);
  var styleEl = document.createElement("style");
  defsEl.appendChild(styleEl);
  styleEl.setAttribute("type", "text/css");
  var source = new XMLSerializer()
    .serializeToString(svg)
    .replace("</style>", "<![CDATA[" + styles + "]]></style>");
  return source;
}

/*
function to save an svg tree as a png, called by button click
*/
function saveTreePNG(svg){
  var source = saveTreeBoth(svg);
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
  var img = new Image();
  img.onload = function onload(){
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(function(blob){
      var url = window.URL.createObjectURL(blob);
      var downloadLink = document.createElement("a");
      downloadLink.download = "image.png";
      downloadLink.href = url;
      downloadLink.click();
    })
  }
  img.src = "data:image/svg+xml;base66," + encodeURIComponent([doctype + source]);
}

/*
function to save an svg tree as a svg, called by button click
*/
function saveTreeSVG(svg){
  var source = saveTreeBoth(svg);
  var svgBlob = new Blob([source], {type:"image/svg+xml;charset=utf-8"});
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = "image.svg";
  downloadLink.click();
}

/*
create clickable dropdown for saving the tree or guide tree as png or svg
and create the four save buttons that go in the dropdown
*/
var saveTreeDropdown = document.createElement("button");
saveTreeDropdown.innerHTML = "Save Trees";
var saveTreeDropdownContent = document.createElement("div");
var saveTreeDropdownList = [];
var saveTreeLabels = [" - Tree PNG", " - Tree SVG", " - Guide Tree PNG", " - Guide Tree SVG"];
var saveTreeFuncs = [function(){saveTreePNG(svg);}, function(){saveTreeSVG(svg);}, function(){saveTreePNG(svg_guideTree);}, function(){saveTreeSVG(svg_guideTree);}];
for (var i = 0; i < 4; i ++){
  var b = document.createElement("button");
  b.innerHTML = saveTreeLabels[i];
  b.addEventListener("click", saveTreeFuncs[i]);
  saveTreeDropdownList.push(b);
  saveTreeDropdownContent.appendChild(b);
  saveTreeDropdownContent.appendChild(document.createElement("br"));
}
saveTreeDropdownContent.style["display"] = "none";
saveTreeDropdown.onclick = function(){
  if (saveTreeDropdownContent.style["display"] == "none"){
    saveTreeDropdownContent.style["display"] = "block";
  }
  else{
    saveTreeDropdownContent.style["display"] = "none";
  }
};

/*
append the dropdown buttons to the buttons1div
*/
buttons1Div.appendChild(clustersDropdown);
buttons1Div.appendChild(saveTreeDropdown);
buttons1Div.appendChild(clustersDropdownContent);
buttons1Div.appendChild(saveTreeDropdownContent);
