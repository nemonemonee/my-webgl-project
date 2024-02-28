// Name : Lingji Kong
// NetID: LKV6309
// Project C
var gl;
var g_canvasID;									// HTML-5 'canvas' element ID#

// For multiple VBOs & Shaders:-----------------
worldBox = new VBObox0();		  // Holds VBO & shaders for 3D 'world' ground-plane grid, etc;
gouraudBox = new VBObox1();		  // "  "  for first set of custom-shaded 3D parts
phongBox = new VBObox2();     // "  "  for second set of custom-shaded 3D parts

// For animation:---------------------
var g_lastMS = Date.now();			// Timestamp (in milliseconds) for our 
// most-recently-drawn WebGL screen contents.
// Set & used by moveAll() fcn to update all
// time-varying params for our webGL drawings.
// All time-dependent params (you can add more!)
var g_angleNow0 = 0.0; 			  // Current rotation angle, in degrees.
var g_angleRate0 = 45.0;				// Rotation angle rate, in degrees/second.
//---------------
var g_angleNow1 = 100.0;       // current angle, in degrees
var g_angleRate1 = 95.0;        // rotation angle rate, degrees/sec
var g_angleMax1 = 150.0;       // max, min allowed angle, in degrees
var g_angleMin1 = 60.0;
//---------------
var g_angleNow2 = 0.0; 			  // Current rotation angle, in degrees.
var g_angleRate2 = -62.0;				// Rotation angle rate, in degrees/second.

//---------------
var g_posNow0 = 0.0;           // current position
var g_posRate0 = 0.6;           // position change rate, in distance/second.
var g_posMax0 = 0.5;           // max, min allowed for g_posNow;
var g_posMin0 = -0.5;
// ------------------
var g_posNow1 = 0.0;           // current position
var g_posRate1 = 0.5;           // position change rate, in distance/second.
var g_posMax1 = 1.0;           // max, min allowed positions
var g_posMin1 = -1.0;
//---------------

// For mouse/keyboard:------------------------
var g_show0 = 1;								// 0==Show, 1==Hide VBO0 contents on-screen.
var g_show1 = 1;								// 	"					"			VBO1		"				"				" 
var g_show2 = 1;                //  "         "     VBO2    "       "       "


g_worldMat = mat4.create();
var fovy = 40 / 180 * Math.PI;
var z_near = 1.0;
var z_far = 200.0;
var projectionMat = mat4.create();

var eye = vec3.create();
var look_at = vec3.create();
var up = vec3.create();
vec3.set(eye, 5.0, 5.0, 3.0);
vec3.set(look_at, 0.0, 0.0, 0.0);
vec3.set(up, 0.0, 0.0, 1.0);

var camera_translation_ratio = .05;
var camera_rotation_ratio = .02;


function main() {
//=============================================================================
    // Retrieve the HTML-5 <canvas> element where webGL will draw our pictures:
    g_canvasID = document.getElementById('webgl');
    gl = g_canvasID.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.clearColor(0.2, 0.2, 0.2, 1);	  // RGBA color for clearing <canvas>

    gl.enable(gl.DEPTH_TEST);

    /*
  //----------------SOLVE THE 'REVERSED DEPTH' PROBLEM:------------------------
    // IF the GPU doesn't transform our vertices by a 3D Camera Projection Matrix
    // (and it doesn't -- not until Project B) then the GPU will compute reversed
    // depth values:  depth==0 for vertex z == -1;   (but depth = 0 means 'near')
    //		    depth==1 for vertex z == +1.   (and depth = 1 means 'far').
    //
    // To correct the 'REVERSED DEPTH' problem, we could:
    //  a) reverse the sign of z before we render it (e.g. scale(1,1,-1); ugh.)
    //  b) reverse the usage of the depth-buffer's stored values, like this:
    gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.

    gl.clearDepth(0.0);       // each time we 'clear' our depth buffer, set all
                              // pixel depths to 0.0  (1.0 is DEFAULT)
    gl.depthFunc(gl.GREATER); // draw a pixel only if its depth value is GREATER
                              // than the depth buffer's stored value.
                              // (gl.LESS is DEFAULT; reverse it!)
    //------------------end 'REVERSED DEPTH' fix---------------------------------
  */

    // Initialize each of our 'vboBox' objects:
    worldBox.init(gl);		// VBO + shaders + uniforms + attribs for our 3D world,
    // including ground-plane,
    gouraudBox.init(gl);		//  "		"		"  for 1st kind of shading & lighting
    phongBox.init(gl);    //  "   "   "  for 2nd kind of shading & lighting
    
    setCamera();				// TEMPORARY: set a global camera used by ALL VBObox objects...

    gl.clearColor(0.2, 0.2, 0.2, 1);	  // RGBA color for clearing <canvas>
    
    // ==============ANIMATION=============
    // Quick tutorials on synchronous, real-time animation in JavaScript/HTML-5:
    //    https://webglfundamentals.org/webgl/lessons/webgl-animation.html
    //  or
    //  	http://creativejs.com/resources/requestanimationframe/
    //		--------------------------------------------------------
    // Why use 'requestAnimationFrame()' instead of the simpler-to-use
    //	fixed-time setInterval() or setTimeout() functions?  Because:
    //		1) it draws the next animation frame 'at the next opportunity' instead
    //			of a fixed time interval. It allows your browser and operating system
    //			to manage its own processes, power, & computing loads, and to respond
    //			to on-screen window placement (to skip battery-draining animation in
    //			any window that was hidden behind others, or was scrolled off-screen)
    //		2) it helps your program avoid 'stuttering' or 'jittery' animation
    //			due to delayed or 'missed' frames.  Your program can read and respond
    //			to the ACTUAL time interval between displayed frames instead of fixed
    //		 	fixed-time 'setInterval()' calls that may take longer than expected.
    //------------------------------------

    document.addEventListener('keydown', function(event) {
      switch (event.key) {
          case 'w' :
          case 'W' : 
              move(1);
              break;
          case 's' :
          case 'S' :  
              move(0);
              break;
          case 'a' :
          case 'A' :
              strafe(1);
              break;
          case 'd' :
          case 'D' :
              strafe(0);
              break;
          case 'q' :
          case 'Q' :
          case'ArrowLeft':
              turn(1);
              break
          case 'e' :
          case 'E' :
          case 'ArrowRight':
              turn(0);
              break
          case 'ArrowUp':
              tilt(0);
              break;
          case 'ArrowDown':
              tilt(1);
              break;
          case 'i':
          case 'I':
              zoom(1);
              break;
          case 'o':
          case 'O':
              zoom(0);
              break;
      }
      updateCamera();
    });
    var tick = function () {		    // locally (within main() only), define our
        // self-calling animation function.
        requestAnimationFrame(tick, g_canvasID); // browser callback request; wait
        // til browser is ready to re-draw canvas, then
        timerAll();  // Update all time-varying params, and
        drawAndResize();               // Draw all the VBObox contents
    };
    tick();  
    drawAndResize();                   // do it again!
}

