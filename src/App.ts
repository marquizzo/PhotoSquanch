/*
 * App.js
 * ===========
 * API layer communicating between HTML and View.
 */

import View from "./webgl/View";
import { shuffle, mod } from "./utils";

class App {
    private view: View;
    private allImages: Array<string>;
    private imgIndex: number;

    constructor() {
        const canvasBox = document.getElementById("photo-canvas");
        const reticleRef = document.getElementById("photo-reticle");

        this.view = new View(canvasBox, reticleRef);
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
}

const app = new App();
