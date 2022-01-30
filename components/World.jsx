import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Fire } from "./Fire";

import React, { createRef } from "react";

export default class World extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = createRef();

    this.state = {
      showScroll: false,
    }
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
    this.camera.position.z = 1400;
    this.cameraHolder = new THREE.Object3D();
    this.cameraHolder.add(this.camera);
    this.scene.add(this.cameraHolder);
    this.cameraHolder.rotation.y = -Math.PI / 4;
    this.cameraHolder.position.y = 20;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    

    // Lights
    this.light = new THREE.PointLight(0xffffff, .5); // Point Light
    this.light.position.set(-5, 5, 5);

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
    // this.lightHelper = new THREE.PointLightHelper(this.light);
    this.gridHelper = new THREE.GridHelper(400, 50);
    this.scene.add(this.gridHelper);

    // this.controls = new OrbitControls(this.camera, renderer.domElement);

    // Add some stuff to see
    this.populateWorld();

    // Opening animation when u start
    this.openAnimation = true;
    
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
    const createText = (font, words) => {
      const geometry = new TextGeometry(
        words,
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

      return mesh;
    }
    const loader = new FontLoader();
    loader.load(
      '/fonts/helvetiker_bold.typeface.json',
      (font) => {
        console.log('loaded')
        const firstName = createText(font, 'Joshua');
        const lastName = createText(font, 'Liu');
        lastName.geometry.computeBoundingBox();
        const lastNameBox = lastName.geometry.boundingBox;
        const height = lastNameBox.max.y - lastNameBox.min.y;
        const full = createText(font, 'Full');
        const stack = createText(font, 'Stack');
        const developer = createText(font, 'Developer');
        developer.geometry.computeBoundingBox();
        const developerBox = developer.geometry.boundingBox;

        // Name
        firstName.rotation.y = -Math.PI / 2;
        firstName.position.set(60, height, -20);
        this.scene.add(firstName);

        lastName.rotation.y = -Math.PI / 2;
        lastName.position.set(60, 0, -5);
        this.scene.add(lastName);

        developer.position.set(-45, 0, -70);
        this.scene.add(developer);

        stack.position.set(-45, height, -70);
        this.scene.add(stack);

        full.position.set(-35, height * 2, -70);
        this.scene.add(full);
      },

      // onProgress callback
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% font loaded');
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
        gltf.scene.scale.set(4, 4, 4);
        this.rocket = gltf.scene;
        this.scene.add(this.rocket);
        console.log(gltf.scene);

        // this.createFire(); (doesn't work rn)
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

  createFire() {
    const params = {
      color1: '#ffffff',
      color2: '#ffa000',
      color3: '#000000',
      colorBias: 0.8,
      burnRate: 0.35,
      diffuse: 1.33,
      viscosity: 0.25,
      expansion: - 0.25,
      swirl: 50.0,
      drag: 0.35,
      airSpeed: 12.0,
      windX: 0.0,
      windY: 0.75,
      speed: 500.0,
      massConservation: false
    };
    var plane = new THREE.PlaneBufferGeometry( 20, 20 );
    const fire = new Fire(plane);
    fire.position.z = - 2;
    fire.addSource( 0.45, 0.1, 0.1, 0.5, 0.0, 1.0 );
    // this.scene.add( fire );
  }

  /**
   * @function animate - recursivly animate our threejs world
   */
  animate() {
    this.renderer.render(this.scene, this.camera);
    this.torus.rotation.x += .01;
    this.torus.rotation.y += .005;
    this.torus.rotation.z += .01;

    if (this.openAnimation && this.camera.position.z > 60) {
      this.camera.position.z -= 10;
    } else if (this.openAnimation) {
      this.openAnimation = false;
      window.addEventListener('wheel', ({ deltaY }) => {
        const loc = Math.max(this.rocket.position.y + deltaY / 5, 0);
        this.rocket.position.y = loc;
        this.cameraHolder.position.y = loc + 20;
      });
      this.setState({ showScroll: true });
    }

    requestAnimationFrame(this.animate.bind(this));
  }

  render() {
    return (
      <>
        <canvas className="fixed top-0 left-0 w-screen h-screen -z-10" ref={ this.canvasRef }/>
        <div
          className="flex flex-col items-center fixed bottom-10 left-1/2 -translate-x-1/2"
          style = {{ display: this.state.showScroll ? 'flex' : 'none' }}
        >
          <span className="mb-2 text-white font-bold">
            Scroll To Launch
          </span>
          <div className="flex justify-center items-center w-8 h-8 font-bold bg-white rounded-full">
            <div className="border-black w-3 h-3 border-b-4 border-l-4 -mt-1 -rotate-45"/>
          </div>
        </div>
      </>
    );
  }
}