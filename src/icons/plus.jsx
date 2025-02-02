import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent({ stroke = '#1A052F', ...props }) {
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
        d="M7.999 3.012v9.97M3.014 8h9.97"
        stroke={stroke}
        strokeWidth={1.32937}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
