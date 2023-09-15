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
        d="M10 6.167a2.5 2.5 0 015 0v4.167a2.5 2.5 0 01-5 0V6.167zM6.667 10.333a5.833 5.833 0 0011.667 0M9.166 19.5h6.667M12.5 16.167V19.5"
        stroke="#1A052F"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
