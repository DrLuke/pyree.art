(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
/// <reference path="./WebGL2-TypeScript.d.ts" />
exports.__esModule = true;
var RainbowPyree_1 = require("./src/RainbowPyree");
var LogoPyree_1 = require("./src/LogoPyree");
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
        whichProgram = 1; //TODO: remove hardcode
        switch (whichProgram) {
            case (0): {
                program = new RainbowPyree_1.RainbowPyree(gl);
            }
            case (1): {
                program = new LogoPyree_1.LogoPyree(gl);
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

},{"./src/LogoPyree":3,"./src/RainbowPyree":4}],2:[function(require,module,exports){
"use strict";
/// <reference path="../WebGL2-TypeScript.d.ts" />
exports.__esModule = true;
var BaseGLProgram = /** @class */ (function () {
    function BaseGLProgram(glContext) {
        this.gl = glContext;
    }
    BaseGLProgram.prototype.init = function () {
    };
    BaseGLProgram.prototype.render = function (width, height) {
    };
    BaseGLProgram.prototype.compileShaders = function (vertCode, fragCode) {
        // Create shaders
        var vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        var fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        // Compile shaders
        this.gl.shaderSource(vertShader, vertCode);
        this.gl.compileShader(vertShader);
        if (!this.gl.getShaderParameter(vertShader, this.gl.COMPILE_STATUS)) {
            console.log("VERTEX SHADER COMPILE ERROR:");
            console.log("Shader compiler log: " + this.gl.getShaderInfoLog(vertShader));
        }
        this.gl.shaderSource(fragShader, fragCode);
        this.gl.compileShader(fragShader);
        if (!this.gl.getShaderParameter(fragShader, this.gl.COMPILE_STATUS)) {
            console.log("FRAGMENT SHADER COMPILE ERROR:");
            console.log("Shader compiler log: " + this.gl.getShaderInfoLog(fragShader));
        }
        // Link shader program
        var shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertShader);
        this.gl.attachShader(shaderProgram, fragShader);
        this.gl.linkProgram(shaderProgram);
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            console.log("SHADER LINK ERROR:");
            console.log("Shader linker log: " + this.gl.getProgramInfoLog(shaderProgram));
        }
        return shaderProgram;
    };
    BaseGLProgram.prototype.loadShaderCode = function (path) {
        var request = new XMLHttpRequest();
        request.open("GET", path, false); // Synchronous, as opengl init can't start without anyway
        request.send(null);
        if (request.status == 200) {
            return request.responseText;
        }
        else {
            console.log("ERROR: Respone to request from " + path + " was " + request.response);
            return null;
        }
    };
    return BaseGLProgram;
}());
exports.BaseGLProgram = BaseGLProgram;

},{}],3:[function(require,module,exports){
"use strict";
/// <reference path="../WebGL2-TypeScript.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var BaseGLProgram_1 = require("./BaseGLProgram");
var LogoPyree = /** @class */ (function (_super) {
    __extends(LogoPyree, _super);
    function LogoPyree() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sdfTex = null;
        _this.imageLoaded = false;
        return _this;
    }
    LogoPyree.prototype.init = function () {
        _super.prototype.init.call(this);
        var gl = this.gl;
        gl.enable(gl.TEXTURE_2D);
        this.loadTexture();
        var vertices = [-1, 1,
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
            1, -1];
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        var vertCode = '#version 300 es\n' +
            'in vec2 coordinates;\n' +
            'void main(void) {' + ' gl_Position = vec4(coordinates, 0.0, 1.0);' + '}';
        var fragCode = _super.prototype.loadShaderCode.call(this, "glsl/logo_frag.glsl");
        if (fragCode == null) {
            fragCode = '#version 300 es\n' +
                'precision highp float;\n' +
                'out vec4 outCol;' +
                'uniform float iTime;\n' +
                'void main(void) {' + 'outCol = vec4(sin(iTime), 0.3, 0.0, 1.);' + '}';
        }
        this.shaderProgram = _super.prototype.compileShaders.call(this, vertCode, fragCode);
        this.vao = gl.createVertexArray();
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        var d = new Date();
        this.startTime = d.getTime();
        var min = 1;
        var max = 2;
        this.mode = Math.floor(Math.random() * (max - min + 1)) + min;
    };
    LogoPyree.prototype.loadTexture = function () {
        var gl = this.gl;
        this.sdfImage = new Image();
        this.sdfImage.onload = this.onTextureLoaded.bind(this);
        this.sdfImage.src = "img/logo_sdf.png";
        console.log(this.sdfImage.src);
    };
    LogoPyree.prototype.onTextureLoaded = function () {
        var gl = this.gl;
        this.sdfTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.sdfTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.sdfImage.width, this.sdfImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.sdfImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        this.imageLoaded = true;
    };
    LogoPyree.prototype.render = function (width, height) {
        var gl = this.gl;
        if (!this.imageLoaded) {
            var d_1 = new Date();
            this.startTime = d_1.getTime();
        }
        gl.useProgram(this.shaderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindVertexArray(this.vao);
        gl.viewport(0, 0, width, height);
        gl.clearColor(0.5, 0.5, 0.5, 0.9);
        gl.clear(gl.COLOR_BUFFER_BIT);
        var d = new Date();
        var time = d.getTime() - this.startTime;
        // Set uniforms
        var loc = gl.getUniformLocation(this.shaderProgram, "iTime");
        if (loc != -1) {
            gl.uniform1f(loc, time);
        }
        loc = gl.getUniformLocation(this.shaderProgram, "mode");
        if (loc != -1) {
            gl.uniform1i(loc, this.mode);
        }
        loc = gl.getUniformLocation(this.shaderProgram, "res");
        if (loc != -1) {
            gl.uniform2f(loc, width, height);
        }
        loc = gl.getUniformLocation(this.shaderProgram, "logoRes");
        if (loc != -1) {
            gl.uniform2f(loc, this.sdfImage.width, this.sdfImage.height);
        }
        if (this.sdfTex != null) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.sdfTex);
            loc = gl.getUniformLocation(this.shaderProgram, "logoTex");
            if (loc != -1) {
                gl.uniform1i(loc, 0);
            }
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    return LogoPyree;
}(BaseGLProgram_1.BaseGLProgram));
exports.LogoPyree = LogoPyree;

},{"./BaseGLProgram":2}],4:[function(require,module,exports){
"use strict";
/// <reference path="../WebGL2-TypeScript.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var BaseGLProgram_1 = require("./BaseGLProgram");
var RainbowPyree = /** @class */ (function (_super) {
    __extends(RainbowPyree, _super);
    function RainbowPyree() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RainbowPyree.prototype.init = function () {
        _super.prototype.init.call(this);
        var gl = this.gl;
        var vertices = [-1, 1,
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
            1, -1];
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        var vertCode = '#version 300 es\n' +
            'in vec2 coordinates;\n' +
            'void main(void) {' + ' gl_Position = vec4(coordinates, 0.0, 1.0);' + '}';
        var fragCode = _super.prototype.loadShaderCode.call(this, "glsl/rainbow_frag.glsl");
        if (fragCode == null) {
            fragCode = '#version 300 es\n' +
                'precision highp float;\n' +
                'out vec4 outCol;' +
                'uniform float iTime;\n' +
                'void main(void) {' + 'outCol = vec4(sin(iTime), 0.3, 0.0, 1.);' + '}';
        }
        this.shaderProgram = _super.prototype.compileShaders.call(this, vertCode, fragCode);
        this.vao = gl.createVertexArray();
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        var d = new Date();
        this.startTime = d.getTime();
    };
    RainbowPyree.prototype.loadTextures = function () {
    };
    RainbowPyree.prototype.render = function (width, height) {
        var gl = this.gl;
        gl.useProgram(this.shaderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindVertexArray(this.vao);
        gl.viewport(0, 0, width, height);
        gl.clearColor(0.5, 0.5, 0.5, 0.9);
        gl.clear(gl.COLOR_BUFFER_BIT);
        var d = new Date();
        var time = d.getTime() - this.startTime;
        // Set uniforms
        var loc = gl.getUniformLocation(this.shaderProgram, "iTime");
        if (loc != -1) {
            gl.uniform1f(loc, time);
        }
        loc = gl.getUniformLocation(this.shaderProgram, "res");
        if (loc != -1) {
            gl.uniform2f(loc, width, height);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    return RainbowPyree;
}(BaseGLProgram_1.BaseGLProgram));
exports.RainbowPyree = RainbowPyree;

},{"./BaseGLProgram":2}]},{},[1]);
