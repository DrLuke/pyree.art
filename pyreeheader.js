"use strict";
/// <reference path="./WebGL2-TypeScript.d.ts" />
exports.__esModule = true;
var RainbowPyree_1 = require("./src/RainbowPyree");
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var program = null;
window.initGL = function () {
    {
        // Fet webgl context
        var canvas = document.getElementById("pyreeheader");
        var gl = canvas.getContext("webgl2");
        if (gl == null) {
            console.log("Failed to fetch webgl2 context"); // TODO: Display placeholder svg maybe?
            return false;
        }
        // Choose random program to run
        var whichProgram = getRandomInt(0, 1);
        whichProgram = 0; //TODO: remove hardcode
        switch (whichProgram) {
            case (0): {
                program = new RainbowPyree_1.RainbowPyree(gl);
            }
        }
        // Init program
        program.init();
        // Start infinite rendering loop
        requestAnimationFrame(tickGL);
        return true;
    }
};
function tickGL() {
    var canvas = document.getElementById("pyreeheader");
    var gl = canvas.getContext("webgl2");
    var intFrameWidth = window.innerWidth;
    canvas.style.width = Math.floor(intFrameWidth * 0.6) + "px";
    var intFrameHeight = window.innerHeight;
    canvas.style.height = Math.floor(intFrameHeight * 0.7 * 0.85) + "px";
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    program.render(canvas.width, canvas.height);
    requestAnimationFrame(tickGL);
}
