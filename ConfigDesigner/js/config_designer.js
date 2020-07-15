
/*
variables being used throughout
will be filled in with actual values later
*/
var moduleList;
var modImpSelections = {};
var allReqs = {};
var allDeps = new Set();
var missingModDepsDict = {};
var validModImpSelections;
var outputFileName = "CONFIG.json";
var inputsWidth = "450px";

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

var depListDiv = document.createElement('div');
depListDiv.id = "depListDiv";
document.body.appendChild(depListDiv);

var modParametersDiv = document.createElement('div');
modParametersDiv.id = "modParametersDiv";
document.body.appendChild(modParametersDiv);

var setButton2Div = document.createElement('div');
setButton2Div.id = "setButton2Div";
document.body.appendChild(setButton2Div);

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
introPar.innerHTML += "Note: you should not set parameter values if the module implementation configuration is invalid.<br>"
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
the name m also is a link that when clicked opens the module wiki in a new tab
*/
function makeDiv(m, moduleList){
  var newDiv = document.createElement('div');
  newDiv.style.width = inputsWidth;
  newDiv.id = m;
  newDiv.className = "mod";
  var a = document.createElement("a");
  var link = document.createTextNode(m);
  a.appendChild(link);
  a.href = "https://github.com/niemasd/FAVITES/wiki/Module:-" + m;
  a.target = "_blank";
  newDiv.appendChild(a);
  var mOptions = moduleList[m];
  var selector = document.createElement("SELECT");
  selector.id = m + "selector";
  selector.style.float = "right";
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
  getMissingDeps();
  checkValidModImpSelections();
  fillDepListPar();
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
}

/*
function that gets the values of the modImpSelections dictionary
returns them in an array
*/
function getModImpSelectionsValues(){
  values = [];
  for (var key in modImpSelections){
    values.push(modImpSelections[key]);
  }
  return values;
}

/*
function that is called when the first set button is pressed
gets all the dependencies
determines which dependencies are missing for each mod imp selection
this info is then displayed in the depListDiv
missingModDepsDict is a dictionary with:
key = module type (ex: ContactNetwork)
value = dictionary with:
  key = module type of dependency
  value = list of possible satisfactory implementations of that module
dont need to store module implementation selection, can retrieve from other dict
*/
function getMissingDeps(){
  missingModDepsDict = {};
  for (var modType in modImpSelections){
    var modImp = modImpSelections[modType];
    var allThisDeps = moduleList[modType][modImp].dep;
    var missingDepDict = {};
    for (var n in allThisDeps){
      var dep = allThisDeps[n]; //dep is a compound word
      var depArr = dep.split("_");
      //add everything to missing dep dict, regardless of if it is actually missing
      if (depArr[0] in missingDepDict){
        missingDepDict[depArr[0]].push(depArr[1]);
      }
      else{
        missingDepDict[depArr[0]] = [depArr[1]];
      }
    }
    //make a list of the not satisfied dependencies (as module implmenetation types)
    var notSatisfied = [];
    for (var depType in missingDepDict){
      var valueList = missingDepDict[depType];
      var satisfied = false;
      for (v of valueList){
        if (modImpSelections[depType] == v){
          satisfied = true;
        }
      }
      if (!satisfied){
        notSatisfied.push(depType);
      }
    }
    //make a dictionary of the actual missing deps
    var actualMissingDeps = {};
    for (dep of notSatisfied){
      actualMissingDeps[dep] = missingDepDict[dep];
    }
    //if there were even any missing things, add to outer dict
    if (Object.keys(actualMissingDeps).length > 0){
      missingModDepsDict[modType] = actualMissingDeps;
    }
  }
}

/*
function called when set button 1 is pressed
set the variable validModImpSelections
true if missingModDepsDict is empty, false otherwise
*/
function checkValidModImpSelections(){
  validModImpSelections = false;
  if (Object.keys(missingModDepsDict).length == 0){
    validModImpSelections = true;
  }
}

/*
if the module imlementation selections are a valid combination, then:
For all of the required module parameters
make a new div
in each div have the name of the requirement and a input text box
add them all to the modParametersDiv
the id of each input text box is the name of the parameter + input
*/
function makeParameterInputs(){
  document.getElementById("modParametersDiv").innerHTML = "";
  document.getElementById("modParametersDiv").style.width = inputsWidth;
  if (validModImpSelections){
    document.getElementById("modParametersDiv").innerHTML = "Required parameters for selected module implementations:";
    for (var req in allReqs){
      var newDiv = document.createElement("div");
      newDiv.id = req;
      newDiv.className = "req";
      newDiv.innerHTML += req;
      var textInput = document.createElement("INPUT");
      textInput.setAttribute("type", "text");
      textInput.style.float = "right";
      textInput.style.clear = "both";
      textInput.size = 10;
      textInput.id = req + "input";
      newDiv.appendChild(textInput);
      newDiv.innerHTML += "<br>";
      document.getElementById("modParametersDiv").appendChild(newDiv);
    }
  }
}

