import * as THREE from "three";

import Photo from "./Photo";
import SpringGenerator from "./SpringGenerator";
import Brush from "./Brush";
import { Clock } from "./Utils";

export default class PhotoView {
    constructor(_canvas, _reticle) {
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

        // Three.js standards
        this.scene = new THREE.Scene();
        this.cam = new THREE.OrthographicCamera(-6, 6, 8, -8, -10, 10);
        this.renderer = new THREE.WebGLRenderer({
            canvas: _canvas,
            antialias: false,
            alpha: true,
            stencil: false,
        });
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(this.vp.x, this.vp.y);

        // Spring generator
        this.clock = new Clock();
        this.brush = new Brush(_reticle, this.photoSize);
        this.springGen = new SpringGenerator(
            this.renderer,
            this.subdivs,
            this.brush.start,
            this.brush.now
        );
        this.springTex = null;
        this.photo = new Photo(this.subdivs);
        this.scene.add(this.photo.plane);

        // Start drag
        _canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        _canvas.addEventListener("touchstart", this.onMouseDown.bind(this));
        // Drag move
        _canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
        _canvas.addEventListener("touchmove", this.onMouseMove.bind(this));
        // Stop drag
        _canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        _canvas.addEventListener("touchend", this.onMouseUp.bind(this));
        _canvas.addEventListener("mouseout", this.onMouseOut.bind(this));
        // Mouse wheel
        _canvas.addEventListener("wheel", this.onMouseWheel.bind(this));
        this.onMouseWheel({deltaY: 0});

        // Fire up rendering loop
        this.update(0);
    }

    loadImage(_url) {
        this.photo.loadImage(_url);
        this.resumeRender();
    }

    pauseRender() {
        this.rendering = false;
    }

    resumeRender() {
        this.rendering = true;
    }

    // ******************* MOUSE EVENT LISTENERS ******************* //
    onMouseDown(_evt) {
        // this.renderer.domElement.style.cursor = "grabbing";
        this.autoBrush = false;
        this.brush.pressDown(_evt.layerX, _evt.layerY);
        _evt.preventDefault();
    }

    onMouseMove(_evt) {
        if (this.autoBrush === false) {
            this.brush.move(_evt.layerX, _evt.layerY);
        }
        _evt.preventDefault();
    }

    onMouseUp(_evt) {
        // this.renderer.domElement.style.cursor = "grab";
        this.brush.release();
        _evt.preventDefault();
    }

    onMouseOut(_evt) {
        this.brush.outOfBounds();
        _evt.preventDefault();
    }

    onMouseWheel(_evt) {
        this.brush.scale(_evt.deltaY * 0.3, this.subdivs.y);
        this.springGen.setMouseSize(this.brush.size);
    }

    // Updates once per frame
    update(_t) {
        if (this.rendering && !this.fpsCap) {
            this.clock.update(_t);
            this.springTex = this.springGen.update(this.clock.delta);
            this.photo.update(this.clock.nowTime, this.springTex);
            this.renderer.render(this.scene, this.cam);

            if (this.autoBrush) {
                this.brush.countdown(this.clock.delta);
            }
        }
        this.fpsCap = !this.fpsCap;
        requestAnimationFrame(this.update.bind(this));
    }
}
