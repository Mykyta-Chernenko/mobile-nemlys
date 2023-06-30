import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#1A052F"
      {...props}
    >
      <Path
        d="M6 21L21 6l-3-3L3 18l3 3zM15 6l3 3"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 3a2 2 0 002 2 2 2 0 00-2 2 2 2 0 00-2-2 2 2 0 002-2zM19 13a2 2 0 002 2 2 2 0 00-2 2 2 2 0 00-2-2 2 2 0 002-2z"
        // fill={props.stroke || '#1A052F'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
