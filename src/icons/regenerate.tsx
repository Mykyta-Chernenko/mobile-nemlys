import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={25}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        clipPath="url(#clip0_2494_5654)"
        stroke="#1A052F"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M20.382 11a8.1 8.1 0 00-15.5-2m-.5-4v4h4M4.382 13a8.1 8.1 0 0015.5 2m.5 4v-4h-4" />
      </G>
      <Defs>
        <ClipPath id="clip0_2494_5654">
          <Path fill="#fff" transform="translate(.382)" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
