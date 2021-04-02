			import * as THREE from '../build/three.module.js';

			import { PointerLockControls_device } from './jsm/controls/PointerLockControls_DeviceOrientation.js';

			let camera, evc, renderer, controls;

			const objects = [];

			let raycaster;

			let moveForward = false;
			let moveBackward = false;
			let moveLeft = false;
			let moveRight = false;
			let canJump = false;

			let prevTime = performance.now();
			const velocity = new THREE.Vector3();
			const direction = new THREE.Vector3();
			const vertex = new THREE.Vector3();
			const color = new THREE.Color();

			init();
			animate();

			function init() {

				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.y = 10;

				evc = new THREE.Scene();
				evc.background = new THREE.Color( 0xffffff );
				evc.fog = new THREE.Fog( 0xffffff, 0, 750 );

				const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
				light.position.set( 0.5, 1, 0.75 );
				evc.add( light );

				controls = new PointerLockControls_device( camera, document.body );

				const blocker = document.getElementById( 'blocker' );
				const instructions = document.getElementById( 'instructions' );

				evc.add( controls.getObject() );

				const onKeyDown = function ( event ) {
					switch ( event.code ) {
						case 'ArrowUp':
						case 'KeyW':
							moveForward = true;
							break;

						case 'ArrowLeft':
						case 'KeyA':
							moveLeft = true;
							break;

						case 'ArrowDown':
						case 'KeyS':
							moveBackward = true;
							break;

						case 'ArrowRight':
						case 'KeyD':
							moveRight = true;
							break;

						case 'Space':
							if ( canJump === true ) velocity.y += 350;
							canJump = false;
							break;
					}
				};

				const onKeyUp = function ( event ) {

					switch ( event.code ) {

						case 'ArrowUp':
						case 'KeyW':
							moveForward = false;
							break;

						case 'ArrowLeft':
						case 'KeyA':
							moveLeft = false;
							break;

						case 'ArrowDown':
						case 'KeyS':
							moveBackward = false;
							break;

						case 'ArrowRight':
						case 'KeyD':
							moveRight = false;
							break;
					}
				};

				document.addEventListener( 'keydown', onKeyDown );
				document.addEventListener( 'keyup', onKeyUp );

				raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

				// floor


				const geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
				const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );

				for ( let i = 0; i < 500; i ++ ) {

					const mesh = new THREE.Mesh( geometry, material );
					mesh.position.x = Math.random() * 1600 - 800;
					mesh.position.y = 0;
					mesh.position.z = Math.random() * 1600 - 800;
					mesh.updateMatrix();
					mesh.matrixAutoUpdate = false;
					evc.add( mesh );

				}

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			
			function animate() {
							requestAnimationFrame( animate );
							const time = performance.now();
							if ( controls.isLocked === true ) {
								raycaster.ray.origin.copy( controls.getObject().position );
								raycaster.ray.origin.y -= 10;
								const intersections = raycaster.intersectObjects( objects );
								const onObject = intersections.length > 0;
								const delta = ( time - prevTime ) / 1000;
								velocity.x -= velocity.x * 10.0 * delta;
								velocity.z -= velocity.z * 10.0 * delta;
								velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
								direction.z = Number( moveForward ) - Number( moveBackward );
								direction.x = Number( moveRight ) - Number( moveLeft );
								direction.normalize(); // this ensures consistent movements in all directions
								if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
								if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
								if ( onObject === true ) {
									velocity.y = Math.max( 0, velocity.y );
									canJump = true;
								}
								controls.moveRight( - velocity.x * delta );
								controls.moveForward( - velocity.z * delta );
								controls.getObject().position.y += ( velocity.y * delta ); // new behavior
								if ( controls.getObject().position.y < 10 ) {
									velocity.y = 0;
									controls.getObject().position.y = 10;
									canJump = true;
								}
							}
							prevTime = time;
							renderer.render( evc, camera );
						}
