export default class Slider {
    private pointerDown: boolean = false;
    private pct: number = 50;
    private domElem: HTMLElement;
    private updateCallback: Function;

    constructor(domElement: HTMLElement, updateCallback?: Function) {
        this.domElem = domElement;
        this.updateCallback = updateCallback;

        const elem = this.domElem;
        elem.addEventListener("mousedown", this.onPointerDown);
        elem.addEventListener("touchstart", this.onPointerDown);
        elem.addEventListener("mousemove", this.onPointerMove);
        elem.addEventListener("touchmove", this.onPointerMove);
        elem.addEventListener("mouseup", this.onPointerUp);
        elem.addEventListener("mouseout", this.onPointerUp);
        elem.addEventListener("touchend", this.onPointerUp);
    }

    // ******************* EVENT LISTENERS ******************* //
    private onPointerDown = (event: MouseEvent): void => {
        this.pointerDown = true;
        this.pct = event.offsetX / 2;
        this.updateDOM();
    }

    private onPointerMove = (event: MouseEvent): void => {
        if (this.pointerDown) {
            this.pct = event.offsetX / 2;
            this.updateDOM();
        }
    }

    private onPointerUp = (event: MouseEvent): void => {
        this.pointerDown = false;
    }

    private updateDOM(): void {
        (<HTMLElement>this.domElem.children[0]).style.width = `${this.pct}%`;

        if (this.updateCallback) {
            this.updateCallback(this.pct / 100);
        }
    }

    // ******************* PUBLIC METHODS ******************* //
    public forceUpdate(newPct: number): void {
        this.pct = newPct;
        this.updateDOM();
    }
}