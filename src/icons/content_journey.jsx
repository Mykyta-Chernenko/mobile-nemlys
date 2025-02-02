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
      <G clipPath="url(#clip0_3339_9564)" fill="#fff">
        <Path
          opacity={0.5}
          d="M7.936 22.154L2.103 23.51A1.714 1.714 0 010 21.84V3.207c0-.797.55-1.489 1.326-1.67L7.936 0v22.154z"
        />
        <Path d="M7.936 22.154L16.064 24V1.846L7.936 0v22.154z" />
        <Path
          opacity={0.5}
          d="M24 20.794c0 .797-.55 1.49-1.326 1.67l-6.61 1.538V1.848L21.898.49A1.714 1.714 0 0124 2.16v18.633z"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3339_9564">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
