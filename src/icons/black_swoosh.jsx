import * as React from 'react';
import Svg, { Rect, G, Path, Defs, ClipPath } from 'react-native-svg';

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
      <Rect width={24} height={24} rx={12} fill="#1A052F" />
      <G clipPath="url(#clip0_3558_12352)">
        <Path
          d="M7.348 12l3.323 3.323 6.647-6.647"
          stroke="#FBEFF1"
          strokeWidth={1.32937}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3558_12352">
          <Path fill="#fff" transform="translate(4.023 4.023)" d="M0 0H15.9524V15.9524H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
