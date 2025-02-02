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
        d="M8 4.012L10.659 8l3.323-2.659-1.33 6.647H3.348L2.017 5.34 5.342 8 8 4.012z"
        fill="#000"
      />
    </Svg>
  );
}

export default SvgComponent;
