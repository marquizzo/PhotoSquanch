/*
 * App.js
 * ===========
 * API layer communicating between HTML and View.
 */

import View from "./webgl/View";
import { shuffle } from "./utils";

class App {
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
    loadImage(url) {
        this.view.loadImage(url);
    }

    // Goes to previous image
    showPrevImage() {
        this.imgIndex = this.mod(this.imgIndex - 1, this.allImages.length);
        this.loadImage(this.allImages[this.imgIndex]);
    }

    // Goes to next image
    showNextImage() {
        this.imgIndex = (this.imgIndex + 1) % this.allImages.length;
        this.loadImage(this.allImages[this.imgIndex]);
    }

    // Javascript mod fix
    mod(n, m) {
        return (n % m + m) % m;
    }
}

const app = new App();
