import * as React from 'react';
import Svg, { Rect } from 'react-native-svg';

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
        x={35.7316}
        y={27.4834}
        width={12.7184}
        height={33.7118}
        rx={6.35922}
        transform="rotate(137.045 35.732 27.483)"
        fill="#B680F1"
      />
      <Rect
        x={11.5882}
        y={35.6201}
        width={12.7184}
        height={33.7118}
        rx={6.35922}
        transform="rotate(-132.955 11.588 35.62)"
        fill="#B680F1"
      />
    </Svg>
  );
}

export default SvgComponent;