function timerAll() {
//=============================================================================
// Find new values for all time-varying parameters used for on-screen drawing
    // use local variables to find the elapsed time.
    var nowMS = Date.now();             // current time (in milliseconds)
    var elapsedMS = nowMS - g_lastMS;   //
    g_lastMS = nowMS;                   // update for next webGL drawing.
    if (elapsedMS > 1000.0) {
        // Browsers won't re-draw 'canvas' element that isn't visible on-screen
        // (user chose a different browser tab, etc.); when users make the browser
        // window visible again our resulting 'elapsedMS' value has gotten HUGE.
        // Instead of allowing a HUGE change in all our time-dependent parameters,
        // let's pretend that only a nominal 1/30th second passed:
        elapsedMS = 1000.0 / 30.0;
    }
    // Find new time-dependent parameters using the current or elapsed time:
    // Continuous rotation:
    g_angleNow0 = g_angleNow0 + (g_angleRate0 * elapsedMS) / 1000.0;
    g_angleNow1 = g_angleNow1 + (g_angleRate1 * elapsedMS) / 1000.0;
    g_angleNow2 = g_angleNow2 + (g_angleRate2 * elapsedMS) / 1000.0;
    g_angleNow0 %= 360.0;   // keep angle >=0.0 and <360.0 degrees
    g_angleNow1 %= 360.0;
    g_angleNow2 %= 360.0;
    if (g_angleNow1 > g_angleMax1) { // above the max?
        g_angleNow1 = g_angleMax1;    // move back down to the max, and
        g_angleRate1 = -g_angleRate1; // reverse direction of change.
    } else if (g_angleNow1 < g_angleMin1) {  // below the min?
        g_angleNow1 = g_angleMin1;    // move back up to the min, and
        g_angleRate1 = -g_angleRate1;
    }
    // Continuous movement:
    g_posNow0 += g_posRate0 * elapsedMS / 1000.0;
    g_posNow1 += g_posRate1 * elapsedMS / 1000.0;
    // apply position limits
    if (g_posNow0 > g_posMax0) {   // above the max?
        g_posNow0 = g_posMax0;      // move back down to the max, and
        g_posRate0 = -g_posRate0;   // reverse direction of change
    } else if (g_posNow0 < g_posMin0) {  // or below the min?
        g_posNow0 = g_posMin0;      // move back up to the min, and
        g_posRate0 = -g_posRate0;   // reverse direction of change.
    }
    if (g_posNow1 > g_posMax1) {   // above the max?
        g_posNow1 = g_posMax1;      // move back down to the max, and
        g_posRate1 = -g_posRate1;   // reverse direction of change
    } else if (g_posNow1 < g_posMin1) {  // or below the min?
        g_posNow1 = g_posMin1;      // move back up to the min, and
        g_posRate1 = -g_posRate1;   // reverse direction of change.
    }

}

