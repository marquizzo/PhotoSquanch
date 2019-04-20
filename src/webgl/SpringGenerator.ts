import * as THREE from "three";
import Brush from "./Brush";
import { VP, SUBDIVS } from "../utils/regionalVars";

import springVert from "./glsl/spring.vs";
import springFrag from "./glsl/spring.fs";

export default class SpringGenerator {
    // General properties
    private renderer: THREE.WebGLRenderer;
    private targetSwap: boolean;
    
    // Render targets
    private rTarget1: THREE.WebGLRenderTarget;
    private rTarget2: THREE.WebGLRenderTarget;
    private rTargetActive: THREE.WebGLRenderTarget;
    private rTargetInactive: THREE.WebGLRenderTarget;
    private springScene: THREE.Scene;
    private springCam: THREE.Camera;

    // Uniforms
    private uniHeightMap: THREE.IUniform;
    private uniBrushSize: THREE.IUniform;
    private uniFalloff: THREE.IUniform;
    private uniMass: THREE.IUniform;
    private uniTension: THREE.IUniform;
    private uniDamping: THREE.IUniform;

    // Mass ranges
    private rangeMass: Array<number> = [1.0, 5.0];
    private rangeTension: Array<number> = [3.0, 6.0];
    private rangeDamping: Array<number> = [5.0, 20.0];

    // Dev variables
    private devMode: boolean = false;
    private devScene: THREE.Scene;
    private devCam: THREE.Camera;
    private devMat: THREE.MeshBasicMaterial;

    constructor(renderer: THREE.WebGLRenderer, brush: Brush) {
        this.targetSwap = false;
        this.renderer = renderer;

        // Init render targets
        this.rTarget1 = new THREE.WebGLRenderTarget(SUBDIVS.x, SUBDIVS.y, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            stencilBuffer: false,
            depthBuffer: false,
            format: THREE.RGBAFormat,
            type: this.getDataType(),
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping
        });
        this.rTarget2 = this.rTarget1.clone();
        this.rTargetActive = this.rTarget1;
        this.rTargetInactive = this.rTarget2;

        // Set up spring scene
        this.springScene = new THREE.Scene();
        this.springCam = new THREE.Camera();
        this.springCam.position.z = 1;

        const rezString = `vec2( ${SUBDIVS.x.toFixed(1)}, ${SUBDIVS.y.toFixed(1)} )`;
        const springGeom = new THREE.PlaneBufferGeometry(2, 2);
        const springMat = new THREE.RawShaderMaterial({
            uniforms: {
                mouseStart: {value: brush.getStartPos()},
                mouseNow: {value: brush.getNowPos()},
                brushSize: {value: brush.getSize()},
                heightmap: {value: null},
                falloffMode: {value: 0.0},
                sMass: {value: 1.0},
                sTension: {value: 3.0},
                sDamping: {value: 10.0}
            },
            defines: {
                BOUNDS: SUBDIVS.x.toFixed(1),
                RESOLUTION: rezString
            },
            vertexShader: springVert,
            fragmentShader: springFrag,
            depthWrite: false,
        });
        const unis = springMat.uniforms;
        this.uniHeightMap = unis.heightmap;
        this.uniBrushSize = unis.brushSize;
        this.uniFalloff = unis.falloffMode;
        this.uniMass = unis.sMass;
        this.uniTension = unis.sTension;
        this.uniDamping = unis.sDamping;

        const springMesh = new THREE.Mesh(springGeom, springMat);
        this.springScene.add(springMesh);

        // Set up dev view
        if (this.devMode) {
            this.renderer.autoClear = false;
            this.devScene = new THREE.Scene();
            this.devCam = new THREE.Camera();
            this.devCam.position.z = 1;
            this.devMat = new THREE.MeshBasicMaterial({map: this.rTarget1.texture});
            const devGeom = new THREE.PlaneBufferGeometry(2, 2);
            const devMesh = new THREE.Mesh(devGeom, this.devMat);
            this.devScene.add(devMesh);
        }
    }

    private getDataType(): THREE.TextureDataType {
        return (/(iPad|iPhone|iPod)/g).test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType;
    }

    // ******************* PUBLIC METHODS ******************* //
    public setFalloffMode(falloffIndex: number): void {
        this.uniFalloff.value = falloffIndex;
    }

    public setMass(newMass: number): void {
        this.uniMass.value = newMass;
    }

    public setTension(newTension: number): void {
        this.uniTension.value = newTension;

    }

    public setDamping(newDamping: number): void {
        this.uniDamping.value = newDamping;
    }

    public update(brush: Brush): THREE.Texture {
        this.targetSwap = !this.targetSwap;

        if (this.targetSwap) {
            this.rTargetActive = this.rTarget1;
            this.rTargetInactive = this.rTarget2;
        } else {
            this.rTargetActive = this.rTarget2;
            this.rTargetInactive = this.rTarget1;
        }
        this.uniBrushSize.value = brush.getSize();
        this.uniHeightMap.value = this.rTargetInactive.texture;
        this.renderer.setRenderTarget(this.rTargetActive);
        this.renderer.render(this.springScene, this.springCam);

        if (this.devMode) {
            this.devMat.map = this.rTargetActive.texture;
            this.renderer.setRenderTarget(null);
            this.renderer.setViewport(0, 0, SUBDIVS.x * 2.0, SUBDIVS.y * 2.0);
            this.renderer.render(this.devScene, this.devCam);
            this.renderer.setViewport(0, 0, VP.x, VP.y);
        }

        return this.rTargetActive.texture;
    }
}
