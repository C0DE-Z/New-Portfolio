/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { motion } from 'framer-motion';

import React from "react";
import Footer from "../components/footer";
import GridBackground from "../components/ui/grid-backround";
import Projects from "../components/projects";
import Hero from "../components/hero";
import About from "../components/about";
import Contact from "../components/contact";

export default function Home() {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const orbitAngleRef = useRef(0);
  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current) {

      // Render the 3d model
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
      renderer.setSize(window.innerWidth / 2, window.innerHeight); 
      renderer.setClearColor(0x000000, 0);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      // Min and Max distance for scroll (Currently Locked)
      controls.minDistance = 0; 
      controls.maxDistance = 300;
      
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/'); 
      loader.setDRACOLoader(dracoLoader);

      loader.load('/models/fpv-drone/fpv.gltf', (gltf: { scene: THREE.Object3D<THREE.Object3DEventMap>; }) => {
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material.map) {
              child.material.map.needsUpdate = true;
            }
    
          }
        });
        scene.add(gltf.scene);
        setTimeout(() => setLoading(false), 1000);
      }, undefined, (error) => {
        console.error('An error occurred while loading the model:', error);
        setLoading(false); // Stop loading on error
      });

      // Starting zoom
      camera.position.z = 300;

      const pointLight = new THREE.PointLight(0xffffff, 50); // Add point light
      pointLight.position.set(0, 0, 10); 
      scene.add(pointLight);

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

      // Start spinning after a timeout
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

      return () => {
        window.removeEventListener('mousemove', resetIdleTimeout);
        window.removeEventListener('mousedown', resetIdleTimeout);
        window.removeEventListener('touchstart', resetIdleTimeout);
      };
    }
  }, []);

  useEffect(() => { // Hide the footer on scroll
    const handleScroll = () => {
      if (footerRef.current) {
        if (window.scrollY > 60) {
          footerRef.current.style.opacity = '0';
          footerRef.current.style.transition = 'opacity 0.1s';
        } else {
          footerRef.current.style.opacity = '1';
          footerRef.current.style.transition = 'opacity 0.1s';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {loading && (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center text-3xl mb-4 z-10 text-gray-50">Loading! Please wait</div>
        <div role="status">
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
          />
          <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
          />
        </svg>
        </div>
      </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <section id="hero" className="relative min-h-[75vh]">
          <Hero canvasRef={canvasRef} />
        </section>
        <section id="about" className="relative min-h-[25vh]">
          <GridBackground />
          <About />
        </section>
        <section id="projects" className="relative min-h-[75vh]">
          <GridBackground />
          <Projects />
        </section>
        <section id="contact" className="relative min-h-[75vh]">
          <GridBackground />
          <Contact />
        </section>
        <div ref={footerRef} className="fixed bottom-0 w-full">
          <Footer />
        </div>
      </motion.div>
    </>
  );
}
