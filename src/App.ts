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
    private switchLock: HTMLElement;
    private switchWire: HTMLElement;

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
        this.switchLock = document.getElementById("switch-lock");
        this.switchWire = document.getElementById("switch-wire");
        this.switchLock.addEventListener("click", this.toggleLock);
        this.switchWire.addEventListener("click", this.toggleWire);
        // Image section
        document.getElementById("img-prev")
            .addEventListener("click", this.showPrevImage.bind(this));
        document.getElementById("img-next")
            .addEventListener("click", this.showNextImage.bind(this));
        window.addEventListener("resize", this.onResize);        
    }

    // ******************* View API ******************* //
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
    private showPrevImage(): void {
        this.imgIndex = mod(this.imgIndex - 1, this.allImages.length);
        this.loadImage(this.allImages[this.imgIndex]);
    }

    // Goes to next image
    private showNextImage(): void {
        this.imgIndex = (this.imgIndex + 1) % this.allImages.length;
        this.loadImage(this.allImages[this.imgIndex]);
    }

    private onResize = () => {
        this.view.onResize(window.innerWidth, window.innerHeight);
    }
}

const app = new App();
