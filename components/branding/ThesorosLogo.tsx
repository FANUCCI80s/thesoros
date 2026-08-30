import Image from "next/image";

interface ThesorosLogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function ThesorosLogo({
  className = "h-10 w-auto",
  width = 180,
  height = 52,
  priority = false,
}: ThesorosLogoProps) {
  return (
    <Image
      src="/branding/thesoros-logo.png"
      alt="TH�SOROS"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}

