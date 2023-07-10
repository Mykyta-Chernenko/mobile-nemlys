import * as React from 'react';
import Svg, { G, Rect, Defs, ClipPath, Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_1019_23878)" fill="#B4E88C">
        <Rect
          x={20.3973}
          y={-2.19141}
          width={12.7184}
          height={27.1327}
          rx={6.35922}
          transform="rotate(40 20.397 -2.191)"
        />
        <Rect
          x={29.3003}
          y={13.2285}
          width={12.7184}
          height={27.1327}
          rx={6.35922}
          transform="rotate(40 29.3 13.229)"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1019_23878">
          <Path fill="#fff" d="M0 0H40V40H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
