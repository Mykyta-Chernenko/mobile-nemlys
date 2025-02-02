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
      <G clipPath="url(#clip0_4103_22248)" fillRule="evenodd" clipRule="evenodd">
        <Path d="M12 0a12 12 0 110 24 12 12 0 010-24z" fill="#FDC180" />
        <Path
          d="M3.244 7.663c.024-1.6 1.819-3.082 3.52-.994 1.702-2.088 3.497-.605 3.52.994 0 2.378-2.845 4.332-3.52 4.332-.672 0-3.52-1.954-3.52-4.332zm13.989-.994c1.702-2.088 3.497-.605 3.52.994 0 2.378-2.845 4.332-3.519 4.332-.673 0-3.52-1.954-3.52-4.332.023-1.6 1.818-3.082 3.519-.994zm.38 7.72a1.071 1.071 0 00-1.313.755 4.457 4.457 0 01-8.6 0 1.072 1.072 0 00-2.07.557 6.6 6.6 0 0012.74 0 1.071 1.071 0 00-.757-1.313z"
          fill="#813A2B"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_4103_22248">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
