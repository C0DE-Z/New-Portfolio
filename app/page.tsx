/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useState, useEffect, useRef } from "react";
import { FaGithub, FaInfoCircle, FaProjectDiagram} from "react-icons/fa";
import {SiLeetcode} from "react-icons/si";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { motion } from 'framer-motion'; // Import Framer Motion
import { IconType } from "react-icons";
import React from "react";
import Footer from "../components/footer";
import GridBackground from "../components/ui/grid-backround";
import Projects from "../components/projects";
import TextEffect from "../components/ui/textEffect";
import Hero from "../components/hero";
import About from "../components/about";
import Contact from "../components/contact";

export default function Home() {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const orbitAngleRef = useRef(0);
  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);

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

      loader.load('/models/scene.glb', (gltf: { scene: THREE.Object3D<THREE.Object3DEventMap>; }) => {
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material.map) {
              child.material.map.needsUpdate = true;
            }
    
          }
        });
        scene.add(gltf.scene);
      }, undefined, (error) => {
        console.error('An error occurred while loading the model:', error);
        
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
    <div>
      <section id="hero" className="relative min-h-[75vh]">
        <Hero canvasRef={canvasRef}/>
      </section>
      <section id="about" className="relative min-h-[25vh]">
        <GridBackground/>
        <About/> 
        </section>
      <section id="projects" className="relative min-h-[75vh]">
        <GridBackground/>            
        <Projects/>
      </section>

      <section id="contact" className="relative min-h-[75vh]">
        <GridBackground/>
        <Contact/>
        
      </section>
      <div ref={footerRef} className="fixed bottom-0 w-full">
        <Footer/>
      </div>
    </div>
  );
}
