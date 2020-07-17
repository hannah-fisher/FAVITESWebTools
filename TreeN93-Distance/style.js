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
  "padding": "3px"
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
  "height": "115px",
  "top": "225px",
  "right": "450px",
  "border-style": "solid",
  "border-color": "black",
  "border-width": "1px",
  "background": "white",
  "padding": "5px"
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
  "height": "175px",
  "top": "25px",
  "right": "450px",
  "border-style": "solid",
  "border-color": "black",
  "border-width": "1px",
  "background": "white",
  "padding": "5px"
};
for (var k of Object.keys(buttons1DivStyle)){
  buttons1Div.style[k] = buttons1DivStyle[k];
}

/*
add some style to the buttons2 div
*/
var buttons2DivStyle = {
  "position": "fixed",
  "width": "200px",
  "height": "80px",
  "top": "25px",
  "right": "775px",
  "border-style": "solid",
  "border-color": "black",
  "border-width": "1px",
  "background": "white",
  "padding": "5px"
};
for (var k of Object.keys(buttons2DivStyle)){
  buttons2Div.style[k] = buttons2DivStyle[k];
}
