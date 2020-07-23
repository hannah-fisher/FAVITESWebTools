/*
A file to apply style to various elements on the document
created as a separate file to reduce clutter on main.js
*/

/*
add some style to the guideTreeDisplayDiv
*/
var guideTreeDisplayDivStyle = {
  "position": "fixed",
  "top": "25px",
  "right": "25px",
  "border-style": "solid",
  "border-color": "black",
  "border-width": "1px",
  "background": "white",
  "width": (guideWidth + "px"),
  "height": (guideHeight + "px"),
  "padding": "3px",
  "border-radius": "5px"
};
for (var k of Object.keys(guideTreeDisplayDivStyle)){
  guideTreeDisplayDiv.style[k] = guideTreeDisplayDivStyle[k];
}

/*
add some style to the treeDisplayDiv
*/
var treeDisplayDivStyle = {
  "background": "white",
  "margin": "5px"
};
for (var k of Object.keys(treeDisplayDivStyle)){
  treeDisplayDiv.style[k] = treeDisplayDivStyle[k];
}

/*
add some style to the textDiv
*/
var textDivStyle = {
  "position": "fixed",
  "width": "300px",
  "height": "130px",
  "top": "295px",
  "right": "435px",
  "border-style": "solid",
  "border-color": "black",
  "border-width": "1px",
  "background": "white",
  "padding": "5px",
  "padding-top": "12px",
  "border-radius": "5px"
};
for (var k of Object.keys(textDivStyle)){
  textDiv.style[k] = textDivStyle[k];
}

/*
add some style to the buttonsDiv
*/
var buttons1DivStyle = {
  "position": "fixed",
  "width": "300px",
  "height": "205px",
  "top": "25px",
  "right": "435px",
  "border-style": "solid",
  "border-color": "black",
  "border-width": "1px",
  "background": "white",
  "padding": "5px",
  "border-radius": "5px"
};
for (var k of Object.keys(buttons1DivStyle)){
  buttons1Div.style[k] = buttons1DivStyle[k];
}

/*
add some style to the buttons2 div
*/
var buttons2DivStyle = {
  "position": "fixed",
  "width": "300px",
  "height": "45px",
  "top": "240px",
  "right": "435px",
  "border-style": "solid",
  "border-color": "black",
  "border-width": "1px",
  "background": "white",
  "padding": "5px",
  "border-radius": "5px"
};
for (var k of Object.keys(buttons2DivStyle)){
  buttons2Div.style[k] = buttons2DivStyle[k];
}

/*
add style to save clusters and save trees buttons and dropdowns
*/
clustersDropdown.style["width"] = "120px";
clustersDropdown.style["margin-left"] = "3px";
clustersDropdown.style["margin-right"] = "3px";
saveTreeDropdown.style["width"] = "120px";
saveTreeDropdown.style["margin-left"] = "3px";
saveTreeDropdown.style["margin-right"] = "3px";
for (var b of clustersDropdownList){
  b.style["width"] = "120px";
  b.style["margin-left"] = "3px";
  b.style["margin-right"] = "3px";
}
for (var b of saveTreeDropdownList){
  b.style["width"] = "120px";
  b.style["margin-left"] = "3px";
  b.style["margin-right"] = "3px";
}
saveTreeDropdownContent.style["margin-left"] = "126px";

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
