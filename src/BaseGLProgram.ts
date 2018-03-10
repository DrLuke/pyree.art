/// <reference path="../WebGL2-TypeScript.d.ts" />

export class BaseGLProgram {
    protected gl: WebGL2RenderingContext;

    constructor(glContext: WebGL2RenderingContext) {
        this.gl = glContext;
    }

    init() {
    }

    render(width: number, height: number) {

    }

    protected compileShaders(vertCode: string, fragCode: string): WebGLProgram  {
        // Create shaders
        let vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        let fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        // Compile shaders
        this.gl.shaderSource(vertShader, vertCode);
        this.gl.compileShader(vertShader);

        if(!this.gl.getShaderParameter(vertShader, this.gl.COMPILE_STATUS)) {
            console.log("VERTEX SHADER COMPILE ERROR:");
            console.log("Shader compiler log: " + this.gl.getShaderInfoLog(vertShader));
        }

        this.gl.shaderSource(fragShader, fragCode);
        this.gl.compileShader(fragShader);

        if(!this.gl.getShaderParameter(fragShader, this.gl.COMPILE_STATUS)) {
            console.log("FRAGMENT SHADER COMPILE ERROR:");
            console.log("Shader compiler log: " + this.gl.getShaderInfoLog(fragShader));
        }

        // Link shader program
        let shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertShader);
        this.gl.attachShader(shaderProgram, fragShader);
        this.gl.linkProgram(shaderProgram);

        if(!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            console.log("SHADER LINK ERROR:");
            console.log("Shader linker log: " + this.gl.getProgramInfoLog(shaderProgram));
        }

        return shaderProgram;
    }

    protected loadShaderCode(path: string): string {
        let request: XMLHttpRequest = new XMLHttpRequest();

        request.open("GET", path, false);   // Synchronous, as opengl init can't start without anyway
        request.send(null);

        if(request.status == 200)
        {
            return request.responseText;
        }
        else
        {
            console.log("ERROR: Respone to request from " + path + " was " + request.response);
            return null;
        }
    }
}