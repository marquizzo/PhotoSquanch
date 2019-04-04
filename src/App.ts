/*
 * App.js
 * ===========
 * API layer communicating between HTML and View.
 */

import "./less/main.less";
import View from "./webgl/View";
import photos from "./photos";
import { shuffle, mod } from "./utils";

class App {
    private view: View;
    private photoList: Array<string>;
    private imgIndex: number;

    // UI Elements
    private nav: HTMLElement;
    private navToggle: HTMLElement;
    // Brush
    private brushSizeActive: boolean = false;
    private brushSizePct: number = 50;
    private brushSizeElem: HTMLElement;
    private btnsFalloff: HTMLCollectionOf<HTMLElement>;
    private switchLock: HTMLElement;
    private switchWire: HTMLElement;

    // Image
    private imgPrev: HTMLElement;
    private imgNext: HTMLElement;

    constructor() {
        const canvasBox = <HTMLCanvasElement>document.getElementById("photo-canvas");
        const svgRef: SVGElement = <any>document.getElementById("photo-svg");

        this.view = new View(canvasBox, svgRef);
        this.photoList = shuffle(photos);
        this.imgIndex = -1;
        this.showNextImage();
        this.addEventListeners();

    }
    private addEventListeners(): void {
        this.nav = document.getElementById("nav");
        this.navToggle = document.getElementById("nav-toggle");
        this.navToggle.addEventListener("click", this.toggleNav);
        // Brush selectors
        this.brushSizeElem = document.getElementById("slider-size");
        this.btnsFalloff = <any>document.getElementsByClassName("btn-falloff");
        this.switchLock = document.getElementById("switch-lock");

        // Brush event listeners
        const bSE = this.brushSizeElem;
        bSE.addEventListener("mousedown", this.brushSizeDown);
        bSE.addEventListener("touchstart", this.brushSizeDown);
        bSE.addEventListener("mousemove", this.brushSizeMove);
        bSE.addEventListener("touchmove", this.brushSizeMove);
        bSE.addEventListener("mouseup", this.brushSizeUp);
        bSE.addEventListener("mouseout", this.brushSizeUp);
        bSE.addEventListener("touchend", this.brushSizeUp);
        for (let i = 0; i < this.btnsFalloff.length; i++) {
            this.btnsFalloff[i].addEventListener("click", () => this.brushFalloff(i));
        }
        this.switchLock.addEventListener("click", this.toggleLock);
        // Mouse wheel
        window.addEventListener("wheel", this.onMouseWheel);

        // Image section
        this.imgPrev = document.getElementById("img-prev");
        this.imgNext = document.getElementById("img-next");
        this.switchWire = document.getElementById("switch-wire");
        this.imgPrev.addEventListener("click", this.showPrevImage);
        this.imgNext.addEventListener("click", this.showNextImage);
        this.switchWire.addEventListener("click", this.toggleWire);

        window.addEventListener("resize", this.onResize);
        this.updateBrushSize();
    }

    // ******************* BRUSH CONTROLS ******************* //

    private toggleNav = (event: MouseEvent): void => {
        const active = this.nav.classList.contains("active");
        if (active) {
            this.nav.classList.remove("active");
            this.navToggle.classList.remove("active");
        } else {
            this.nav.classList.add("active");
            this.navToggle.classList.add("active");
        }
    }

    private onMouseWheel = (event: WheelEvent): void => {
        this.brushSizePct -= event.deltaY * Math.pow(10, event.deltaMode) * 0.3;
        this.brushSizePct = Math.max(0, Math.min(100, this.brushSizePct));
        this.updateBrushSize();
    }

    private brushSizeDown = (event: MouseEvent): void => {
        this.brushSizeActive = true;
        this.brushSizePct = event.layerX / 2;
        this.updateBrushSize();
    }

    private brushSizeMove = (event: MouseEvent): void => {
        if (this.brushSizeActive) {
            this.brushSizePct = event.layerX / 2;
            this.updateBrushSize();
        }
    }

    private brushSizeUp = (event: MouseEvent): void => {
        this.brushSizeActive = false;
    }

    private updateBrushSize(): void {
        (<HTMLElement>this.brushSizeElem.children[0]).style.width = `${this.brushSizePct}%`;
        this.view.changeBrushSizeTo(this.brushSizePct / 100);
    }

    private brushFalloff = (index: number): void => {
        for (let i = 0; i < this.btnsFalloff.length; i++) {
            this.btnsFalloff[i].classList.remove("active");
        }
        this.btnsFalloff[index].classList.add("active");
        this.view.changeFalloff(index);
    }

    private toggleLock = (event: MouseEvent): void =>{
        const lockEnabled = this.switchLock.classList.contains("active");

        if (lockEnabled) {
            this.switchLock.classList.remove("active");
            this.view.toggleLock(false);
        } else {
            this.switchLock.classList.add("active");
            this.view.toggleLock(true);
        }
    }

    // ******************* IMAGE CONTROLS ******************* //
    // Loads image in URL
    private loadImage(url: string): void {
        this.view.loadImage(url);
    }

    // Goes to previous image
    private showPrevImage = (): void => {
        this.imgIndex = mod(this.imgIndex - 1, this.photoList.length);
        this.loadImage(this.photoList[this.imgIndex]);
    }

    // Goes to next image
    private showNextImage = (): void => {
        this.imgIndex = (this.imgIndex + 1) % this.photoList.length;
        this.loadImage(this.photoList[this.imgIndex]);
    }

    private toggleWire = (event: MouseEvent): void => {
        const wireEnabled = this.switchWire.classList.contains("active");

        if (wireEnabled) {
            this.switchWire.classList.remove("active");
            this.view.toggleWire(false);
        } else {
            this.switchWire.classList.add("active");
            this.view.toggleWire(true);
        }
    }

    private onResize = () => {
        this.view.onResize(window.innerWidth, window.innerHeight);
    }
}

const app = new App();
