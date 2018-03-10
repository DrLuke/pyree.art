/// <reference path="./WebGL2-TypeScript.d.ts" />

import { RainbowPyree } from "./src/RainbowPyree"
import {BaseGLProgram} from "./src/BaseGLProgram";


function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let program: BaseGLProgram = null;

declare global {
    interface Window { initGL: any; }
}


window.initGL = function(): boolean {
    {
        // Fet webgl context
        let canvas: HTMLCanvasElement = document.getElementById("pyreeheader") as HTMLCanvasElement;
        let gl: WebGL2RenderingContext = canvas.getContext("webgl2") as WebGL2RenderingContext;

        if (gl == null) // Init failed
        {
            console.log("Failed to fetch webgl2 context");  // TODO: Display placeholder svg maybe?
            return false;
        }

        // Choose random program to run
        let whichProgram = getRandomInt(0, 1);
        whichProgram = 0;   //TODO: remove hardcode
        switch (whichProgram) {
            case(0): {
                program = new RainbowPyree(gl);
            }
        }

        // Init program
        program.init();

        // Start infinite rendering loop
        requestAnimationFrame(tickGL);

        return true;
    }
};

function tickGL()
{
    let canvas: HTMLCanvasElement = document.getElementById("pyreeheader") as HTMLCanvasElement;
    let gl: WebGL2RenderingContext = canvas.getContext("webgl2") as WebGL2RenderingContext;

    let intFrameWidth = window.innerWidth;
    canvas.style.width = Math.floor(intFrameWidth * 0.6) + "px";
    let intFrameHeight = window.innerHeight;
    canvas.style.height = Math.floor(intFrameHeight * 0.7 * 0.85) + "px";

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);

    program.render(canvas.width, canvas.height);
    requestAnimationFrame(tickGL);
}