import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

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
      <Rect
        x={-2.25}
        y={20}
        width={31.1127}
        height={31.1127}
        rx={10}
        transform="rotate(-45 -2.25 20)"
        fill="#9DAAEE"
      />
      <Path
        d="M14.142 15.689s2.503-3.218 5.466-3.127c2.962.092 5.317 1.64 5.261 3.458-.056 1.819-4.445 1.438-5.465 3.127-.76 1.259-.107 3.47-.107 3.47M20.625 28.668s-.484.388-.27.478l.547.23"
        stroke="#221C3F"
        strokeWidth={3.02046}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
