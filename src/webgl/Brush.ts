import * as THREE from "three";
import { normalize } from "../utils/";
import { VP } from "../utils/regionalVars";

export default class Brush {
    // State variables
    private size: number;
    private down: boolean;
    private autoTimer: number;
    private nowPos: THREE.Vector2;
    private startPos: THREE.Vector2;

    // Constant attributes
    private reticle: SVGCircleElement;
    private halfPhotoSize: THREE.Vector2;
    private halfVP: THREE.Vector2;

    constructor(svgElem: SVGElement) {
        this.startPos = new THREE.Vector2(-1, -1);
        this.nowPos = new THREE.Vector2(-1, -1);
        this.down = false;
        this.size = 20;
        this.reticle = <SVGCircleElement>svgElem.children[0];
        this.halfVP = new THREE.Vector2(VP.x / 2, VP.y / 2);
        this.halfPhotoSize = new THREE.Vector2(VP.y * 0.75, VP.y).multiplyScalar(0.25);

        this.autoTimer = 0;
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
        let radius = this.size * this.halfPhotoSize.y * 2 / ySubdivs;
        this.reticle.setAttribute("r", radius.toString());

        return this.size;
    }

    public onResize() {
        this.halfVP.set(VP.x / 2, VP.y / 2);
        this.halfPhotoSize.set(VP.y * 0.75, VP.y).multiplyScalar(0.25);
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
