import Image from "next/image";
import { useState } from "react";

interface ChainImageProps {
  chainName: string;
}

export const ChainImage = ({ chainName }: ChainImageProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Image
      src="/logos/logoWithoutTxt.png"
      alt={chainName}
      width={64}
      height={64}
      className="rounded-full"
      onError={() => setImageError(true)}
      priority
    />
  );
}; 