"use client"
import { useState, useEffect, useRef } from "react";
import { FaGithub, FaInfoCircle, FaProjectDiagram} from "react-icons/fa";
import {SiLeetcode} from "react-icons/si";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { motion } from 'framer-motion'; // Import Framer Motion
import { IconType } from "react-icons";
import React from "react";


const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()";

export default function Home() {
  const [hovered, setHovered] = useState(false);
  const mainRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const orbitAngleRef = useRef(0);
  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      let iteration = 0;
      const main = mainRef.current;
      const targetText = hovered ? "Code-Z" : "Nicholas";
      const interval = setInterval(() => {
        main.innerText = main.innerText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("");

        if (iteration >= targetText.length) {
          clearInterval(interval);
        }

        iteration += 1 / 3;
      }, 30);

      return () => clearInterval(interval);
    }
  }, [hovered]);

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
      controls.minDistance = 300; 
      controls.maxDistance = 300;

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/'); // Update the path to the Draco decoder
      loader.setDRACOLoader(dracoLoader);

      loader.load('/models/fpv.gltf', (gltf: { scene: THREE.Object3D<THREE.Object3DEventMap>; }) => {
        scene.add(gltf.scene);
      });

      // Starting zoom
      camera.position.z = 300;

      const pointLight = new THREE.PointLight(0xffffff, 50); // Add point light
      pointLight.position.set(0, 0, 30); 
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

  useEffect(() => { // Broken Currently - Needs to be fixed
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          } else {
            entry.target.classList.remove("animate");
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) {
        observer.current?.observe(section);
      }
    });

    return () => {
      observer.current?.disconnect();
    };
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
    // Main Page
    <div>
      <section ref={(el) => { sectionRefs.current[0] = el as HTMLDivElement }} className="relative min-h-screen">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `
              linear-gradient(to right, rgba(128, 128, 128, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.05) 1px, transparent 1px)
            `,
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 60,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        <div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <header className="absolute top-1/3 transform -translate-y-1/2 sm:left-20 text-center sm:text-left">
            <h1 
              className={`text-[4rem] sm:text-[5rem] transition-colors duration-300`}>
              Hello I&apos;m
            </h1>
            <h1 
              ref={mainRef}
              data-value="Code-Z"
              className={`text-[3rem] sm:text-[4rem] transition-colors duration-300`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {hovered ? "Code-Z" : "Nicholas"}
            </h1>
            <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
              <li className="mb-2">
                Full Stack Web-Developer, And Robotics Enthusiast.
              </li>
            </ol>

            <div className="mt-4 mb-2 flex gap-4 items-center flex-col sm:flex-row">
              <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                href="https://github.com/C0DE-Z"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub className="text-lg" />
                Github
              </a>
              
              <a
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
                href="https://leetcode.com/C0DE-Z"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiLeetcode className="text-lg" />
                ‎
                ‎ 
                LeetCode
              </a>
            </div>
          </header>

          <main className="flex flex-col gap-8 row-start-2 sm:items-start">
            <div className="absolute right-0 top-0 w-1/2 h-full">
              <canvas ref={canvasRef} className="w-full h-full"></canvas>
            </div>
          </main>

        </div>
      </section>
      <section ref={(el) => { sectionRefs.current[1] = el as HTMLDivElement }} className="relative min-h-screen">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `
              linear-gradient(to right, rgba(128, 128, 128, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.05) 1px, transparent 1px)
            `,
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 60,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        <div className="relative grid grid-rows items-center justify-center ">
          <h1 className="text-[3rem] sm:text-[4rem] transition-colors">About Me</h1>
        </div>
      </section>
      <section ref={(el) => { sectionRefs.current[2] = el as HTMLDivElement }} className="relative min-h-screen">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `
              linear-gradient(to right, rgba(128, 128, 128, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.05) 1px, transparent 1px)
            `,
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 60,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        <div className="relative grid grid-rows items-center justify-center ">
        </div>
      </section>
      <div ref={footerRef} className="fixed bottom-0 w-full">
        <footer className="flex gap-6 flex-wrap items-center justify-center pb-[4.5rem]">
          <FooterLink href="/about" icon={FaInfoCircle} text="About" />
          <FooterLink href="/projects" icon={FaProjectDiagram} text="Projects" />
          <FooterLink href="https://github.com/C0DE-Zs" icon={FaGithub} text="Source Code" />
        </footer>
      </div>
    </div>
  );
}

// Move to Components ltr
function FooterLink({ href, icon: Icon, text }: { href: string; icon: IconType; text: string }) {
  return (
    <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="text-lg" />
      {text}
    </a>
  );
}
