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
      <G clipPath="url(#clip0_3339_9547)" fillRule="evenodd" clipRule="evenodd" fill="#fff">
        <Path
          opacity={0.5}
          d="M2.571 0h12a2.571 2.571 0 012.572 2.571v4.286h4.286A2.571 2.571 0 0124 9.43v12A2.57 2.57 0 0121.429 24h-12a2.572 2.572 0 01-2.572-2.571v-4.286H2.571A2.572 2.572 0 010 14.57v-12A2.571 2.571 0 012.571 0z"
        />
        <Path d="M17.143 6.855H9.43a2.571 2.571 0 00-2.572 2.572v7.714h7.715a2.57 2.57 0 002.571-2.571V6.855z" />
      </G>
      <Defs>
        <ClipPath id="clip0_3339_9547">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
