import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={13}
      height={12}
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M4.702 3.396l-3.484.496-.062.012a.549.549 0 00-.388.383.526.526 0 00.148.52l2.524 2.41-.595 3.406-.007.06a.528.528 0 00.249.481.553.553 0 00.55.024L6.753 9.58l3.11 1.608.054.025a.556.556 0 00.545-.083.537.537 0 00.194-.507l-.596-3.405 2.525-2.412.043-.045a.53.53 0 00-.346-.868l-3.484-.497L7.24.3A.54.54 0 006.75 0a.554.554 0 00-.49.299L4.702 3.396z"
        fill="#1A052F"
      />
    </Svg>
  );
}

export default SvgComponent;
