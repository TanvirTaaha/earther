import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import SceneInit from './scene_init.js';

// const continentCenters = [
//   { continent: "Africa", lat: 9.1021, lon: 21.4531 },
//   { continent: "Asia", lat: 34.0479, lon: 100.6197 },
//   { continent: "Europe", lat: 54.5260, lon: 15.2551 },
//   { continent: "North America", lat: 54.5260, lon: -105.2551 },
//   { continent: "South America", lat: -14.2350, lon: -51.9253 },
//   { continent: "Australia", lat: -25.2744, lon: 133.7751 },
//   { continent: "Antarctica", lat: -82.8628, lon: 135.0000 },
//   // { continent: "Dhaka", lat: 23.8041, lon: 90.4152 },
//   // { continent: "Prime Meridian", lat: 0, lon: 0 },
// ];


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

function deleteObject(object, parent) {
  parent.remove(object);
  object.geometry.dispose();
  object.material.dispose();
}

function isPointingToCamera(object, camera) {
  // Step 1: Get the position of the camera
  const cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);

  // Step 2: Get the position of the object
  const objectPosition = new THREE.Vector3();
  object.getWorldPosition(objectPosition);

  // Step 3: Calculate the direction from the object to the camera
  const toCamera = new THREE.Vector3();
  toCamera.subVectors(cameraPosition, objectPosition).normalize();

  // Step 4: Get the object's forward direction (local Z axis in world space)
  const objectForward = new THREE.Vector3(0, 0, 1); // assuming forward is along local Z
  object.localToWorld(objectForward);
  objectForward.sub(objectPosition).normalize(); // Convert to world space and normalize

  // Step 5: Compute the dot product between the forward direction and the direction to the camera
  const dotProduct = objectForward.dot(toCamera);

  // Step 6: If the dot product is positive, the object is facing the camera
  return dotProduct > 0;
}

export const EarthScene = {
  mounted() {
    let continentCenters = JSON.parse(this.el.dataset.continents);
    //  console.log("in mounted:", continentCenters);
    // continentCenters.forEach(continent => {
    // //  console.log(`Continent: ${continent.continent}, Lat: ${continent.lat}, Lon: ${continent.lon}`);
    // });


    this.initThreeScene(continentCenters);
  },
  initThreeScene(continentCenters) {
    const scene_obj = new SceneInit('earthScene');
    scene_obj.initialize();
    scene_obj.animate();

    var loadedModel;
    var initial_scale = 1;
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
        //  console.log("in loader.load() loadedModel:", loadedModel);
        set_points_each_frame(continentCenters);
      },
      // called while loading is progressing
      function (xhr) {

        //  console.log((xhr.loaded / xhr.total * 100) + '% loaded');

      },
      // called when loading has errors
      function (error) {

        //  console.log('An error happened');
        //  console.log(error);
      }
    );
    //  console.log("Hello1");

    var anchors = [];

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
        const smsphereGeom = new THREE.SphereGeometry(0.01);
        const smSphereMat = new THREE.MeshPhysicalMaterial({ color: "rgb(94, 234, 212)" });
        const smSphere = new THREE.Mesh(smsphereGeom, smSphereMat);

        let spherical_coords = geographicToSpherical(location.lat, location.lon);
        spherical_coords = new THREE.Spherical(radius, spherical_coords.phi, spherical_coords.theta)
        const smSpherePosition = new THREE.Vector3().setFromSpherical(spherical_coords);
        // const smSpherePosition = new THREE.Vector3().setFromSpherical(new THREE.Spherical(radius, 0, 0));
        // console.log("Spherical Coords:", spherical_coords);
        // console.log("Anchor pos:", smSpherePosition);
        smSphere.position.copy(smSpherePosition);

        bigSphere.add(smSphere);
        anchors.push(smSphere);
        // console.log(location.continent);
        // console.log(docId);
        // console.log(floatingDiv);
      });
      loadedModel.scene.add(bigSphere);
      project_to_camera();
    }

    const project_to_camera = () => {
      for (let index = 0; index < anchors.length; index++) {
        const docId = `floatingDiv-${continentCenters[index].continent}`;
        const floatingDiv = document.getElementById(docId);

        let positionVec = new THREE.Vector3().setFromMatrixPosition(anchors[index].matrixWorld);
        positionVec.project(scene_obj.camera);

        // Get the direction for arrow
        direction = new THREE.Vector3();
        direction.copy(anchors[index].position);
        direction.normalize();

        //Camera position
        cameraPosition = new THREE.Vector3();
        cameraPosition.copy(scene_obj.camera.position);
        cameraPosition.normalize();

        dotProduct = cameraPosition.dot(direction);

        const widthHalf = scene_obj.canvas.width * 0.5, heightHalf = scene_obj.canvas.height * 0.5;
        const rect = scene_obj.canvas.getBoundingClientRect();
        floatingDiv.style.top = `${rect.top - (positionVec.y * heightHalf) + heightHalf}px`;
        floatingDiv.style.left = `${rect.left + (positionVec.x * widthHalf) + widthHalf}px`;
        // opacity = 0.9 * 0.5 * (1 + dotProduct);
        // floatingDiv.style.opacity = `${opacity}`;
        visibility = (dotProduct > 0.2) ? 'visible' : 'hidden';
        floatingDiv.style.visibility = visibility;
      }
      // playWithOrientation(anchors[0]);
    }
    // var arrow = undefined;
    const playWithOrientation = (object) => {
      // Update object's world matrix
      object.updateMatrixWorld();

      // Get the object's forward direction (local Z axis in global space)
      const forward = new THREE.Vector3(0, 0, 1); // local Z axis
      object.localToWorld(forward); // transforms to world space
      forward.normalize(); // normalize the vector

      // console.log(`Forward Direction: X: ${THREE.MathUtils.radToDeg(forward.x)}, Y: ${THREE.MathUtils.radToDeg(forward.y)}, Z: ${THREE.MathUtils.radToDeg(forward.z)}`)

      // if (arrow) {
      //   scene_obj.scene.remove(object);
      // }

      forward.normalize();
      let origin = new THREE.Vector3(0, 0, 0);
      const length = 2;
      const hex = 0xffff00;
      // arrow = new THREE.ArrowHelper(forward, origin, length, hex);
      // scene_obj.scene.add(arrow);
    }

    const animate = () => {
      if (loadedModel) {
        // loadedModel.scene.rotation.y += 0.005;
        project_to_camera();
      }
      // requestAnimationFrame(animate);
    };
    scene_obj.setAnimationCallback(animate);
    scene_obj.animate();
    // animate();
    //  console.log("Hello2");

  }
}