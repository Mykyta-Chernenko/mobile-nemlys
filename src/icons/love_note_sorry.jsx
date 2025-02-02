import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.749 5.505l-2.127 4.641c-.986 2.153.587 4.604 2.955 4.604h.538c.522 0 .882.515.707 1.002l-2.056 5.71C7.891 20.101 1 16.154 1 9.625c0-5.517 5.88-9.4 9.749-4.12zm3.012-.573l-2.866 6.256a.75.75 0 00.682 1.062h.538c2.249 0 3.822 2.229 3.059 4.349l-1.713 4.756C16.453 19.907 23 16.025 23 9.783c0-5.28-5.386-9.064-9.24-4.85z"
        fill="#B680F1"
      />
    </Svg>
  );
}

export default SvgComponent;
