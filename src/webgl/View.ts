import * as THREE from "three";

import Photo from "./Photo";
import SpringGenerator from "./SpringGenerator";
import Brush from "./Brush";
import { Clock } from "../utils";

export default class PhotoView {
    // Main classes
    private clock: Clock;
    private brush: Brush;
    private photo: Photo;
    private springGen: SpringGenerator;
    private svgElem: SVGElement;

    // General properties
    private rendering: boolean;
    private fpsCap: boolean;
    private autoBrush: boolean;
    private vp: THREE.Vector3;
    private photoSize: THREE.Vector2;
    private subdivs: THREE.Vector2;
    private scene: THREE.Scene;
    private cam: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private springTex: THREE.Texture;

    constructor(canvasElem: HTMLCanvasElement, svgElem: SVGElement) {
        // General props
        this.rendering = false;
        this.fpsCap = false;
        this.autoBrush = true;
        this.subdivs = new THREE.Vector2(3 * 32, 4 * 32);

        // Three.js boilerplate
        this.vp = new THREE.Vector3(
            window.innerWidth,
            window.innerHeight,
            window.innerWidth / window.innerHeight
        );
        this.scene = new THREE.Scene();
        this.cam = new THREE.OrthographicCamera(-1, 1, 10, -10, -10, 10);
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasElem,
            antialias: false,
            alpha: true,
            stencil: false,
        });
        this.svgElem = svgElem;

        // Main classes
        this.photoSize = new THREE.Vector2(this.vp.x, this.vp.y).multiplyScalar(0.5);
        this.clock = new Clock();
        this.brush = new Brush(svgElem, this.photoSize, this.vp);
        this.springGen = new SpringGenerator(
            this.renderer,
            this.subdivs,
            this.brush.getStartPos(),
            this.brush.getNowPos()
        );
        this.photo = new Photo(this.subdivs);
        this.scene.add(this.photo.getMesh());

        // Start drag
        canvasElem.addEventListener("mousedown", this.onMouseDown);
        canvasElem.addEventListener("touchstart", this.onMouseDown);
        // Drag move
        canvasElem.addEventListener("mousemove", this.onMouseMove);
        canvasElem.addEventListener("touchmove", this.onMouseMove);
        // Stop drag
        canvasElem.addEventListener("mouseup", this.onMouseUp);
        canvasElem.addEventListener("touchend", this.onMouseUp);
        canvasElem.addEventListener("mouseout", this.onMouseOut);
        // Mouse wheel
        canvasElem.addEventListener("wheel", this.onMouseWheel);
        this.onMouseWheel({deltaY: 0});

        // Fire up rendering loop
        this.onResize(window.innerWidth, window.innerHeight);
        this.update(0);
    }

    // ******************* PUBLIC METHODS ******************* //
    public loadImage(url: string): void {
        this.photo.loadImage(url);
        this.resumeRender();
    }

    public pauseRender(): void {
        this.rendering = false;
    }

    public resumeRender(): void {
        this.rendering = true;
    }

    public onResize(vpW: number, vpH: number): void {
        this.vp.set(vpW, vpH, vpW / vpH);
        this.renderer.setSize(this.vp.x, this.vp.y);
        this.svgElem.setAttribute("viewBox", `0 0 ${this.vp.x} ${this.vp.y}`);
        this.cam.left = -10 * this.vp.z;
        this.cam.right = 10 * this.vp.z;
        this.cam.updateProjectionMatrix();

        this.photoSize.set(this.vp.y * 0.75, this.vp.y).multiplyScalar(0.5);
        this.brush.onResize(this.vp);
    }

    // ******************* MOUSE EVENT LISTENERS ******************* //
    private onMouseDown = (event): void => {
        // this.renderer.domElement.style.cursor = "grabbing";
        this.autoBrush = false;
        this.brush.pressDown(event.layerX, event.layerY);
        event.preventDefault();
    }

    private onMouseMove = (event): void => {
        if (this.autoBrush === false) {
            this.brush.move(event.layerX, event.layerY);
        }
        event.preventDefault();
    }

    private onMouseUp = (event): void => {
        // this.renderer.domElement.style.cursor = "grab";
        this.brush.release();
        event.preventDefault();
    }

    private onMouseOut = (event): void => {
        this.brush.outOfBounds();
        event.preventDefault();
    }

    private onMouseWheel = (event): void => {
        let bSize = this.brush.scale(event.deltaY * 0.3, this.subdivs.y);
        this.springGen.setMouseSize(bSize);
    }

    // ******************* UPDATE ******************* //
    private update = (_t): void => {
        if (this.rendering && !this.fpsCap) {
            this.clock.update(_t);
            this.springTex = this.springGen.update(this.clock.delta);
            this.photo.update(this.clock.nowTime, this.springTex);

            this.renderer.setRenderTarget(null);
            this.renderer.render(this.scene, this.cam);

            if (this.autoBrush) {
                this.brush.countdown(this.clock.delta);
            }
        }
        this.fpsCap = !this.fpsCap;
        requestAnimationFrame(this.update);
    }
}
