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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.632.195a.585.585 0 00-.784.55l.001.47c.002.799.004 1.478-.054 2.087-.069.715-.216 1.276-.51 1.75-.232.378-.715.397-.97.074a5.83 5.83 0 01-.735-1.24.585.585 0 00-.83-.281 6.549 6.549 0 109.8 5.686v-.638c0-2.046-.516-3.824-1.531-5.267C12.003 1.943 10.514.873 8.632.195z"
        fill="#FA41A5"
      />
    </Svg>
  );
}

export default SvgComponent;
