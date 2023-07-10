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
        x={27.267}
        y={2.8877}
        width={15.8947}
        height={28.6178}
        rx={7.94734}
        transform="rotate(40 27.267 2.888)"
        fill="#FA41A5"
      />
      <Rect
        width={15.8947}
        height={27.9243}
        rx={7.94734}
        transform="scale(1 -1) rotate(40 57.113 7.208)"
        fill="#FA41A5"
      />
    </Svg>
  );
}

export default SvgComponent;
