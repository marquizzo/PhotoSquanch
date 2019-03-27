/*
 * App.js
 * ===========
 * API layer communicating between HTML and PhotoView.
 */

import PhotoView from "./webgl/PhotoView";
import { shuffle } from "./webgl/Utils";

export default class App {
    constructor() {
        const canvasRef = document.getElementById("photo-canvas");
        const reticleRef = document.getElementById("photo-reticle");

        this.view = new PhotoView(canvasRef, reticleRef);
        this.allImages = shuffle([
            "images/people-claudine.jpg",
            "images/people-kyle.jpg",
            "images/people-steed.jpg",
            "images/people-ryan.jpg",
            "images/people-caio.jpg",
            "images/people-michelle.jpg",
            "images/people-kelsey.jpg",
            "images/people-scavo.jpg",
        ]);
        this.imgIndex = -1;
        this.showNextImage();

        document.getElementById("photo-last")
            .addEventListener("click", this.showPrevImage.bind(this));
        document.getElementById("photo-next")
            .addEventListener("click", this.showNextImage.bind(this));
    }

    // ******************* PhotoView API ******************* //

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
