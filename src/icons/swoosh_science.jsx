import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect width={24} height={24} rx={12} fill="#F5E9EB" />
      <Path
        d="M9.34 11.999L12 14.657l5.317-5.317"
        stroke="#1A052F"
        strokeWidth={1.32937}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M6.682 11.999l2.658 2.658zm5.317 0l2.659-2.66z" fill="#1A052F" />
      <Path
        d="M6.682 11.999l2.658 2.658M12 12l2.658-2.66"
        stroke="#1A052F"
        strokeWidth={1.32937}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
