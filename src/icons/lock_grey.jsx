import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={25}
      height={25}
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        clipPath="url(#clip0_1276_3179)"
        stroke="#87778D"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M6.5 13.248a1.5 1.5 0 011.5-1.5h9a1.5 1.5 0 011.5 1.5v4.5a1.5 1.5 0 01-1.5 1.5H8a1.5 1.5 0 01-1.5-1.5v-4.5zM9.5 11.748v-3a3 3 0 116 0v3" />
      </G>
      <Defs>
        <ClipPath id="clip0_1276_3179">
          <Path fill="#fff" transform="translate(.5 .998)" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
