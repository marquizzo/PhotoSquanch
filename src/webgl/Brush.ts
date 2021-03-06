import * as THREE from "three";
import { normalize, map } from "../utils/";
import { VP, SUBDIVS } from "../utils/regionalVars";

export default class Brush {
    // State variables
    private size: number = 0;
    private autoTimer: number = 0;
    private locked: boolean = false;
    private pointerDown: boolean = false;
    private nowPos: THREE.Vector2;
    private startPos: THREE.Vector2;

    // Constant attributes
    private photoRatio: number = 0.75;
    private reticle: SVGCircleElement;
    private halfPhotoSize: THREE.Vector2;
    private halfVP: THREE.Vector2;
    private sizeRange: {min: number, max: number};

    constructor(svgElem: SVGElement) {
        this.startPos = new THREE.Vector2(-1, -1);
        this.nowPos = new THREE.Vector2(-1, -1);

        this.reticle = <SVGCircleElement>svgElem.children[0];
        this.halfPhotoSize = new THREE.Vector2(VP.y * this.photoRatio, VP.y).multiplyScalar(0.5);
        this.halfVP = new THREE.Vector2(VP.x / 2, VP.y / 2);
        this.sizeRange = {min: 5, max: SUBDIVS.y / 2.0};
    }

    // ******************* PRIVATE METHODS ******************* //
    // Transforms pixel mousePos into UV mousePos
    private setUVPos(posX: number, posY: number, vector: THREE.Vector2): void {
        vector.x = normalize(posX, this.halfVP.x + this.halfPhotoSize.x, this.halfVP.x - this.halfPhotoSize.x);
        vector.y = normalize(posY, this.halfVP.y + this.halfPhotoSize.y, this.halfVP.y - this.halfPhotoSize.y);
    }

    private autoBrush(): void {
        this.pressDown(THREE.Math.randInt(150, 450), THREE.Math.randInt(200, 600));
        this.move(THREE.Math.randInt(150, 450), THREE.Math.randInt(200, 600));
    }

    private resizeReticle(): void {
        let pxRadius = this.size * (VP.y / 2) / this.sizeRange.max;
        this.reticle.setAttribute("r", pxRadius.toString());
    }

    // ******************* MOUSE/TOUCH EVENTS ******************* //
    public pressDown(posX: number, posY: number): void {
        this.setUVPos(posX, posY, this.startPos);
        this.nowPos.copy(this.startPos);
        this.pointerDown = true;
    }

    public move(posX: number, posY: number): void {
        if (this.pointerDown) {
            this.setUVPos(posX, posY, this.nowPos);
            this.reticle.style.opacity = "0";
        } else {
            this.reticle.style.opacity = "1";
        }

        this.reticle.setAttribute("cx", posX.toString());
        this.reticle.setAttribute("cy", posY.toString());
    }

    public release(): void {
        if (!this.locked) {
            this.nowPos.copy(this.startPos);
        }
        this.reticle.style.opacity = "1";
        this.pointerDown = false;
    }

    public outOfBounds(): void {
        this.release();
        this.reticle.style.opacity = "0";
    }

    // ******************* SCALING EVENTS ******************* //
    // Scales size to a specific %
    public scaleTo(pct: number): void {
        this.size = (this.sizeRange.max - this.sizeRange.min) * pct + this.sizeRange.min;
        this.resizeReticle();
    }

    // Scales size by a change in %
    public scaleBy(pctDelta: number): number {
        this.size = THREE.Math.clamp(this.size + pctDelta, this.sizeRange.min, this.sizeRange.max);
        this.resizeReticle();

        // Returns new percentage
        return THREE.Math.mapLinear(this.size, this.sizeRange.min, this.sizeRange.max, 0, 100);
    }

    public onResize() {
        this.halfVP.set(VP.x / 2, VP.y / 2);
        this.halfPhotoSize.set(VP.y * this.photoRatio, VP.y).multiplyScalar(0.5);
        this.resizeReticle();
    }

    // ******************* GETTERS / SETTERS ******************* //
    public getStartPos(): THREE.Vector2 {
        return this.startPos;
    }

    public getNowPos(): THREE.Vector2 {
        return this.nowPos;
    }

    public getSize(): number {
        return this.size;
    }

    public setLock(value: boolean): void {
        this.locked = value;
        if (!this.locked) {
            this.release();
        }
    }

    public setPhotoWHRatio(ratio: number): void {
        console.log('new ratio: ', ratio);
        this.photoRatio = ratio;
        this.halfPhotoSize.x = (VP.y * this.photoRatio) * 0.5;
    }

    // ******************* AUTOBRUSH ******************* //
    public countdown(timeDelta: number): void {
        this.autoTimer -= timeDelta;

        if (this.autoTimer <= 0) {
            this.autoBrush();
            this.autoTimer = 2;
        }
    }
}
