import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.9}
        d="M12.05 32.201c3.159 5.614 11.241 5.614 14.4 0l8.376-14.891C37.923 11.803 33.944 5 27.626 5H10.874C4.556 5 .577 11.803 3.674 17.31L12.051 32.2z"
        fill="#F21890"
      />
      <Path
        d="M20.968 12.214c-.41.64-.604 1.113-.822 1.993-.23.927-.293 1.535-.265 2.543M14.548 12.214c-.409.64-.604 1.113-.822 1.993-.23.927-.293 1.535-.265 2.543M17.352 26.29s5.047 2.4 6.882-4.798"
        stroke="#221C3F"
        strokeWidth={3.02046}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
