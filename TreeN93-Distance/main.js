/*
SHOULD PUT A DESCRIPTION OF THE PROJECT HERE ...
*/

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
  var files = e.target.files;
  if (files.length == 1){
    var f = files[0];
    textDiv.innerHTML += "Found file: " + f.name + "<br>";
    var reader = new FileReader();
    reader.readAsText(f);
    reader.onload = function(e){
      var tree = d3.layout.phylotree().svg(d3.select("#tree_display"));
      tree(d3.layout.newick_parser(reader.result)).layout();
      textDiv.innerHTML += "Finished loading file and displaying tree";
    }
  }
}
