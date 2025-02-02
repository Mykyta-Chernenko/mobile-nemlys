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
      <G clipPath="url(#clip0_3922_10626)" fill="#5EB8D6">
        <Path d="M6.304 0a6.303 6.303 0 00-5.25 9.789L.21 12.042a.343.343 0 00.383.457l2.951-.531a6.303 6.303 0 008.904-7.058A6.302 6.302 0 006.304 0z" />
        <Path
          opacity={0.4}
          d="M10.858 5.715A5.143 5.143 0 0115.14 13.7l.65 1.735a.343.343 0 01-.382.457l-2.3-.412a5.143 5.143 0 11-2.251-9.766z"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3922_10626">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
