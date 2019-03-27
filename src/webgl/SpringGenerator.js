import * as THREE from "three";

import springVert from "./glsl/springGPGPU.vert";
import springFrag from "./glsl/springGPGPU.frag";

export default class SpringGenerator {
    constructor(_renderer, _subdivs, _mouseStart, _mouseNow) {
        this.devMode = false;
        this.targetSwap = false;
        this.subdivs = _subdivs;
        this.renderer = _renderer;
        this.ogSize = _renderer.getSize();

        // Set up render targets
        this.rTarget1 = new THREE.WebGLRenderTarget(this.subdivs.x, this.subdivs.y, {
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

        // Set up scene for calculating spring
        this.springScene = new THREE.Scene();
        this.springCam = new THREE.Camera();
        this.springCam.position.z = 1;

        const rezString = `vec2( ${this.subdivs.x.toFixed(1)}, ${this.subdivs.y.toFixed(1)} )`;
        const springGeom = new THREE.PlaneBufferGeometry(2, 2);
        const springMat = new THREE.RawShaderMaterial({
            uniforms: {
                mouseStart: {value: _mouseStart},
                mouseNow: {value: _mouseNow},
                mouseSize: {value: 30.0},
                heightmap: {value: null},
                timeDelta: {value: 0}
            },
            defines: {
                BOUNDS: this.subdivs.x.toFixed(1),
                RESOLUTION: rezString
            },
            vertexShader: springVert,
            fragmentShader: springFrag,
            depthWrite: false,
        });
        this.uniHeightMap = springMat.uniforms.heightmap;
        this.uniTimeDelta = springMat.uniforms.timeDelta;
        this.uniMouseSize = springMat.uniforms.mouseSize;

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

    getDataType() {
        return (/(iPad|iPhone|iPod)/g).test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType;
    }

    setMouseSize(_newSize) {
        this.uniMouseSize.value = _newSize;
    }

    update(_tD) {
        this.targetSwap = !this.targetSwap;

        if (this.targetSwap) {
            this.rTargetActive = this.rTarget1;
            this.rTargetInactive = this.rTarget2;
        } else {
            this.rTargetActive = this.rTarget2;
            this.rTargetInactive = this.rTarget1;
        }

        this.uniTimeDelta.value = _tD;
        this.uniHeightMap.value = this.rTargetInactive.texture;
        this.renderer.render(this.springScene, this.springCam, this.rTargetActive);

        if (this.devMode) {
            this.devMat.map = this.rTargetActive.texture;
            this.renderer.setViewport(0, 0, this.subdivs.x * 2.0, this.subdivs.y * 2.0);
            this.renderer.render(this.devScene, this.devCam);
            this.renderer.setViewport(0, 0, this.ogSize.width, this.ogSize.height);
        }

        return this.rTargetActive.texture;
    }
}
