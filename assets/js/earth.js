import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import SceneInit from './SceneInit';

const continentCenters = [
  { continent: "Africa", lat: 9.1021, lon: 21.4531 },
  { continent: "Asia", lat: 34.0479, lon: 100.6197 },
  { continent: "Europe", lat: 54.5260, lon: 15.2551 },
  { continent: "North America", lat: 54.5260, lon: -105.2551 },
  { continent: "South America", lat: -14.2350, lon: -51.9253 },
  { continent: "Australia", lat: -25.2744, lon: 133.7751 },
  { continent: "Antarctica", lat: -82.8628, lon: 135.0000 },
  // { continent: "Dhaka", lat: 23.8041, lon: 90.4152 },
  // { continent: "Prime Meridian", lat: 0, lon: 0 },
];


function geographicToSpherical(lat, lon) {
  // Convert latitude and longitude from degrees to radians
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  // θ (theta) is the azimuthal angle (longitude)
  const theta = lonRad;

  // φ (phi) is the polar angle (90 degrees minus latitude, converted to radians)
  const phi = (Math.PI / 2) - latRad;

  return { theta, phi };
}


export const EarthScene = {
  mounted() {
    this.initThreeScene();
  },
  initThreeScene() {
    const scene_obj = new SceneInit('earthScene');
    scene_obj.initialize();
    scene_obj.animate();

    let loadedModel;
    let initial_scale = 1;
    scene_obj.controls.minDistance = 2;
    scene_obj.controls.maxDistance = 5;
    // Instantiate a loader
    const loader = new GLTFLoader();
    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    // Load a glTF resource
    loader.load(
      // resource URL
      "/files/earth_model/scene.gltf",
      // called when the resource is loaded
      function (gltf) {
        loadedModel = gltf;
        gltf.scene.scale.set(initial_scale, initial_scale, initial_scale);
        gltf.scene.rotation.y = Math.PI;

        scene_obj.scene.add(gltf.scene);
        // gltf.animations; // Array<THREE.AnimationClip>
        // gltf.scene; // THREE.Group
        // gltf.scenes; // Array<THREE.Group>
        // gltf.cameras; // Array<THREE.Camera>
        // gltf.asset; // Object
        console.log("in loader.load() loadedModel:", loadedModel);
        set_points_each_frame(continentCenters);
      },
      // called while loading is progressing
      function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

      },
      // called when loading has errors
      function (error) {

        console.log('An error happened');
        console.log(error);
      }
    );
    console.log("Hello1");

    const set_points_each_frame = (listOfLocations) => {
      const radius = 1;
      const bigSphereMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true });
      bigSphereMaterial.opacity = 0;
      const bigSphereGeometry = new THREE.SphereGeometry(radius);
      const bigSphere = new THREE.Line(bigSphereGeometry, bigSphereMaterial);
      // bigSphere.add(new THREE.AxesHelper(5));
      bigSphere.rotation.copy(new THREE.Euler(0, THREE.MathUtils.degToRad(180), 0));
      // loadedModel.scene.add(new THREE.AxesHelper(5));

      listOfLocations.forEach(location => {
        const smsphereGeom = new THREE.SphereGeometry(0.02);
        const smSphereMat = new THREE.MeshBasicMaterial({ color: 'teal' });
        const smSphere = new THREE.Mesh(smsphereGeom, smSphereMat);

        let spherical_coords = geographicToSpherical(location.lat, location.lon);
        spherical_coords = new THREE.Spherical(radius, spherical_coords.phi, spherical_coords.theta)
        const smSpherePosition = new THREE.Vector3().setFromSpherical(spherical_coords);
        // const smSpherePosition = new THREE.Vector3().setFromSpherical(new THREE.Spherical(radius, 0, 0));
        console.log("Spherical Coords:", spherical_coords);
        console.log("Anchor pos:", smSpherePosition);
        smSphere.position.copy(smSpherePosition);

        bigSphere.add(smSphere);
      });
      loadedModel.scene.add(bigSphere);
    }



    const animate = () => {
      if (loadedModel) {
        loadedModel.scene.rotation.y += 0.005;
      }
      requestAnimationFrame(animate);
    };
    animate();
    console.log("Hello2");

  }
}