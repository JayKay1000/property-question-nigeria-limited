import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Renders a single equirectangular 360° panorama with drag-to-look navigation,
 * built on three.js. Fills its parent container (set a height on the parent).
 */
export default function Panorama360Viewer({ url, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !url) return;

    let renderer, scene, camera, sphere, animationId;
    let lon = 0, lat = 0;
    let isUserInteracting = false;
    let onPointerDownPointerX = 0, onPointerDownPointerY = 0, onPointerDownLon = 0, onPointerDownLat = 0;
    let cleanup = () => {};

    const w0 = container.clientWidth || 640;
    const h0 = container.clientHeight || 400;

    camera = new THREE.PerspectiveCamera(75, w0 / h0, 1, 1100);
    scene = new THREE.Scene();

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // view from inside the sphere
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const texture = loader.load(url);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w0, h0);
    container.appendChild(renderer.domElement);

    const onPointerDown = (e) => {
      isUserInteracting = true;
      onPointerDownPointerX = e.clientX;
      onPointerDownPointerY = e.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    };
    const onPointerMove = (e) => {
      if (!isUserInteracting) return;
      lon = onPointerDownLon - (e.clientX - onPointerDownPointerX) * 0.1;
      lat = onPointerDownLat + (e.clientY - onPointerDownPointerY) * 0.1;
      lat = Math.max(-85, Math.min(85, lat));
    };
    const onPointerUp = () => { isUserInteracting = false; };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!isUserInteracting) lon += 0.03;
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(target);
      renderer.render(scene, camera);
    };
    animate();

    cleanup = () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };

    return () => cleanup();
  }, [url]);

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%" }} />;
}