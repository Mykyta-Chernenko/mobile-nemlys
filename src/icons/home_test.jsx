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
      <G clipPath="url(#clip0_3429_12231)" fillRule="evenodd" clipRule="evenodd" fill="#9D69DF">
        <Path
          opacity={0.3}
          d="M1.714 0h8a1.714 1.714 0 011.715 1.714v2.857h2.857A1.714 1.714 0 0116 6.286v8A1.714 1.714 0 0114.286 16h-8a1.713 1.713 0 01-1.715-1.714v-2.857H1.714A1.714 1.714 0 010 9.714v-8A1.714 1.714 0 011.714 0z"
        />
        <Path d="M11.428 4.57H6.286A1.714 1.714 0 004.57 6.285v5.143h5.143a1.715 1.715 0 001.714-1.715V4.57z" />
      </G>
      <Defs>
        <ClipPath id="clip0_3429_12231">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
