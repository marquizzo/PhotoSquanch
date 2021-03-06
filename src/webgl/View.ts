import * as THREE from "three";

import Photo from "./Photo";
import SpringGenerator from "./SpringGenerator";
import Brush from "./Brush";
import { Clock } from "../utils";
import { VP, SUBDIVS } from "../utils/regionalVars";

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
    private photoScale: number;
    private photoSize: THREE.Vector2;
    private scene: THREE.Scene;
    private cam: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private springTex: THREE.Texture;

    constructor(canvasBox: HTMLElement, svgElem: SVGElement) {
        // General props
        this.rendering = false;
        this.fpsCap = false;
        this.autoBrush = false;
        this.photoScale = 0.75;
        SUBDIVS.set(3 * 32, 4 * 32);

        // Three.js boilerplate
        this.scene = new THREE.Scene();
        this.cam = new THREE.OrthographicCamera(-1, 1, 10, -10, -10, 10);
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            stencil: false,
        });
        canvasBox.appendChild(this.renderer.domElement);
        this.svgElem = svgElem;

        // Main classes
        this.photoSize = new THREE.Vector2(VP.x, VP.y).multiplyScalar(this.photoScale);
        this.clock = new Clock();
        this.brush = new Brush(svgElem);
        this.springGen = new SpringGenerator(
            this.renderer,
            this.brush
        );
        this.photo = new Photo();
        this.scene.add(this.photo.getMesh());

        // Start drag
        canvasBox.addEventListener("mousedown", this.onMouseDown);
        canvasBox.addEventListener("touchstart", this.onMouseDown);
        // Drag move
        canvasBox.addEventListener("mousemove", this.onMouseMove);
        canvasBox.addEventListener("touchmove", this.onMouseMove);
        // Stop drag
        canvasBox.addEventListener("mouseup", this.onMouseUp);
        canvasBox.addEventListener("touchend", this.onMouseUp);
        canvasBox.addEventListener("mouseout", this.onMouseOut);

        // Fire up rendering loop
        this.update(0);
    }

    // ******************* NAV BRUSH ******************* //
    public changeBrushSizeTo(pct: number): void {
        this.brush.scaleTo(pct);
    }

    public changeBrushSizeBy(pctDelta: number): number {
        let newPct = this.brush.scaleBy(pctDelta);
        return newPct;
    }

    public changeFalloff(falloffIndex: number): void {
        this.springGen.setFalloffMode(falloffIndex);
    }

    public toggleLock(enable: boolean): void {
        this.brush.setLock(enable);
    }

    // ******************* NAV IMAGE ******************* //
    public loadImage(url: string, whRatio: number): void {
        this.photo.loadImage(url);
        this.photo.setWHRatio(whRatio);
        this.brush.setPhotoWHRatio(whRatio);
        this.resumeRender();
    }

    public toggleWire(enable: boolean): void {
        this.photo.setWireframe(enable);
    }

    public pauseRender(): void {
        this.rendering = false;
    }

    public resumeRender(): void {
        this.rendering = true;
    }

    // ******************* NAV MATERIAL ******************* //
    public onMassUpdate(newPct: number): void {
        this.springGen.setMass(newPct);
    }

    public onTensionUpdate(newPct: number): void {
        this.springGen.setTension(newPct);
    }
    public onDampingUpdate(newPct: number): void {
        this.springGen.setDamping(newPct);
    }

    public onResize(vpW: number, vpH: number): void {
        VP.set(vpW, vpH, vpW / vpH);
        this.renderer.setSize(VP.x, VP.y);
        this.svgElem.setAttribute("viewBox", `0 0 ${VP.x} ${VP.y}`);
        this.cam.left = -10 * VP.z;
        this.cam.right = 10 * VP.z;
        this.cam.updateProjectionMatrix();

        this.photoSize.set(VP.y * 0.75, VP.y).multiplyScalar(this.photoScale);
        this.brush.onResize();

        // Force render, prevents flicker
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.cam);
    }

    // ******************* MOUSE EVENT LISTENERS ******************* //
    private onMouseDown = (event): void => {
        this.renderer.domElement.style.cursor = "grabbing";
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
        this.renderer.domElement.style.cursor = "grab";
        this.brush.release();
        event.preventDefault();
    }

    private onMouseOut = (event): void => {
        this.brush.outOfBounds();
        event.preventDefault();
    }

    // ******************* UPDATE ******************* //
    private update = (_t): void => {
        if (this.rendering && !this.fpsCap) {
            this.clock.update(_t);
            this.springTex = this.springGen.update(this.brush);
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
