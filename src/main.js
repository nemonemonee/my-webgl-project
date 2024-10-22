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

var g_show0 = 1;

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
var gaze = vec3.create();
var left = vec3.create();

var turned = true;

var light_on_ambi = true;
var light_on_diff = true;
var light_on_spec = true;
var light_on_head = true;
var light_pos = new Float32Array([1, 8, 9]);
var ambient_col = new Float32Array([1, 1, 1]);
var diffuse_col = new Float32Array([.8, .8, .8]);
var specular_col = new Float32Array([.8, .8, .8]);

var ambient_col_head = new Float32Array([.3, .3, .3]);
var diffuse_col_head = new Float32Array([.2, .2, .2]);
var specular_col_head = new Float32Array([.4, .4, .4]);
var isBlinn = 0;
var isPhong = 0;


var matl_id = 20;


var C = 0;
var c_rate = 0.1;
var is_Distort = 1;
var rab_rotate = 1;
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
    worldBox.init(gl);		// VBO + shaders + uniforms + attribs for our 3D world,
    // including ground-plane,
    gouraudBox.init(gl);		//  "		"		"  for 1st kind of shading & lighting
    phongBox.init(gl);    //  "   "   "  for 2nd kind of shading & lighting
    setCamera();

    document.addEventListener('keydown', function (event) {
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
    drawAndResize();
}

function timerAll() {
    var nowMS = Date.now();             // current time (in milliseconds)
    var elapsedMS = nowMS - g_lastMS;   //
    g_lastMS = nowMS;                   // update for next webGL drawing.
    if (elapsedMS > 1000.0) {
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

    C += c_rate;
    C %= 2 * Math.PI;

}

function drawAll() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var b4Draw = Date.now();
    var b4Wait = b4Draw - g_lastMS;

    if (g_show0 === 1) {
        worldBox.switchToMe();
        worldBox.adjust();
        worldBox.draw();
    }
    if (isPhong === 0) {
        gouraudBox.switchToMe();
        gouraudBox.adjust();
        gouraudBox.draw();
    }
    if (isPhong === 1) {
        phongBox.switchToMe();
        phongBox.adjust();
        phongBox.draw();
    }
}

function drawAndResize() {
    var xtraMargin = 20;
    g_canvasID.width = innerWidth - xtraMargin;
    g_canvasID.height = (innerHeight * .7) - xtraMargin;
    setCamera();
    drawAll();
}

function VBO0toggle() {
    if (g_show0 !== 1) g_show0 = 1;
    else g_show0 = 0;
    console.log('g_show0: ' + g_show0);
}

function setCamera() {
    gl.viewport(0, 0, g_canvasID.width, g_canvasID.height);
    var aspect = g_canvasID.width / g_canvasID.height;
    mat4.identity(g_worldMat);
    mat4.perspective(projectionMat, fovy, aspect, z_near, z_far);
    updateCamera();
}


function updateCamera() {
    var lookAtMat = mat4.create();
    mat4.lookAt(lookAtMat, eye, look_at, up);
    mat4.multiply(g_worldMat, projectionMat, lookAtMat);
    calculate_gaze();
}

function calculate_gaze() {
    var neg_eye = vec3.create();
    vec3.negate(neg_eye, eye);
    vec3.add(gaze, look_at, neg_eye);
    vec3.normalize(gaze, gaze);
    if (turned) {
        vec3.cross(left, up, gaze);
        turned = false;
    }
}

function strafe(dir) {
    dir = dir * 2 - 1;
    var strafe_v = vec3.create();
    vec3.set(strafe_v, left[0], left[1], 0)
    if (vec3.length(strafe_v) !== 0) vec3.normalize(strafe_v, strafe_v);
    else vec3.set(strafe_v, -1, 0, 0);
    vec3.scaleAndAdd(eye, eye, strafe_v, camera_translation_ratio * dir);
    vec3.scaleAndAdd(look_at, look_at, strafe_v, camera_translation_ratio * dir);
}

function move(dir) {
    dir = dir * 2 - 1;
    var forward_v = vec3.create();
    vec3.set(forward_v, gaze[0], gaze[1], 0);
    if (vec3.length(forward_v) !== 0) vec3.normalize(forward_v, forward_v);
    else vec3.set(forward_v, 0, 1, 0);
    vec3.scaleAndAdd(eye, eye, forward_v, camera_translation_ratio * dir);
    vec3.scaleAndAdd(look_at, look_at, forward_v, camera_translation_ratio * dir);
}

function zoom(dir) {
    dir = dir * 2 - 1;
    vec3.scaleAndAdd(eye, eye, gaze, camera_translation_ratio * dir);
    vec3.scaleAndAdd(look_at, look_at, gaze, camera_translation_ratio * dir);
}

function turn(dir) {
    dir = dir * 2 - 1;
    var q = quat.create();
    quat.setAxisAngle(q, up, camera_rotation_ratio * dir);
    vec3.transformQuat(gaze, gaze, q);
    vec3.add(look_at, eye, gaze);
    turned = true;
}

function tilt(dir) {
    dir = dir * 2 - 1;
    var q = quat.create();
    quat.setAxisAngle(q, left, camera_rotation_ratio * dir);
    vec3.transformQuat(gaze, gaze, q);
    vec3.add(look_at, eye, gaze);
}


function updateShading(value) {
    isPhong = parseInt(value, 10);
}


function updateLighting(value) {
    isBlinn = parseInt(value, 10);
}

function updateMaterial(value) {
    matl_id = parseInt(value, 10);
}

function head_switch() {
    if (light_on_head) {
        light_on_head = false;
        ambient_head_temp = ambient_col;
        ambient_col_head = new Float32Array([0,0,0]);
        diffuse_head_temp = diffuse_col_head;
        diffuse_col_head = new Float32Array([0,0,0]);
        speculr_head_temp = specular_col_head;
        specular_col_head = new Float32Array([0,0,0]);
        document.getElementById('switchHed').innerHTML = "off";
    } else {
        light_on_head = true;
        ambient_col_head = ambient_head_temp;
        diffuse_col_head = diffuse_head_temp;
        specular_col_head = speculr_head_temp;
        document.getElementById('switchHed').innerHTML = "on";
    }
}
function ambi_switch() {
    if (light_on_ambi) {
        light_on_ambi = false;
        ambient_temp = ambient_col;
        ambient_col = new Float32Array([0,0,0]);
        document.getElementById('switchAmb').innerHTML = "off";
    } else {
        light_on_ambi = true;
        ambient_col = ambient_temp;
        document.getElementById('switchAmb').innerHTML = "on";
    }
}

function diff_switch() {
    if (light_on_diff) {
        light_on_diff = false;
        diffuse_temp = diffuse_col;
        diffuse_col = new Float32Array([0,0,0]);
        document.getElementById('switchDif').innerHTML = "off";
    } else {
        light_on_diff = true;
        diffuse_col = diffuse_temp;
        document.getElementById('switchDif').innerHTML = "on";
    }
}

function spec_switch() {
    if (light_on_spec) {
        light_on_spec = false;
        speculr_temp = specular_col;
        specular_col = new Float32Array([0,0,0]);
        document.getElementById('switchSpc').innerHTML = "off";
    } else {
        light_on_spec = true;
        specular_col = speculr_temp;
        document.getElementById('switchSpc').innerHTML = "on";
    }
}

function updateLightX(value) {
    document.getElementById('lightX').innerHTML = value;
    light_pos[0] = parseFloat(value);
}
function updateLightY(value) {
    document.getElementById('lightY').innerHTML = value;
    light_pos[1] = parseFloat(value);
}
function updateLightZ(value) {
    document.getElementById('lightZ').innerHTML = value;
    light_pos[2] = parseFloat(value);
}

function hexToRgb(hex) {
    hex = hex.substring(1);
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return new Float32Array([r, g, b]);
}
function updateAmbient(hex) {
    var color = hexToRgb(hex);
    ambient_col[0] = color[0] / 255;
    ambient_col[1] = color[1] / 255;
    ambient_col[2] = color[2] / 255;
}

function updateDiffuse(hex) {
    var color = hexToRgb(hex);
    diffuse_col[0] = color[0] / 255;
    diffuse_col[1] = color[1] / 255;
    diffuse_col[2] = color[2] / 255;
}
function updateSpecular(hex) {
    var color = hexToRgb(hex);
    specular_col[0] = color[0] / 255;
    specular_col[1] = color[1] / 255;
    specular_col[2] = color[2] / 255;
}

function distortion_switch() {
    if (is_Distort === 1) {
        is_Distort = 0
    } else {
        is_Distort = 1
    }
}

function angle0switch() {
    if (rab_rotate === 1) {
        rab_rotate = 0;
        g_angleRate0_temp = g_angleRate0;
        g_angleRate0 = 0;
    } else {
        rab_rotate = 1;
        g_angleRate0 = g_angleRate0_temp;
    }

}
