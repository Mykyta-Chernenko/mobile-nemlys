import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M8.478 7.89c2.853-5.225 10.293-5.4 13.388-.314l6.369 10.464c3.103 5.1-.497 11.642-6.465 11.749l-12.204.22c-5.931.106-9.768-6.23-6.924-11.436L8.478 7.889z"
        fill="#FF76C0"
      />
      <Path
        d="M17.055 11.18c-.343.537-.507.934-.69 1.673-.192.777-.245 1.288-.222 2.134M11.667 11.18c-.344.537-.508.934-.69 1.673-.193.777-.246 1.288-.223 2.134M14.021 22.994s4.237 2.014 5.777-4.027"
        stroke="#1A052F"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
