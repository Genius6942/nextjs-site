import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

import React, { createRef } from "react";

export default class World extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = createRef();
  }

  componentDidMount() {
    this.initWorld();
  }

  /**
   * @function initWorld - creates threejs world. Run once component mounted.
   */
  initWorld() {
    // Scene
    this.scene = new THREE.Scene();
    const bgTexture = new THREE.TextureLoader().load('space.jpg');
    const bgMesh = new THREE.Mesh(
      new THREE.SphereGeometry(Math.sqrt(2) * 400, 100, 100),
      new THREE.MeshStandardMaterial({
        map: bgTexture,
        side: THREE.BackSide,
      }),
    );

    this.scene.add(bgMesh);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, .1, 1000);
    this.camera.position.setZ(50);

    // Lights
    this.light = new THREE.PointLight(0xffffff); // Point Light
    this.light.position.set(5, 5, 5);

    this.ambientLight = new THREE.AmbientLight(0xffffff); // Ambient Light

    this.scene.add(this.light, this.ambientLight);

    // renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.current,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer = renderer;

    // Resizing
    window.addEventListener('resize', () => {
      // Resize camera
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      // Resize renderer
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Helpers
    this.lightHelper = new THREE.PointLightHelper(this.light);
    this.gridHelper = new THREE.GridHelper(400, 50);
    this.scene.add(this.lightHelper, this.gridHelper);

    this.controls = new OrbitControls(this.camera, renderer.domElement);

    // Add some stuff to see
    this.populateWorld();
    
    requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * @function populateWorld - puts some stuff in the threejs world.
   */
  populateWorld() {
    this.torus = new THREE.Mesh(
      new THREE.TorusGeometry(10, 3, 16, 100),
      new THREE.MeshStandardMaterial({
        color: 0xff6347,
      }),
    );
    // this.scene.add(this.torus);

    this.addStars(1600);

    this.createWelcomeText();

    this.createRocket();
  }

  createWelcomeText() {
    const loader = new FontLoader();
    loader.load(
      '/fonts/helvetiker_bold.typeface.json',
      (font) => {
        console.log('loaded')
        const geometry = new TextGeometry('Joshua',
          {
            font: font,
            size: 10,
            height: 5,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 5/4,
            bevelSize: .2,
            bevelOffset: 0,
            bevelSegments: 5
          }
        );
        const mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({ color: 0x696969 }),
        );
        mesh.rotation.y = -Math.PI / 2;
        mesh.position.set(30, 0, -30)
        this.scene.add(mesh);
      },
      // onProgress callback
      function (xhr) {
        console.log(xhr.total, xhr.loaded);
        console.log( (xhr.loaded / xhr.total * 100) + '% font loaded' );
      },

      // onError callback
      function ( err ) {
        console.log( 'An error happened' );
      }
    );
  }

  /**
   * @function addStars - puts some nice looking star dots in our scene
   * @param {Number} amount - how many stars to add
   */
  addStars(amount) {
    Array(amount).fill().forEach(() => {
      // Create star
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 24, 24),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
        }),
      );
      
      // Random place for star
      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(400));
      star.position.set(x, y, z);
      this.scene.add(star);
    });
  }
  
  /**
   * @function createRocket - make the rocket that navigates the page
   */
   createRocket() {
    new GLTFLoader().load(
      // resource URL
      '/rocket.glb',

      // called when the resource is loaded
      (gltf) => {
        gltf.scene.children[0].material.color = new THREE.Color(0x3399cc);
        gltf.scene.children[0].material.needsUpdate = true;
        gltf.scene.rotation.y = -Math.PI / 4;
        this.rocket = gltf.scene;
        this.scene.add(this.rocket);
        console.log(gltf.scene);
      },

      // called while loading is progressing
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    
      },
      // called when loading has errors
      (error) => {
        console.log(error);
      }
    );
  }

  /**
   * @function animate - recursivly animate our threejs world
   */
  animate() {
    this.renderer.render(this.scene, this.camera);

    this.torus.rotation.x += .01;
    this.torus.rotation.y += .005;
    this.torus.rotation.z += .01;

    this.controls.update();
    
    requestAnimationFrame(this.animate.bind(this));
  }

  render() {
    return (
      <canvas className="fixed top-0 left-0 w-screen h-screen -z-10" ref={ this.canvasRef }/>
    )
  }
}