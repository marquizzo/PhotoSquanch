import { Vector2, Vector3 } from "three";

const VP = new Vector3(
    window.innerWidth,
    window.innerHeight,
    window.innerWidth / window.innerHeight
);

const SUBDIVS = new Vector2();

export { VP, SUBDIVS };