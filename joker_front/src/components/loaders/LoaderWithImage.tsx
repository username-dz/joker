import { useState } from "react";
interface LoaderWithImageProps {
  imageSrc: string | undefined;
  imageAlt: string;
  imageClassName?: string;
  isLoading?: boolean;
  width?: number;
  height?: number;
  spinnerStroke?: string;
  loaderClassName?: string;
}

const LoaderWithImage = ({
  imageSrc,
  imageAlt,
  imageClassName,
  width = 50,
  height = 50,
  loaderClassName = "w-full h-full",
}: LoaderWithImageProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const imageLoadHandler = () => {
    setIsImageLoading(false);
  };

  return (
    <>
      {isImageLoading && (
        <div className={"flex h-full w-full items-center justify-center"}>
          <svg
            viewBox="0 0 38 38"
            xmlns="http://www.w3.org/2000/svg"
            stroke={"#ff0000"}
            width={width}
            height={height}
            className={loaderClassName + " animate-spin bg-transparent"}
          >
            <g fill="none" fillRule="evenodd">
              <g transform="translate(1 1)" strokeWidth="2">
                <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
                <path d="M36 18c0-9.94-8.06-18-18-18">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 18 18"
                    to="360 18 18"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            </g>
          </svg>
        </div>
      )}
      <img
        src={imageSrc}
        alt={imageAlt}
        onLoad={imageLoadHandler}
        className={imageClassName}
        style={{ display: isImageLoading ? "none" : "block" }}
      />
    </>
  );
};

export default LoaderWithImage;
