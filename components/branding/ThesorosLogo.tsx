import Image from "next/image";

interface ThesorosLogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function ThesorosLogo({
  className = "",
  width = 180,
  height = 52,
  priority = false,
}: ThesorosLogoProps) {
  return (
    <Image
      src="/branding/thesoros-logo.png"
      alt="THÉSOROS"
      width={width}
      height={height}
      priority={priority}
      className={`block h-auto w-auto max-w-full object-contain ${className}`}
    />
  );
}