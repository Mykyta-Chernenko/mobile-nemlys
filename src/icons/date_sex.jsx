import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={41}
      height={40}
      viewBox="0 0 41 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_1515_52583)" fill="#FA41A5">
        <Path d="M19.363 2.84A7.947 7.947 0 1131.54 13.055l-8.179 9.746a7.947 7.947 0 11-12.176-10.216l8.178-9.747z" />
        <Path d="M10.092 22.802a7.947 7.947 0 1012.176-10.217L14.536 3.37A7.947 7.947 0 102.36 13.586l7.732 9.216z" />
      </G>
      <Defs>
        <ClipPath id="clip0_1515_52583">
          <Path fill="#fff" transform="translate(.5)" d="M0 0H40V40H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
