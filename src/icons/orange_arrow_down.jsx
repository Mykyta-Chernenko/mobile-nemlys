import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={26}
      height={10}
      viewBox="0 0 26 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path d="M7.343 6.843L.5 0h25l-6.843 6.843a8 8 0 01-11.314 0z" fill="#FDC180" />
    </Svg>
  );
}

export default SvgComponent;