function drawAll() {
//=============================================================================
    // Clear on-screen HTML-5 <canvas> object:

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var b4Draw = Date.now();
    var b4Wait = b4Draw - g_lastMS;

    if (g_show0 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
        worldBox.switchToMe();  // Set WebGL to render from this VBObox.
        worldBox.adjust();		  // Send new values for uniforms to the GPU, and
        worldBox.draw();			  // draw our VBO's contents using our shaders.
    }
    if (g_show1 == 1) { // IF user didn't press HTML button to 'hide' VBO1:
        gouraudBox.switchToMe();  // Set WebGL to render from this VBObox.
        gouraudBox.adjust();		  // Send new values for uniforms to the GPU, and
        gouraudBox.draw();			  // draw our VBO's contents using our shaders.
    }
    if (g_show2 == 1) { // IF user didn't press HTML button to 'hide' VBO2:
        phongBox.switchToMe();  // Set WebGL to render from this VBObox.
        phongBox.adjust();		  // Send new values for uniforms to the GPU, and
        phongBox.draw();			  // draw our VBO's contents using our shaders.
    }
    /* // ?How slow is our own code?
    var aftrDraw = Date.now();
    var drawWait = aftrDraw - b4Draw;
    console.log("wait b4 draw: ", b4Wait, "drawWait: ", drawWait, "mSec");
    */
}

function drawAndResize() {
  var xtraMargin = 20;
  g_canvasID.width = innerWidth - xtraMargin;
  g_canvasID.height = (innerHeight * .7) - xtraMargin;
  setCamera();
  drawAll();
}

function VBO0toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO0'.
    if (g_show0 != 1) g_show0 = 1;				// show,
    else g_show0 = 0;										// hide.
    console.log('g_show0: ' + g_show0);
}

function VBO1toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO1'.
    if (g_show1 != 1) g_show1 = 1;			// show,
    else g_show1 = 0;									// hide.
    console.log('g_show1: ' + g_show1);
}

function VBO2toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO2'.
    if (g_show2 != 1) g_show2 = 1;			// show,
    else g_show2 = 0;									// hide.
    console.log('g_show2: ' + g_show2);
}

function setCamera() {
    gl.viewport(0,
      0,
      g_canvasID.width,
      g_canvasID.height);
    var aspect = g_canvasID.width / g_canvasID.height;
    mat4.identity(g_worldMat);
    // var aspect = (innerWidth - xtraMargin) / ((innerHeight * .7) - xtraMargin);
    mat4.perspective(projectionMat, fovy, aspect, z_near, z_far);
    updateCamera();
}


function updateCamera() {
    var lookAtMat = mat4.create();
    mat4.lookAt(lookAtMat, eye, look_at, up);
    mat4.multiply(g_worldMat, projectionMat, lookAtMat);
}

function calculate_gaze() {
  var neg_eye = vec3.create();
  vec3.negate(neg_eye, eye);
  var gaze = vec3.create();
  vec3.add(gaze, look_at, neg_eye);
  vec3.normalize(gaze, gaze);
  return gaze;
}

function strafe(dir){
  dir = dir * 2 - 1;
  var left = vec3.create();
  vec3.cross(left, up, calculate_gaze());
  left[2] = 0;
  if (vec3.length(left) != 0)    vec3.normalize(left, left);
  else vec3.set(left, -1, 0, 0);
  vec3.scaleAndAdd(eye, eye, left, camera_translation_ratio * dir);
  vec3.scaleAndAdd(look_at, look_at, left, camera_translation_ratio * dir);
}

function move(dir) {
  dir = dir * 2 - 1;
  var gaze = calculate_gaze();
  var forward = vec3.create();
  vec3.set(forward, gaze[0], gaze[1], 0);
  if (vec3.length(forward) != 0)    vec3.normalize(forward, forward);
  else vec3.set(forward, 0, 1, 0);
  vec3.scaleAndAdd(eye, eye, forward, camera_translation_ratio * dir);
  vec3.scaleAndAdd(look_at, look_at, forward, camera_translation_ratio * dir);
}

function turn(dir) {
  dir = dir * 2 - 1;
  var q = quat.create();
  quat.setAxisAngle(q, up, camera_rotation_ratio * dir);
  var gaze = calculate_gaze();
  vec3.transformQuat(gaze, gaze, q);
  vec3.add(look_at, eye, gaze);
}

function tilt(dir) {
  dir = dir * 2 - 1;
  var gaze = calculate_gaze();
  var right = vec3.create();
  vec3.cross(right, up, gaze);
  if (vec3.length(right) != 0)    vec3.normalize(right, right);
  else vec3.set(right, 1, 0, 0);
  var q = quat.create();
  quat.setAxisAngle(q, right, camera_rotation_ratio * dir);
  vec3.transformQuat(gaze, gaze, q);
  vec3.add(look_at, eye, gaze);
}
