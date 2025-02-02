import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={33}
      height={33}
      viewBox="0 0 33 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_3339_2959)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.712 5.002a1.714 1.714 0 00-2.424 0L4.002 15.288a1.714 1.714 0 002.424 2.424l.503-.502v7.861c0 .947.767 1.715 1.714 1.715h13.714c.947 0 1.714-.768 1.714-1.715v-7.86l.502.501a1.714 1.714 0 102.425-2.424L16.712 5.002z"
          fill="#1A052F"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3339_2959">
          <Path fill="#fff" transform="translate(3.5 3.5)" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
