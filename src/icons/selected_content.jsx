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
      <G clipPath="url(#clip0_3792_35322)">
        <Path
          d="M10.184 9.69l-3.088.439-.055.01a.486.486 0 00-.344.34.467.467 0 00.131.46l2.238 2.137-.528 3.018-.006.053a.467.467 0 00.22.427.49.49 0 00.488.021l2.762-1.425 2.756 1.425.048.022a.493.493 0 00.483-.074.475.475 0 00.171-.448l-.528-3.019 2.239-2.137.037-.04a.472.472 0 00-.306-.77l-3.088-.44-1.38-2.744a.477.477 0 00-.435-.265.491.491 0 00-.434.265l-1.38 2.745z"
          fill="#fff"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3792_35322">
          <Path fill="#fff" transform="translate(4.023 4.023)" d="M0 0H15.9524V15.9524H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
