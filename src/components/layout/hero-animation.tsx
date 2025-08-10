
"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";

// Since we can't statically import from `public`, we fetch the animation data
// and store it in state to be used by the Lottie component.
export function HeroAnimation({ className }: { className?: string }) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Correctly fetch the JSON file from the public folder
    fetch('/animation.json')
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data);
      })
      .catch((error) => console.error("Error loading animation:", error));
  }, []);

  // While the animation is loading, we can show a placeholder or nothing.
  if (!animationData) {
    return null;
  }

  return <Lottie animationData={animationData} className={className} />;
}
