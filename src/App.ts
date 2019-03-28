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

        // document.getElementById("photo-last")
        //     .addEventListener("click", this.showPrevImage.bind(this));
        // document.getElementById("photo-next")
        //     .addEventListener("click", this.showNextImage.bind(this));
        window.addEventListener("resize", this.onResize);
    }

    // ******************* View API ******************* //
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
