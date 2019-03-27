import * as THREE from "three";
import { zTween } from "../utils/";

import vShader from "./glsl/photo.vs";
import fShader from "./glsl/photo.fs";

export default class Photo {
    constructor(_subdivs) {
        this.texAlternation = 0;

        const geom = new THREE.PlaneBufferGeometry(6, 8, _subdivs.x, _subdivs.y);
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

        // Uniform shortcuts
        this.uniMap0 = material.uniforms.map0;
        this.uniMap1 = material.uniforms.map1;
        this.uniHeight = material.uniforms.heightmap;
        this.uniTrans = material.uniforms.transition;

        this.textureLoader = new THREE.TextureLoader();
        this.plane = new THREE.Mesh(geom, material);
    }

    // ******************* UTILITIES ******************* //

    // Get image and create texture
    loadImage(url) {
        this.textureLoader.load(url, this.imageLoaded.bind(this));
    }

    // Image texture is ready
    imageLoaded(texture) {
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

    update(_t, _texture) {
        this.uniTrans.value = zTween(this.uniTrans.value, this.texAlternation, 0.1);
        this.uniHeight.value = _texture;
    }
}

