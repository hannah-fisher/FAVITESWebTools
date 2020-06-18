
/*
variables being used throughout
will be filled in with actual values later
*/
var moduleList;
var modImpSelections = {};
var allReqs = {};
var allDeps = new Set();

/*
divisions on the html page
*/
var introDiv = document.createElement('div');
introDiv.id = "introDiv";
document.body.appendChild(introDiv);

var modImpsDiv = document.createElement('div');
modImpsDiv.id = "modImpsDiv";
document.body.appendChild(modImpsDiv);

var setButton1Div = document.createElement('div');
setButton1Div.id = "setButton1Div";
document.body.appendChild(setButton1Div);

var modParametersDiv = document.createElement('div');
modParametersDiv.id = "modParametersDiv";
document.body.appendChild(modParametersDiv);

var setButton2Div = document.createElement('div');
setButton2Div.id = "setButton2Div";
document.body.appendChild(setButton2Div);

var depListDiv = document.createElement('div');
depListDiv.id = "depListDiv";
document.body.appendChild(depListDiv);

var exportButtonDiv = document.createElement('div');
exportButtonDiv.id = "exportButtonDiv";
document.body.appendChild(exportButtonDiv);

/*
Add text to intro div
*/
var introPar = document.createElement("p");
introPar.innerHTML += "FAVITES Configuration File Designer<br><br>";
introPar.innerHTML += "Select an implementation for each module below.<br>";
introPar.innerHTML += "Then, press the 'Set module implementations' button.<br>";
introPar.innerHTML += "Fill in values for the module implementation parameters.<br>";
introPar.innerHTML += "Press the 'Set parameter values' button.<br>";
introPar.innerHTML += "To preview configuration file, press 'Preview selected configuration' button.<br>";
introPar.innerHTML += "To download configuration file, press 'Export selected configuration' button.<br>";
document.getElementById("introDiv").appendChild(introPar);

/*
Read in the FAVITES_ModuleList.json from the favites github repository
store the results in the variable moduleList
call makeDiv on each module type
*/
let requestURL = 'https://raw.githubusercontent.com/niemasd/FAVITES/master/modules/FAVITES_ModuleList.json';
let request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload = function() {
  moduleList = request.response;
  for (m in moduleList){
    modImpSelections[m] = "";
    makeDiv(m, moduleList);
  }
}

/*
For the given module m
create a new html div whose id is the name m
to the div, add the name m and a dropdown menu to select implementation
these divs all get added to the modImplementationDiv
*/
function makeDiv(m, moduleList){
  var newDiv = document.createElement('div');
  newDiv.id = m;
  newDiv.className = "mod";
  newDiv.innerHTML += m + " ";
  var mOptions = moduleList[m];
  var selector = document.createElement("SELECT");
  selector.id = m + "selector";
  for (o in mOptions){
    var oStripped = JSON.stringify(o)
    oStripped = oStripped.substring(1, oStripped.length - 1);
    var option = document.createElement("option");
    option.text = oStripped;
    selector.add(option);
  }
  newDiv.appendChild(selector);
  newDiv.innerHTML += "<br><br>";
  document.getElementById("modImpsDiv").appendChild(newDiv);
}

/*
Make the button to set module implementation selections
*/
var setButton1 = document.createElement("BUTTON");
var setButton1Text = document.createTextNode("SET module implementations");
setButton1.appendChild(setButton1Text);
setButton1.addEventListener("click", setModImpButtonClick);
var buttonPar = document.createElement("p");
buttonPar.id = "buttonPar";
document.getElementById("setButton1Div").appendChild(setButton1);
document.getElementById("setButton1Div").appendChild(buttonPar);

/*
function that is called when set module implementations button is clicked
*/
function setModImpButtonClick(){
  getModImpSelections();
  makeParameterInputs();
}

/*
Function that retrieves and stores the values selected in the selector
for the module implementations
*/
function getModImpSelections(){
  var buttonElement = document.getElementById("buttonPar");
  buttonElement.innerHTML = "";
  buttonHTML = "";
  allReqs = {};
  allDeps = new Set();
  for (modKey in modImpSelections){
    modImpSelections[modKey] = document.getElementById(modKey + "selector").value;
    //get requirements and dependencies:
    var reqs = moduleList[modKey][modImpSelections[modKey]].req;
    var deps = moduleList[modKey][modImpSelections[modKey]].dep;
    for (req of reqs){
      allReqs[req] = "";
    }
    if (deps !== null && deps !== undefined){
      for (dep of deps){
        allDeps.add(dep);
      }
    }
  }
  fillDepListPar();
}

