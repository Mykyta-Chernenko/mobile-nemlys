import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

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
      <Path
        d="M5.34 5.338c0-.53.246-1.036.682-1.41a2.537 2.537 0 011.645-.584h.665c.617 0 1.209.21 1.645.584.436.374.681.88.681 1.41a1.994 1.994 0 01-1.33 1.994c-.407.191-.757.554-.997 1.033A3.35 3.35 0 008 9.991M7.999 12.652v.008"
        stroke="#000"
        strokeWidth={1.32937}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
