
// initialize ACE editor, set a few options
var editor = ace.edit("the-editor");
editor.setTheme("ace/theme/trans");
editor.getSession().setMode("ace/mode/java");
editor.getSession().setTabSize(2);

// compile processing code to js code, then run it
  var canvas = document.getElementById("sketch");
  var processingInstance;
  
  function startSketch() {
    // stop first if already running
    if(processingInstance) {
            stopSketch();
    }
    // get processing sketch source code from ACE editor
    var processingCode1 = editor.getValue();
    var processingCode = processingCode1.replace("&lt;", "<");
    // compile it using Processing JS 
    var jsCodeStr = Processing.compile(processingCode).sourceCode;
    var psCodeStr = jsCodeStr.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
    // evaluate it to actual JS code
    console.log(psCodeStr);
    var jsCode = eval(psCodeStr);
    // create new Processing instance, and associate to canvas
    processingInstance = new Processing(canvas, jsCode); 
    // put Processing sketch to run
    switchSketchState(true);
  }

  function stopSketch() {
    switchSketchState(false);
    processingInstance = null;
  }
  
  function switchSketchState(on) {
    if (processingInstance) {
      if (on) {
        processingInstance.loop();  // call Processing loop() function
      } else {
        processingInstance.noLoop(); // stop animation, call noLoop()
      }
    }
  }


