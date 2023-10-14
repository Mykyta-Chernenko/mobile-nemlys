import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={33}
      height={32}
      viewBox="0 0 33 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M18.047 2.231a1 1 0 00-1.578.426l-2.75 7.552-3.02-2.927a1 1 0 00-1.492.112C6.5 10.94 5.125 14.51 5.125 18a11 11 0 1022 0c0-7.431-6.349-13.5-9.078-15.769zm5.064 16.936a7.2 7.2 0 01-5.82 5.819 1 1 0 11-.331-1.973c2.071-.348 3.829-2.106 4.18-4.18a1 1 0 111.973.334h-.002z"
        fill="#A39BAC"
      />
    </Svg>
  );
}

export default SvgComponent;
