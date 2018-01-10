var shaderProgram;

var d = new Date();
var tstart = d.getTime();
var time = tstart;

var mode = getRandomInt(0, 2);

var fontArial;

function initGL()
{
    var canvas = document.getElementById("pyreeheader")
    var gl = canvas.getContext("webgl2")

    var vertices = [-1, 1, -1, -1, 1, -1, -1, 1, 1, 1, 1, -1];

    var vertex_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var vertCode =
        '#version 300 es\n' +
        'in vec2 coordinates;\n' +
        '//out vec4 pos;\n' +
        'void main(void) {' + ' gl_Position = vec4(coordinates, 0.0, 1.0);' + '}';

    var vertShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    console.log('Shader compiler log: ' + gl.getShaderInfoLog(vertShader));

    var fragScript = document.getElementById("fshader");
    var fragCode;
    if(fragScript.type == "x-shader/x-fragment")
    {
        fragCode = fragScript.text;
    }
    else
    {
        fragCode = 'precision highp float;\n' +
            'uniform float iTime;\n' +
            'void main(void) {' + 'gl_FragColor = vec4(sin(iTime), 0.3, 0.0, 1.);' + '}';
    }

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    var compiled = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
    if(compiled == false)
    {
        console.log("FRAGMENT SHADER COMPILE ERROR:");
        console.log('Shader compiler log: ' + gl.getShaderInfoLog(fragShader));

        //return;
    }

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    console.log("link: " + gl.getProgramInfoLog(shaderProgram));

    //var coordAttribLoc = gl.getAttribLocation(shaderProgram, "coordinates");

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    /*var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    console.log(coord);
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);*/

    tstart = d.getTime()  - Math.random()*100000.;

    // Set up texture
    /*gl.enable(gl.TEXTURE_2D);
    fontArial = gl.createTexture();
    var arialImg = new Image();
    arialImg.onload = function() {fontLoaded(arialImg, fontArial)};
    arialImg.src = "foo.jpg";*/

    requestAnimationFrame(tickGL);
}

/*function fontLoaded(image, texture)
{
    var canvas = document.getElementById("pyreeheader")
    var gl = canvas.getContext("webgl")

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}*/

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function tickGL()
{
    var canvas = document.getElementById("pyreeheader");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    var gl = canvas.getContext("webgl2");

    d = new Date();
    time = (d.getTime() - tstart)/1000.;    // Calculate time since gl init

    // Set uniforms
    var loc = gl.getUniformLocation(shaderProgram, "iTime");
    if(loc != -1)
    {
        gl.uniform1f(loc, time);
    }

    loc = gl.getUniformLocation(shaderProgram, "res");
    if(loc != -1)
    {
        gl.uniform2f(loc, canvas.width, canvas.height);
    }

    loc = gl.getUniformLocation(shaderProgram, "mode");
    if(loc != -1)
    {
        gl.uniform1f(loc, mode);
    }


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(tickGL);
}