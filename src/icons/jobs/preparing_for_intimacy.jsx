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
        d="M4.33 1.502c1.128.023 2.382.56 3.672 1.783 1.288-1.22 2.541-1.756 3.669-1.777 1.189-.023 2.192.525 2.898 1.348 1.392 1.623 1.68 4.4-.066 6.145l-.001.002-4.854 4.809a2.314 2.314 0 01-3.291 0l-4.853-4.81C-.248 7.25.037 4.473 1.43 2.848c.705-.823 1.708-1.371 2.9-1.346v.001z"
        fill="#FA40A5"
      />
    </Svg>
  );
}

export default SvgComponent;
