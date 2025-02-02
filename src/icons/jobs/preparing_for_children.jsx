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
      <G clipPath="url(#clip0_3914_20346)" fillRule="evenodd" clipRule="evenodd">
        <Path d="M8 0a8 8 0 110 16A8 8 0 018 0z" fill="#FDC180" />
        <Path
          d="M5.24 4.489a1.171 1.171 0 100 2.342h.003a1.171 1.171 0 00-.004-2.342zM9.59 5.66a1.17 1.17 0 111.174 1.17h-.002a1.171 1.171 0 01-1.173-1.17h.001zM4.79 8.87a.714.714 0 00-1.38.37 4.758 4.758 0 009.187 0 .714.714 0 00-1.38-.37 3.329 3.329 0 01-6.427 0z"
          fill="#A95B4B"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20346">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
