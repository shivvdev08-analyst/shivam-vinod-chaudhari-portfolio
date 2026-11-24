"use client";
import Image from "next/image";
import { useState } from "react";

/**
 * Shivam's real photo (public/photo.jpg). If the binary photo has not been
 * uploaded to the repo yet (the GitHub connector can only push UTF-8 text),
 * show a monogram instead of a broken image — see README.md.
 */
export default function Photo() {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <div className="flex h-64 w-64 items-center justify-center rounded-full text-6xl font-extrabold sm:h-80 sm:w-80"
        style={{ background: "var(--surface2)", color: "var(--accent)" }} aria-label="Shivam Vinod Chaudhari">
        SVC
      </div>
    );
  }
  return (
    <Image src="/photo.jpg" alt="Portrait of Shivam Vinod Chaudhari" width={320} height={320}
      className="h-64 w-64 rounded-full object-cover sm:h-80 sm:w-80" priority
      onError={() => setMissing(true)} />
  );
}
