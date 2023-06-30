import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.166 13.667H.833v-3.333l6.47-6.47 3 3a.747.747 0 00.451.215l-6.588 6.588zm7.413-7.412l1.337-1.338a2.357 2.357 0 10-3.333-3.333l-1.22 1.22 3 2.999a.747.747 0 01.216.452z"
        fill="#E3D3D6"
      />
    </Svg>
  );
}

export default SvgComponent;
