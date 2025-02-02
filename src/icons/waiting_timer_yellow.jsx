import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

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
      <G clipPath="url(#clip0_3568_26039)">
        <Path
          d="M1.715 13.715a10.286 10.286 0 1020.572 0 10.286 10.286 0 00-20.572 0z"
          fill="#FDC180"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.707.681a1.286 1.286 0 01-.532 1.74A13.611 13.611 0 002.26 5.553 1.286 1.286 0 01.313 3.877 16.183 16.183 0 014.967.15a1.286 1.286 0 011.74.53zm10.587 0a1.287 1.287 0 011.74-.53 16.181 16.181 0 014.655 3.726 1.285 1.285 0 01-1.948 1.676 13.611 13.611 0 00-3.917-3.132 1.286 1.286 0 01-.53-1.74zm-4.222 7.891a1.071 1.071 0 10-2.143 0v5.143c0 .591.48 1.071 1.072 1.071h4.285a1.071 1.071 0 100-2.143h-3.214V8.572z"
          fill="#A95B4B"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3568_26039">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
