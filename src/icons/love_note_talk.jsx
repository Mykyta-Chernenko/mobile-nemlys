import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

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
      <G clipPath="url(#clip0_4103_22243)" fillRule="evenodd" clipRule="evenodd">
        <Path
          d="M17.177 1.262A11.92 11.92 0 001.835 18.228L.132 22.762a.857.857 0 00.954 1.143l5.943-1.07A11.92 11.92 0 0017.177 1.261z"
          fill="#FDC180"
        />
        <Path
          d="M6.859 13.714a1.714 1.714 0 100-3.429 1.714 1.714 0 000 3.429zm6.857-1.715a1.715 1.715 0 11-3.43 0 1.715 1.715 0 013.43 0zm5.143 0a1.714 1.714 0 11-3.429 0 1.714 1.714 0 013.429 0z"
          fill="#813A2B"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_4103_22243">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
