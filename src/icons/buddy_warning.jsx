import * as React from 'react';
import Svg, { G, Path, Circle, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={45}
      height={32}
      viewBox="0 0 45 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_2441_15579)">
        <Path
          d="M22.502 7.247c-3.016-5.521-10.878-5.705-14.149-.331l-6.73 11.058c-3.279 5.389.526 12.302 6.832 12.416l12.897.232c6.267.113 10.322-6.584 7.317-12.085l-6.167-11.29z"
          fill="#E3D3D6"
        />
        <Path
          d="M13.437 10.725c.363.568.536.987.73 1.768.203.822.259 1.361.235 2.255M19.131 10.725c.363.568.536.987.73 1.768.203.822.26 1.361.235 2.255M16.645 23.211s-4.478 2.128-6.106-4.256"
          stroke="#1A052F"
          strokeWidth={2.11353}
          strokeLinecap="round"
        />
        <G clipPath="url(#clip1_2441_15579)">
          <Circle cx={33} cy={10} r={10} fill="#FA41A5" />
          <Path
            d="M33 6v4M33 14h.01"
            stroke="#1A052F"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_2441_15579">
          <Path fill="#fff" d="M0 0H45V32H0z" />
        </ClipPath>
        <ClipPath id="clip1_2441_15579">
          <Path fill="#fff" transform="translate(23)" d="M0 0H20V20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
