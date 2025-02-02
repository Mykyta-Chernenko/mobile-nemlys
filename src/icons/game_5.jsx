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
        opacity={0.9}
        d="M9.24 9.438c2.527-4.491 8.993-4.491 11.52 0l6.7 11.914c2.479 4.404-.705 9.847-5.759 9.847H8.3c-5.054 0-8.237-5.443-5.76-9.847L9.241 9.438z"
        fill="#A1E78B"
      />
      <Path
        d="M14.28 25.44s4.037 1.92 5.506-3.838M17.176 14.034c-.327.513-.483.89-.658 1.595-.183.741-.234 1.228-.212 2.034M12.04 14.034c-.328.513-.484.89-.658 1.595-.184.741-.234 1.228-.213 2.034"
        stroke="#1A052F"
        strokeWidth={2.41636}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
