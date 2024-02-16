import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={13}
      height={14}
      viewBox="0 0 13 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M11.803 1.697L1.197 12.303M11.803 1.697H4.732m7.071 0v7.07"
        stroke="#1A052F"
        strokeWidth={1.5}
        strokeLinecap="square"
      />
    </Svg>
  );
}

export default SvgComponent;
