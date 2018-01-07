function initGL()
{
    var canvas = document.getElementById("pyreeheader")
    var gl = canvas.getContext("webgl")

    var vertices = [-1, 1, -1, -1, 1, -1, -1, 1, 1, 1, 1, -1];

    var vertex_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /* Step3: Create and compile Shader programs */

    // Vertex shader source code
    var vertCode =
        'attribute vec2 coordinates;' +
        'void main(void) {' + ' gl_Position = vec4(coordinates,0.0, 1.0);' + '}';

    //Create a vertex shader object
    var vertShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    var fragCode = 'void main(void) {' + 'gl_FragColor = vec4(0.0, 0.3, 0.0, 1.);' + '}';
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);

    gl.linkProgram(shaderProgram);

    gl.useProgram(shaderProgram);

    /* Step 4: Associate the shader programs to buffer objects */

    //Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    //Get the attribute location
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");

    //point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

    //Enable the attribute
    gl.enableVertexAttribArray(coord);


    requestAnimationFrame(tickGL);
}

function tickGL()
{
    var canvas = document.getElementById("pyreeheader");
    var gl = canvas.getContext("webgl");

    // TODO: Shader logic

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(tickGL);
}