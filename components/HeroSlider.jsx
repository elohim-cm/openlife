"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function HeroSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % images.length);
      
      // Réinitialiser prevIndex après la transition
      // setTimeout(() => {
      //   setPrevIndex(null);
      // }, 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, images.length]);

  return (
    <div className="hero-slider-custom">
      {images.map((img, index) => (
        <div
          key={index}
          className={`hero-slide-custom ${
            index === currentIndex ? "active" : ""
          } ${index === prevIndex ? "prev" : ""}`}
        >
          <div className="hero-slide-overlay"></div>
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority={index === 0}
            className="hero-slide-image"
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  );
}
