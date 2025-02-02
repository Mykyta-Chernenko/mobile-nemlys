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
      {...props}
    >
      <Path
        d="M11.778 6.728c3.937-8.732 11.778-4.35 11.778 2.191 0 8.598-11.778 12.982-11.778 12.982S0 17.517 0 8.751C0 2.209 7.84-2.172 11.778 6.728z"
        fill="#B680F1"
      />
    </Svg>
  );
}

export default SvgComponent;
