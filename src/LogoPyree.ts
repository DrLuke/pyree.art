/// <reference path="../WebGL2-TypeScript.d.ts" />

import { BaseGLProgram } from "./BaseGLProgram";

export class LogoPyree extends BaseGLProgram {
    shaderProgram: WebGLProgram;
    vertexBuffer: WebGLBuffer;
    vao: WebGLVertexArrayObject;
    sdfTex: WebGLTexture = null;
    sdfImage: any;

    startTime: number;
    imageLoaded: boolean = false;


    init() {
        super.init();

        let gl:WebGL2RenderingContext = this.gl;

        gl.enable(gl.TEXTURE_2D);
        this.loadTexture();

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

        let fragCode: string = super.loadShaderCode("glsl/logo_frag.glsl");
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

    loadTexture() {
        let gl:WebGL2RenderingContext = this.gl;

        this.sdfImage = new Image();
        this.sdfImage.onload = this.onTextureLoaded.bind(this);
        this.sdfImage.src = "img/logo_sdf.png";
        console.log(this.sdfImage.src);
    }

    onTextureLoaded() {
        let gl:WebGL2RenderingContext = this.gl;

        this.sdfTex = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.sdfTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.sdfImage.width, this.sdfImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.sdfImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);

        this.imageLoaded = true;
    }

    render(width: number, height: number) {
        let gl = this.gl;

        if(!this.imageLoaded)
        {
            let d = new Date();
            this.startTime = d.getTime();
        }

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
            gl.uniform1f(loc, time);
        }
        loc = gl.getUniformLocation(this.shaderProgram, "res");
        if(loc != -1)
        {
            gl.uniform2f(loc, width, height);
        }

        loc = gl.getUniformLocation(this.shaderProgram, "logoRes");
        if(loc != -1)
        {
            gl.uniform2f(loc, this.sdfImage.width, this.sdfImage.height);
        }
        if(this.sdfTex != null)
        {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.sdfTex);
            loc = gl.getUniformLocation(this.shaderProgram, "logoTex");
            if(loc != -1)
            {
                gl.uniform1i(loc, 0);
            }
        }


        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}