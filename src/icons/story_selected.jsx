import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect x={5} y={2.78906} width={22} height={25} rx={5} fill="#FDC180" />
      <Path
        d="M10 9.79h11.617M10 14.078h11.718M10 18.37h7.37"
        stroke="#1A052F"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
