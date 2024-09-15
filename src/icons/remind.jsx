import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={25}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M10.768 5.939a1.732 1.732 0 013.464 0 6.061 6.061 0 013.463 5.195v2.598a3.463 3.463 0 001.732 2.597H5.573a3.462 3.462 0 001.732-2.598v-2.597a6.061 6.061 0 013.463-5.195zM9.902 16.33v.866a2.597 2.597 0 105.196 0v-.866"
        stroke="#1A052F"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
