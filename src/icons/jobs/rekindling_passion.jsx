import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

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
      <G clipPath="url(#clip0_3914_20335)" fillRule="evenodd" clipRule="evenodd">
        <Path d="M8 0a8 8 0 110 16A8 8 0 018 0z" fill="#FFBFE1" />
        <Path
          d="M2.163 5.11c.016-1.066 1.213-2.055 2.346-.663 1.135-1.392 2.332-.403 2.348.663 0 1.585-1.897 2.888-2.348 2.888-.448 0-2.346-1.303-2.346-2.888zm9.326-.663c1.135-1.392 2.331-.403 2.347.663 0 1.585-1.897 2.888-2.346 2.888-.45 0-2.347-1.303-2.347-2.888.016-1.066 1.212-2.055 2.346-.663zm.253 5.147a.714.714 0 00-.875.504 2.971 2.971 0 01-5.734 0 .714.714 0 00-1.38.37 4.4 4.4 0 008.493 0 .714.714 0 00-.504-.874z"
          fill="#CC1479"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20335">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
