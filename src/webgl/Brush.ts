import * as THREE from "three";
import { normalize } from "../utils/";

export default class Brush {
    // State variables
    private size: number;
    private down: boolean;
    private autoTimer: number;
    private nowPos: THREE.Vector2;
    private startPos: THREE.Vector2;

    // Constant attributes
    private reticle: SVGCircleElement;
    private photoSize: THREE.Vector2;
    private photoHalf: THREE.Vector2;
    private halfVP: THREE.Vector2;

    constructor(svgElem: SVGElement, photoSize: THREE.Vector2, vp: THREE.Vector3) {
        this.startPos = new THREE.Vector2(-1, -1);
        this.nowPos = new THREE.Vector2(-1, -1);
        this.down = false;
        this.size = 20;
        this.reticle = <SVGCircleElement>svgElem.children[0];
        this.photoSize = photoSize;
        this.halfVP = new THREE.Vector2(vp.x / 2, vp.y / 2);
        this.photoHalf = this.photoSize.clone().multiplyScalar(0.5);

        this.autoTimer = 0;
    }

    // ******************* PRIVATE METHODS ******************* //
    // Transforms pixel mousePos into UV mousePos
    private setUVPos(posX: number, posY: number, vector: THREE.Vector2): void {
        vector.x = normalize(posX, this.halfVP.x + this.photoHalf.x, this.halfVP.x - this.photoHalf.x);
        vector.y = normalize(posY, this.halfVP.y + this.photoHalf.y, this.halfVP.y - this.photoHalf.y);
    }

    private autoBrush(): void {
        this.pressDown(THREE.Math.randInt(150, 450), THREE.Math.randInt(200, 600));
        this.move(THREE.Math.randInt(150, 450), THREE.Math.randInt(200, 600));
    }

    // ******************* MOUSE/TOUCH EVENTS ******************* //
    public pressDown(posX: number, posY: number): void {
        this.setUVPos(posX, posY, this.startPos);
        this.nowPos.copy(this.startPos);
        this.down = true;
    }

    public move(posX: number, posY: number): void {
        if (this.down) {
            this.setUVPos(posX, posY, this.nowPos);
            this.reticle.style.opacity = "0";
        } else {
            this.reticle.style.opacity = "1";
        }

        this.reticle.setAttribute("cx", posX.toString());
        this.reticle.setAttribute("cy", posY.toString());
    }

    public release(): void {
        this.nowPos.copy(this.startPos);
        this.reticle.style.opacity = "1";
        this.down = false;
    }

    public outOfBounds(): void {
        this.release();
        this.reticle.style.opacity = "0";
    }

    public scale(delta: number, ySubdivs: number): number {
        this.size = THREE.Math.clamp(this.size - delta, 5.0, ySubdivs / 2.0);
        let radius = this.size * this.photoSize.y / ySubdivs;
        this.reticle.setAttribute("r", radius.toString());

        return this.size;
    }

    public onResize(vp: THREE.Vector3) {
        this.halfVP.set(vp.x / 2, vp.y / 2);
        this.photoHalf.set(vp.y * 0.75, vp.y).multiplyScalar(0.25);
    }

    // ******************* GETTERS ******************* //
    public getStartPos(): THREE.Vector2 {
        return this.startPos;
    }

    public getNowPos(): THREE.Vector2 {
        return this.nowPos;
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
