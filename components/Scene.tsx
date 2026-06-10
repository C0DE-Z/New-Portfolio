"use client"
import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface SceneProps {
    onLoadComplete?: () => void;
}

export default function Scene({ onLoadComplete }: SceneProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const orbitAngleRef = useRef(0);
    const modelRef = useRef<THREE.Object3D | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const parent = canvasRef.current.parentElement;
            const width = parent?.clientWidth || window.innerWidth / 2;
            const height = parent?.clientHeight || window.innerHeight;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
            renderer.setSize(width, height);
            renderer.setClearColor(0x000000, 0);
            
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.minDistance = 50;
            controls.maxDistance = 500;

            const loader = new GLTFLoader();
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('/draco/');
            loader.setDRACOLoader(dracoLoader);

            loader.load('/models/fpv-drone/fpv.gltf', (gltf) => {
                modelRef.current = gltf.scene;
                scene.add(gltf.scene);
                if (onLoadComplete) {
                    setTimeout(() => onLoadComplete(), 1000);
                }
            }, undefined, (error) => {
                console.error('An error occurred while loading the model:', error);
                if (onLoadComplete) onLoadComplete();
            });

            camera.position.z = 300;

            const pointLight = new THREE.PointLight(0xffffff, 50);
            pointLight.position.set(0, 0, 10);
            scene.add(pointLight);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);

            const animate = function () {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);

                if (!controls.enabled) {
                    orbitAngleRef.current += 0.001;
                    camera.position.x = 300 * Math.sin(orbitAngleRef.current);
                    camera.position.z = 300 * Math.cos(orbitAngleRef.current);
                    camera.lookAt(scene.position);
                }
            };

            const resetIdleTimeout = () => {
                if (idleTimeoutRef.current) {
                    clearTimeout(idleTimeoutRef.current);
                }
                controls.enabled = true;
                idleTimeoutRef.current = setTimeout(() => {
                    controls.enabled = false;
                }, 1500);
            };

            window.addEventListener('mousemove', resetIdleTimeout);
            window.addEventListener('mousedown', resetIdleTimeout);
            window.addEventListener('touchstart', resetIdleTimeout);

            animate();
            resetIdleTimeout();

            const handleResize = () => {
                if (canvasRef.current) {
                    const p = canvasRef.current.parentElement;
                    const w = p?.clientWidth || window.innerWidth / 2;
                    const h = p?.clientHeight || window.innerHeight;
                    camera.aspect = w / h;
                    camera.updateProjectionMatrix();
                    renderer.setSize(w, h);
                }
            };
            window.addEventListener('resize', handleResize);

            const handleScroll = () => {
                if (modelRef.current) {
                    modelRef.current.rotation.y = window.scrollY * 0.005;
                }
            };
            window.addEventListener('scroll', handleScroll);

            return () => {
                window.removeEventListener('mousemove', resetIdleTimeout);
                window.removeEventListener('mousedown', resetIdleTimeout);
                window.removeEventListener('touchstart', resetIdleTimeout);
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', handleScroll);
                if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
                renderer.dispose();
            };
        }
    }, [onLoadComplete]);

    return <canvas ref={canvasRef} className="w-full h-full block bg-transparent"></canvas>;
}
