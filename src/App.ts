/*
 * App.js
 * ===========
 * API layer communicating between HTML and View.
 */

import "./less/main.less";
import View from "./webgl/View";
import { shuffle, mod } from "./utils";

class App {
    private view: View;
    private allImages: Array<string>;
    private imgIndex: number;

    // UI Elements
    // Brush
    private sliderSize: HTMLElement;
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
        this.allImages = shuffle([
            "img/cap.jpg",
            "img/hulk.jpg",
            "img/ironman.jpg",
            "img/loki.jpg",
            "img/spiderman.jpg",
            "img/thor.jpg"
        ]);
        this.imgIndex = -1;
        this.showNextImage();
        this.addEventListeners();

    }
    private addEventListeners(): void {
        // Brush section
        this.sliderSize = document.getElementById("slider-size");
        this.btnsFalloff = <any>document.getElementsByClassName("btn-falloff");
        this.switchLock = document.getElementById("switch-lock");
        this.switchWire = document.getElementById("switch-wire");
        this.sliderSize.addEventListener("mousedown", this.brushSlider);
        this.sliderSize.addEventListener("mousemove", this.brushSlider);
        this.sliderSize.addEventListener("mouseup", this.brushSlider);
        for (let i = 0; i < this.btnsFalloff.length; i++) {
            this.btnsFalloff[i].addEventListener("click", () => this.brushFalloff(i));
        }
        this.switchLock.addEventListener("click", this.toggleLock);
        this.switchWire.addEventListener("click", this.toggleWire);

        // Image section
        this.imgPrev = document.getElementById("img-prev");
        this.imgNext = document.getElementById("img-next");
        this.imgPrev.addEventListener("click", this.showPrevImage);
        this.imgNext.addEventListener("click", this.showNextImage);

        window.addEventListener("resize", this.onResize);        
    }

    // ******************* View API ******************* //
    private brushSlider = (event: MouseEvent): void => {
        console.log(event);
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

    // Loads image in URL
    private loadImage(url: string): void {
        this.view.loadImage(url);
    }

    // Goes to previous image
    private showPrevImage = (): void => {
        this.imgIndex = mod(this.imgIndex - 1, this.allImages.length);
        this.loadImage(this.allImages[this.imgIndex]);
    }

    // Goes to next image
    private showNextImage = (): void => {
        this.imgIndex = (this.imgIndex + 1) % this.allImages.length;
        this.loadImage(this.allImages[this.imgIndex]);
    }

    private onResize = () => {
        this.view.onResize(window.innerWidth, window.innerHeight);
    }
}

const app = new App();
