"use client"
import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface FpvModelViewerProps {
    propColor: string;
    frameColor: string;
    armed: boolean;
    onLoadComplete?: () => void;
    onTelemetryUpdate?: (yaw: number, pitch: number, roll: number) => void;
}

export default function FpvModelViewer({
    propColor,
    frameColor,
    armed,
    onLoadComplete,
    onTelemetryUpdate
}: FpvModelViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const propsRef = useRef<THREE.Mesh[]>([]);
    const framePartsRef = useRef<THREE.Mesh[]>([]);
    const modelRef = useRef<THREE.Group | null>(null);
    const animationFrameId = useRef<number | null>(null);

    // Track color updates
    useEffect(() => {
        propsRef.current.forEach(mesh => {
            if (mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.color.set(propColor);
            }
        });
    }, [propColor]);

    useEffect(() => {
        framePartsRef.current.forEach(mesh => {
            if (mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.color.set(frameColor);
            }
        });
    }, [frameColor]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.set(200, 150, 200);

        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 500;
        controls.minDistance = 50;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(100, 200, 50);
        scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5, 300);
        pointLight.position.set(-100, -50, -100);
        scene.add(pointLight);

        // Model Loader
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        loader.setDRACOLoader(dracoLoader);

        loader.load('/models/fpv-drone/fpv.gltf', (gltf) => {
            const model = gltf.scene;
            modelRef.current = model;
            
            // Adjust model scale and center
            model.scale.set(1.5, 1.5, 1.5);
            
            // Compute bounding box to center it
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            model.position.sub(center); // center the model

            scene.add(model);

            // Mesh analysis to locate propellers & frame elements dynamically
            const geomGroups = new Map<number, THREE.Mesh[]>();
            
            model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const geom = child.geometry;
                    const count = geom.attributes.position.count;
                    if (!geomGroups.has(count)) {
                        geomGroups.set(count, []);
                    }
                    geomGroups.get(count)!.push(child);
                }
            });

            const propellers: THREE.Mesh[] = [];
            const frameParts: THREE.Mesh[] = [];

            for (const [, meshes] of geomGroups.entries()) {
                if (meshes.length === 4) {
                    // This group of 4 identical meshes could be propellers
                    const sample = meshes[0];
                    sample.geometry.computeBoundingBox();
                    const bbox = sample.geometry.boundingBox;
                    if (bbox) {
                        const size = new THREE.Vector3();
                        bbox.getSize(size);
                        const maxDim = Math.max(size.x, size.y, size.z);
                        // Propellers are the largest repeating sets of 4
                        if (maxDim > 30) {
                            propellers.push(...meshes);
                        }
                    }
                } else if (meshes.length === 1 || meshes.length === 2) {
                    // Frame plates are usually unique or pairs
                    const sample = meshes[0];
                    sample.geometry.computeBoundingBox();
                    const bbox = sample.geometry.boundingBox;
                    if (bbox) {
                        const size = new THREE.Vector3();
                        bbox.getSize(size);
                        const maxDim = Math.max(size.x, size.y, size.z);
                        // Select large frame structure elements
                        if (maxDim > 80) {
                            frameParts.push(...meshes);
                        }
                    }
                }
            }

            // Clone materials so color changes don't bleed
            propellers.forEach(mesh => {
                if (mesh.material) {
                    const originalMat = mesh.material as THREE.MeshStandardMaterial;
                    mesh.material = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(propColor),
                        roughness: 0.4,
                        metalness: 0.2,
                        map: originalMat.map || null
                    });
                }
            });

            frameParts.forEach(mesh => {
                if (mesh.material) {
                    const originalMat = mesh.material as THREE.MeshStandardMaterial;
                    mesh.material = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(frameColor),
                        roughness: 0.6,
                        metalness: 0.8,
                        map: originalMat.map || null
                    });
                }
            });

            propsRef.current = propellers;
            framePartsRef.current = frameParts;

            if (onLoadComplete) {
                onLoadComplete();
            }
        }, undefined, (error) => {
            console.error("An error occurred loading the FPV model:", error);
            if (onLoadComplete) onLoadComplete();
        });

        // Animation Loop
        const animate = (time: number) => {
            animationFrameId.current = requestAnimationFrame(animate);
            
            controls.update();

            // Rotate props if armed
            if (armed && propsRef.current.length > 0) {
                propsRef.current.forEach((prop, idx) => {
                    // Alternate rotation directions for clean quadcopter aerodynamics
                    const dir = idx % 2 === 0 ? 1 : -1;
                    prop.rotation.y += 0.4 * dir; // spin around vertical axis
                });
            }

            // Report telemetry based on camera position relative to model
            if (onTelemetryUpdate && modelRef.current) {
                const dir = new THREE.Vector3();
                camera.getWorldDirection(dir);
                // Simple trig translation to simulate telemetry rotation pitch/yaw
                const pitch = Math.round(dir.y * 90);
                const yaw = Math.round(Math.atan2(dir.x, dir.z) * (180 / Math.PI));
                const roll = armed ? Math.round(Math.sin(time * 0.002) * 5) : 0;
                onTelemetryUpdate(yaw, pitch, roll);
            }

            renderer.render(scene, camera);
        };

        animationFrameId.current = requestAnimationFrame(animate);

        // Resize handler
        const resize = () => {
            const width = canvasRef.current?.parentElement?.clientWidth || 300;
            const height = canvasRef.current?.parentElement?.clientHeight || 300;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        
        window.addEventListener('resize', resize);
        resize(); // trigger initial layout

        return () => {
            window.removeEventListener('resize', resize);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            controls.dispose();
            renderer.dispose();
            dracoLoader.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [armed, onLoadComplete]);

    return (
        <div className="w-full h-full relative">
            <canvas ref={canvasRef} className="w-full h-full block bg-transparent" />
        </div>
    );
}
