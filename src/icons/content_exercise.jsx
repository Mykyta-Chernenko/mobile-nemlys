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
        d="M12.546 5.246a.822.822 0 00-1.007-.581L1.109 7.458a.822.822 0 00-.58 1.007L4.53 23.392a.822.822 0 001.007.582l10.429-2.793a.822.822 0 00.581-1.008L12.545 5.246z"
        fill="#fff"
      />
      <Path
        opacity={0.5}
        d="M12.454 1.153A.822.822 0 0113.46.57L23.89 3.364c.438.118.699.569.581 1.007L20.47 19.298a.822.822 0 01-1.007.582L9.034 17.087a.822.822 0 01-.582-1.007l4.002-14.927z"
        fill="#fff"
      />
    </Svg>
  );
}

export default SvgComponent;
