import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_3914_20306)">
        <Path d="M8 16A8 8 0 108-.001 8 8 0 008 16z" fill="#FDC180" />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.54.02c-.36.3-4.217 3.675-.544 7.977 3.702 4.338-.245 7.732-.553 7.985.102.007.204.011.305.016h.503A8 8 0 008.541.02z"
          fill="#A95B4B"
        />
        <Path d="M10.39 5.998a1.413 1.413 0 100-2.826 1.413 1.413 0 000 2.826z" fill="#FDC180" />
        <Path d="M6.011 12.829a1.413 1.413 0 100-2.825 1.413 1.413 0 000 2.825z" fill="#A95B4B" />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20306">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
