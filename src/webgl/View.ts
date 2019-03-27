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

    // General properties
    private rendering: boolean;
    private fpsCap: boolean;
    private autoBrush: boolean;
    private vp: THREE.Vector2;
    private photoSize: THREE.Vector2;
    private subdivs: THREE.Vector2;
    private scene: THREE.Scene;
    private cam: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private springTex: THREE.Texture;

    constructor(canvasElem, reticleElem) {
        // General props
        this.rendering = false;
        this.fpsCap = false;
        this.autoBrush = true;

        // Viewport
        this.vp = new THREE.Vector2(600, 800);
        // PX area of photo (300, 400)
        this.photoSize = this.vp.clone().multiplyScalar(0.5);
        // Subdivisions of photo grid (3 * 16, 4 * 16)
        this.subdivs = this.photoSize.clone().multiplyScalar(Math.pow(2, 4) / 100);

        // Three.js boilerplate
        this.scene = new THREE.Scene();
        this.cam = new THREE.OrthographicCamera(-6, 6, 8, -8, -10, 10);
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasElem,
            antialias: false,
            alpha: true,
            stencil: false,
        });
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(this.vp.x, this.vp.y);

        // Main classes
        this.clock = new Clock();
        this.brush = new Brush(reticleElem, this.photoSize);
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
