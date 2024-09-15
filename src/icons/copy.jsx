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
        clipPath="url(#clip0_2477_6709)"
        stroke="#1A052F"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M7.877 9.667A2.667 2.667 0 0110.544 7h8.666a2.667 2.667 0 012.667 2.667v8.666A2.666 2.666 0 0119.21 21h-8.666a2.667 2.667 0 01-2.667-2.667V9.667z" />
        <Path d="M4.889 16.737A2.005 2.005 0 013.877 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1" />
      </G>
      <Defs>
        <ClipPath id="clip0_2477_6709">
          <Path fill="#fff" transform="translate(.877)" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
