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
      <Path d="M9 7L14 12L9 17" stroke="#A39BAC" strokeWidth={1.5} strokeLinecap="square" />
    </Svg>
  );
}

export default SvgComponent;
