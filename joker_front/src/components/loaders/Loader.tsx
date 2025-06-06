const Loader = ({
  isLoading = true,
  width = 50,
  height = 50,
  color = "#fff",
  backgroundColor = "#DB3F40",
  className = "",
}) => {
  // Only render the loader if isLoading is true
  if (!isLoading) {
    return null;
  }

  return (
    <div
      className={className}
      style={{ backgroundColor }}
    >
      <svg
        viewBox="0 0 38 38"
        xmlns="http://www.w3.org/2000/svg"
        stroke={color}
        width={width}
        height={height}
        className="animate-spin"
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
  );
};

export default Loader;