/*
For all of the required module parameters
make a new div
in each div have the name of the requirement and a input text box
add them all to the modParametersDiv
the id of each input text box is the name of the parameter + input
*/
function makeParameterInputs(){
  document.getElementById("modParametersDiv").innerHTML = "Required parameters for selected module implementations:";
  for (var req in allReqs){
    var newDiv = document.createElement("div");
    newDiv.id = req;
    newDiv.className = "req";
    newDiv.innerHTML += req + " ";
    var textInput = document.createElement("INPUT");
    textInput.setAttribute("type", "text");
    textInput.id = req + "input";
    newDiv.appendChild(textInput);
    newDiv.innerHTML += "<br>";
    document.getElementById("modParametersDiv").appendChild(newDiv);
  }
}

/*
Display all of the necessary dependencies, based on the selected module implementations
In the depListDiv
*/
var depListPar = document.createElement("p");
document.getElementById("depListDiv").appendChild(depListPar);
function fillDepListPar(){
    depListPar.innerHTML = "Dependencies needed: ";
    for (dep of Array.from(allDeps)){
      depListPar.innerHTML += "<br>" + dep;
    }
}

/*
Make the button to set required parameter choices
*/
var setButton2 = document.createElement("BUTTON");
var setButton2Text = document.createTextNode("SET parameter values");
setButton2.appendChild(setButton2Text);
setButton2.addEventListener("click", getParameterValues);
document.getElementById("setButton2Div").innerHTML = "<br>";
document.getElementById("setButton2Div").appendChild(setButton2);

/*
function that is called when set param value button is clicked
no visible output
set values in dictionary
*/
function getParameterValues(){
  for (var req in allReqs){
    allReqs[req] = document.getElementById(req + "input").value;
  }
}

/*
Make the buttons to preview and export the selected configuration
*/
document.getElementById("exportButtonDiv").innerHTML = "<br>";
var previewButton = document.createElement("BUTTON");
var previewButtonText = document.createTextNode("PREVIEW selected configuration");
previewButton.appendChild(previewButtonText);
previewButton.addEventListener("click", previewConfig);
document.getElementById("exportButtonDiv").appendChild(previewButton);
var exportButton = document.createElement("BUTTON");
var exportButtonText = document.createTextNode("EXPORT selected configuration");
exportButton.appendChild(exportButtonText);
exportButton.addEventListener("click", exportConfig);
document.getElementById("exportButtonDiv").appendChild(exportButton);

/*
function that creates a string for the configuration file
uses the key/value pairs in modImpSelections and allReqs
*/
function getConfigString(){
  var combinedDict = {};
  for (var key in modImpSelections){
    combinedDict[key] = modImpSelections[key];
  }
  for (var key in allReqs){
    combinedDict[key] = allReqs[key];
  }
  var combinedDictString = JSON.stringify(combinedDict, null, "\t");
  return combinedDictString;

}

/*
function that is called when the preview button is clicked
create json and open and display in a new tab
assumes that values have been chosen and both set buttons have been clicked
*/
function previewConfig(){
  var combinedDictString = getConfigString();
  var jsonPage = window.open();
  jsonPage.document.open();
  jsonPage.document.write("<html><body><pre>" + combinedDictString + "</pre></body></html>");
  jsonPage.document.close();
}

/*
function that is called when the export button is clicked
create json and allow user to save it in some location
assumes that values have been chosen and both set buttons have been clicked
*/
function exportConfig(){
  var combinedDictString = getConfigString();
  var link = document.createElement("a");
  link.href = "data:text/json," + encodeURIComponent(combinedDictString);
  link.download = "CONFIG.json";
  link.click();
}



/*
TODO
make defaults blank in drop down?
add links to module types
put a line break between the preview and export buttons
change method of making json string - more like original, with comment divisions
put things in json output in alphabetical order?
*/
