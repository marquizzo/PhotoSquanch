import * as THREE from "three";
import { zTween } from "../utils/";

import vShader from "./glsl/photo.vs";
import fShader from "./glsl/photo.fs";

export default class Photo {
    private texAlternation: number;
    private textureLoader: THREE.TextureLoader;
    private mesh: THREE.Mesh;

    // Uniforms
    private uniMap0: THREE.IUniform;
    private uniMap1: THREE.IUniform;
    private uniHeight: THREE.IUniform;
    private uniTrans: THREE.IUniform;

    constructor(subdivs: THREE.Vector2) {
        this.texAlternation = 0;

        const geom = new THREE.PlaneBufferGeometry(6, 8, subdivs.x, subdivs.y);
        const material = new THREE.RawShaderMaterial({
            uniforms: {
                map0: { value: null },
                map1: { value: null },
                heightmap: {value: null},
                transition: {value: 0},
            },
            vertexShader: vShader,
            fragmentShader: fShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        this.mesh = new THREE.Mesh(geom, material);

        // Uniform shortcuts
        this.uniMap0 = material.uniforms.map0;
        this.uniMap1 = material.uniforms.map1;
        this.uniHeight = material.uniforms.heightmap;
        this.uniTrans = material.uniforms.transition;

        this.textureLoader = new THREE.TextureLoader();
    }

    // ******************* PUBLIC METHODS ******************* //
    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    // Get image and create texture
    public loadImage(url: string): void {
        this.textureLoader.load(url, this.imageLoaded.bind(this));
    }

    // Image texture is ready
    private imageLoaded(texture: THREE.Texture):void {
        texture.minFilter = THREE.LinearFilter;

        if (this.texAlternation === 0) {
            this.uniMap1.value = texture;
            this.texAlternation = 1;
        } else {
            this.uniMap0.value = texture;
            this.texAlternation = 0;
        }
    }

    // ******************* UPDATE ******************* //
    update(timeDelta: number, heightMap: THREE.Texture):void {
        this.uniTrans.value = zTween(this.uniTrans.value, this.texAlternation, 0.1);
        this.uniHeight.value = heightMap;
    }
}

