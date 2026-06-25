"use client";

import { useEffect } from "react";

type AutoPrintProps = {
  enabled?: boolean;
};

export function AutoPrint({ enabled = true }: AutoPrintProps) {
  useEffect(() => {
    if (!enabled) return;

    let timer: number | null = null;

    const printPage = () => {
      window.focus();
      window.print();
    };

    const images = Array.from(document.images);

    if (images.every((image) => image.complete)) {
      timer = window.setTimeout(printPage, 600);
      return () => {
        if (timer) window.clearTimeout(timer);
      };
    }

    let pendingImages = images.filter((image) => !image.complete).length;

    const handleImageFinished = () => {
      pendingImages -= 1;

      if (pendingImages <= 0) {
        timer = window.setTimeout(printPage, 300);
      }
    };

    images.forEach((image) => {
      if (image.complete) return;
      image.addEventListener("load", handleImageFinished, { once: true });
      image.addEventListener("error", handleImageFinished, { once: true });
    });

    return () => {
      if (timer) window.clearTimeout(timer);
      images.forEach((image) => {
        image.removeEventListener("load", handleImageFinished);
        image.removeEventListener("error", handleImageFinished);
      });
    };
  }, [enabled]);

  return null;
}
