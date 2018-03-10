/// <reference path="../WebGL2-TypeScript.d.ts" />

import { BaseGLProgram } from "./BaseGLProgram";

export class RainbowPyree extends BaseGLProgram {
    shaderProgram: WebGLProgram;
    vertexBuffer: WebGLBuffer;
    vao: WebGLVertexArrayObject;
    startTime: number;

    init() {
        super.init();

        let gl:WebGL2RenderingContext = this.gl;

        let vertices = [-1, 1,
                        -1, -1,
                        1, -1,
                        -1, 1,
                        1, 1,
                        1, -1];

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        let vertCode =
            '#version 300 es\n' +
            'in vec2 coordinates;\n' +
            'void main(void) {' + ' gl_Position = vec4(coordinates, 0.0, 1.0);' + '}';

        let fragCode: string = super.loadShaderCode("glsl/rainbow_frag.glsl");
        if(fragCode == null)    // Fallback
        {
            fragCode = '#version 300 es\n' +
                'precision highp float;\n' +
                'out vec4 outCol;' +
                'uniform float iTime;\n' +
                'void main(void) {' + 'outCol = vec4(sin(iTime), 0.3, 0.0, 1.);' + '}';
        }

        this.shaderProgram = super.compileShaders(vertCode, fragCode);

        this.vao = gl.createVertexArray();
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        let d = new Date();
        this.startTime = d.getTime();
    }

    render(width: number, height: number) {
        let gl = this.gl;

        gl.useProgram(this.shaderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindVertexArray(this.vao);

        gl.viewport(0, 0, width, height);
        gl.clearColor(0.5, 0.5, 0.5, 0.9);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let d = new Date();
        let time = d.getTime() - this.startTime;

        // Set uniforms
        let loc = gl.getUniformLocation(this.shaderProgram, "iTime");
        if(loc != -1)
        {
            gl.uniform1f(loc, time/1000.);
        }
        loc = gl.getUniformLocation(this.shaderProgram, "res");
        if(loc != -1)
        {
            gl.uniform2f(loc, width, height);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}