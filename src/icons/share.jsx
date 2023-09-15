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
      <G clipPath="url(#clip0_1542_1744)">
        <Path
          d="M13 13.625h-1.8c-3.112 0-5.814 1.706-7.17 4.21-.02-.235-.03-.471-.03-.71 0-4.832 4.03-8.75 9-8.75V4l9 7-9 7v-4.375z"
          fill="#E3D3D6"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1542_1744">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
