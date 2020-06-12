/*
 * App.js
 * ===========
 * API layer communicating between HTML and View.
 */

import "./less/main.less";
import View from "./webgl/View";
import photos from "./photos";
import Slider from "./domClasses/Slider";
import { shuffle, mod } from "./utils";

class App {
    private view: View;
    private photoList: Array<string>;
    private imgIndex: number;

    // UI Elements
    private nav: HTMLElement;
    private navToggle: HTMLElement;

    // Brush
    private brushSizeSlider: Slider;
    private btnsFalloff: HTMLCollectionOf<HTMLElement>;
    private switchLock: HTMLElement;

    // Image
    private fileReader: FileReader;
    private imgPrev: HTMLElement;
    private imgNext: HTMLElement;
    private switchWire: HTMLElement;

    // Material
    private sliderMass: Slider;
    private sliderTension: Slider;
    private sliderDamping: Slider;

    constructor() {
        const canvasBox = <HTMLCanvasElement>document.getElementById("photo-canvas");
        const svgRef: SVGElement = <any>document.getElementById("photo-svg");

        const imgInput = document.getElementById("imgInput");
        imgInput.addEventListener("change", this.imgFileSelected, false);
        this.fileReader = new FileReader();

        this.view = new View(canvasBox, svgRef);
        this.photoList = shuffle(photos);
        this.imgIndex = -1;
        this.showNextImage();
        this.addEventListeners();
    }
    private addEventListeners(): void {
        this.nav = this.getElem("nav");
        this.navToggle = this.getElem("nav-toggle");
        this.navToggle.addEventListener("click", this.toggleNav);

        // Brush selectors
        this.brushSizeSlider = new Slider(this.getElem("slider-size"), this.onSizeUpdate);
        this.brushSizeSlider.forceUpdate(50);
        this.btnsFalloff = <any>document.getElementsByClassName("btn-falloff");
        this.switchLock = this.getElem("switch-lock");

        // Brush event listeners
        for (let i = 0; i < this.btnsFalloff.length; i++) {
            this.btnsFalloff[i].addEventListener("click", () => this.brushFalloff(i));
        }
        this.switchLock.addEventListener("click", this.toggleLock);
        window.addEventListener("wheel", this.onMouseWheel);

        // Image section
        this.imgPrev = this.getElem("img-prev");
        this.imgNext = this.getElem("img-next");
        this.switchWire = this.getElem("switch-wire");
        this.imgPrev.addEventListener("click", this.showPrevImage);
        this.imgNext.addEventListener("click", this.showNextImage);
        this.switchWire.addEventListener("click", this.toggleWire);

        // Material section
        this.sliderMass = new Slider(this.getElem("slider-mass"), this.onMassUpdate);
        this.sliderTension = new Slider(this.getElem("slider-tension"), this.onTensionUpdate);
        this.sliderDamping = new Slider(this.getElem("slider-damping"), this.onDampingUpdate);

        window.addEventListener("resize", this.onResize);
    }

    private getElem(id: string): HTMLElement {
        return document.getElementById(id);
    }

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

    // ******************* BRUSH CONTROLS ******************* //
    private onMouseWheel = (event: WheelEvent): void => {
        // this.brushSizePct = Math.max(0, Math.min(100, this.brushSizePct));
        // this.updateBrushSize();
        let delta = -event.deltaY * Math.pow(10, event.deltaMode) * 0.3;
        this.view.changeBrushSizeBy(delta);
    }

    private onSizeUpdate = (newPct: number): void => {
        this.view.changeBrushSizeTo(newPct);
    }

    private brushFalloff = (index: number): void => {
        for (let i = 0; i < this.btnsFalloff.length; i++) {
            this.btnsFalloff[i].classList.remove("active");
        }
        this.btnsFalloff[index].classList.add("active");
        this.view.changeFalloff(index);
    }

    private toggleLock = (event: MouseEvent): void => {
        const lockEnabled = this.switchLock.classList.contains("active");

        if (lockEnabled) {
            this.switchLock.classList.remove("active");
            this.view.toggleLock(false);
        } else {
            this.switchLock.classList.add("active");
            this.view.toggleLock(true);
        }
    }

    private imgFileSelected = (evt: Event):void => {
        console.log(evt);
        const file = (<HTMLInputElement>event.target).files[0];
        const imgDom = document.createElement("img");

        this.fileReader.onload = (loadEvt: Event) => {
            imgDom.src = (<any>loadEvt.target).result;
            console.log(imgDom.width, imgDom.height);
            this.view.loadImage((<any>loadEvt.target).result);
        }

        this.fileReader.readAsDataURL(file);
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

    // ******************* MATERIAL CONTROLS ******************* //
    private onMassUpdate = (newPct: number): void => {
        this.view.onMassUpdate(newPct);
    }
    
    private onTensionUpdate = (newPct: number): void => {
        this.view.onTensionUpdate(newPct);
    }

    private onDampingUpdate = (newPct: number): void => {
        this.view.onDampingUpdate(newPct);
    }

    private onResize = () => {
        this.view.onResize(window.innerWidth, window.innerHeight);
    }
}

const app = new App();
