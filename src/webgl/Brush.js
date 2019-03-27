import * as THREE from "three";

export default class Brush {
    constructor(_reticle, _photoSize) {
        this.start = new THREE.Vector2(-1, -1);
        this.now = new THREE.Vector2(-1, -1);
        this.down = false;
        this.size = 20;
        this.reticle = _reticle;
        this.photoSize = _photoSize;
        this.photoHalf = this.photoSize.clone().multiplyScalar(0.5);

        this.autoTimer = 0;
    }

    // Transforms pixel mousePos into UV mousePos
    setUVPos(_pX, _pY, _vector) {
        _vector.x = (_pX - this.photoHalf.x) / this.photoSize.x;
        _vector.y = (_pY - this.photoHalf.y) / this.photoSize.y;
    }

    // ******************* MOUSE/TOUCH EVENTS ******************* //
    pressDown(_pX, _pY) {
        this.setUVPos(_pX, _pY, this.start);
        this.now.copy(this.start);
        this.down = true;
    }

    move(_pX, _pY) {
        if (this.down) {
            this.setUVPos(_pX, _pY, this.now);
            this.reticle.style.opacity = 0;
        } else {
            this.reticle.style.opacity = 1;
        }

        this.reticle.attributes.cx.value = _pX;
        this.reticle.attributes.cy.value = _pY;
    }

    release() {
        this.now.copy(this.start);
        this.reticle.style.opacity = 1;
        this.down = false;
    }

    outOfBounds() {
        this.release();
        this.reticle.style.opacity = 0;
    }

    scale(_delta, _ySubdivs) {
        this.size = THREE.Math.clamp(this.size - _delta, 5.0, _ySubdivs / 2.0);
        this.reticle.attributes.r.value = this.size * this.photoSize.y / _ySubdivs;

        return this.size;
    }

    // ******************* AUTOBRUSH ******************* //
    countdown(_dTime) {
        this.autoTimer -= _dTime;

        if (this.autoTimer <= 0) {
            this.autoBrush();
            this.autoTimer = 2;
        }
    }

    autoBrush() {
        this.pressDown(THREE.Math.randInt(150, 450), THREE.Math.randInt(200, 600));
        this.move(THREE.Math.randInt(150, 450), THREE.Math.randInt(200, 600));
    }
}
