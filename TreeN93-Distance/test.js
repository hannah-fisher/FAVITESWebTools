
var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.id = "tree_display";
document.body.append(svg);

var fileInputter = document.createElement("INPUT");
fileInputter.setAttribute("type", "file");
document.body.appendChild(fileInputter);

fileInputter.addEventListener("change", onFileSelect);
function onFileSelect(e){
  var files = e.target.files;
  if (files.length == 1){
    var f = files[0];
    var reader = new FileReader();
    reader.readAsText(f);
    reader.onload = function(e){
      tree = d3.layout.phylotree().svg(d3.select("#tree_display"))
      .options({
        "left-offset": 20,
        "layout": "right-to-left",
        "show-scale": false,
        "label-nodes-with-name": false,
      });
      tree(d3.layout.newick_parser(reader.result)).layout();
    }
  }
}
