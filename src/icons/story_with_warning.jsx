import * as React from 'react';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={34}
      height={34}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect x={5} y={5} width={23} height={25} rx={5} fill="#A39BAC" />
      <Path
        d="M10 11h12M10 15.29h12M10 19.58h8"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={26} cy={8} r={7} fill="#FDC180" stroke="#fff" strokeWidth={2} />
    </Svg>
  );
}

export default SvgComponent;