/*
If all dependencies are met, display links to wiki
If all dependencies are not met, display all necessary dependencies
all based on selected module implementations
In the depListDiv
*/
var depListPar = document.createElement("p");
document.getElementById("depListDiv").appendChild(depListPar);
function fillDepListPar(){
  if (validModImpSelections){
    depListPar.innerHTML = "The selected module implementation combination is valid.<br>";
    depListPar.innerHTML += "Click any of the links below to learn about the chosen implementations.<br><br>";
    for (var modType in modImpSelections){
      var modImp = modImpSelections[modType];
      var l = "https://github.com/niemasd/FAVITES/wiki/Module:-" + modType + "#" + modType + "_" + modImp;
      depListPar.innerHTML += modType + ': ' + '<a href=' + l + ' target="_blank">' + modImp + '</a>';
      depListPar.innerHTML += "<br>";
    }
  }
  else{
    depListPar.innerHTML = "The selected module implementation combination is not valid. <br>";
    depListPar.innerHTML += "The following required dependencies have not been satisfied: <br>";
    for (var modType in missingModDepsDict){
      depListPar.innerHTML += "<br>";
      var modImp = modImpSelections[modType];
      depListPar.innerHTML += modType + " " + modImp + " missing dependencies: ";
      depListPar.innerHTML += "<ul>";
      var thisMissingDeps = missingModDepsDict[modType];
      for (var dep in thisMissingDeps){
        depListPar.innerHTML += "<li>" + dep + ": " + thisMissingDeps[dep] + "</li>";
      }
      depListPar.innerHTML += "</ul>";
    }
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
exportButtonDiv.innerHTML = "<br>";
var previewButton = document.createElement("BUTTON");
var previewButtonText = document.createTextNode("PREVIEW selected configuration");
previewButton.appendChild(previewButtonText);
previewButton.addEventListener("click", previewConfig);
exportButtonDiv.appendChild(previewButton);
var exportButton = document.createElement("BUTTON");
var exportButtonText = document.createTextNode("EXPORT selected configuration");
exportButton.appendChild(exportButtonText);
exportButton.addEventListener("click", exportConfig);
exportButtonDiv.appendChild(exportButton);

/*
function that creates a string for the configuration file
uses the key/value pairs in modImpSelections and allReqs
*/
function getConfigString(){
  var lines = [];
  lines.push("{");
  lines.push("     # Module Implementations");
  for (m in modImpSelections){
    lines.push('     ' + '"' + m + '": ' + '"' + modImpSelections[m] + '",');
  }
  lines.push("");
  lines.push("     # Parameter Choices");
  for (p in allReqs){
    var val = allReqs[p];
    if (isNaN(val) || val == null || val == ''){ //if it is not a number
      lines.push('     ' + '"' + p + '": "' + val + '",');
    }
    else{ //if it is a number
      lines.push('     ' + '"' + p + '": ' + val + ',');
    }
  }
  lines.push("}");
  returnString = "";
  for (var n in lines){
    returnString += lines[n] + "\n";
  }
  return returnString;
}

/*
function to make alert when preview or export config button pressed
when the module implementation selections are invalid
*/
function warningAlert(){
  var w = "Warning! ";
  w += "The module implementations you have selected are not a valid configuration. ";
  w += "It is recommended that you change and reset your module implementation choices ";
  w += "to satisfy all required dependencies. ";
  alert(w);
}

/*
function that is called when the preview button is clicked
create json and open and display in a new tab
assumes that values have been chosen and both set buttons have been clicked
*/
function previewConfig(){
  if (!validModImpSelections){
    warningAlert();
  }
  var combinedDictString = getConfigString();
  var jsonPage = window.open();
  jsonPage.document.open();
  jsonPage.document.write("<title>" + outputFileName + "</title>");
  jsonPage.document.write("<html><body><pre>" + combinedDictString + "</pre></body></html>");
  jsonPage.document.close();
}

/*
function that is called when the export button is clicked
create json and allow user to save it in some location
assumes that values have been chosen and both set buttons have been clicked
*/
function exportConfig(){
  if (!validModImpSelections){
    warningAlert();
  }
  var combinedDictString = getConfigString();
  var link = document.createElement("a");
  link.href = "data:text/json," + encodeURIComponent(combinedDictString);
  link.download = outputFileName;
  link.click();
}
