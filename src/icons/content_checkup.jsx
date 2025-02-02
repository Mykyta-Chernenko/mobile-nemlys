import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

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
      <G clipPath="url(#clip0_3339_11224)" fillRule="evenodd" clipRule="evenodd" fill="#fff">
        <Path
          opacity={0.5}
          d="M4.352.098a.429.429 0 00-.302.125l-3.4 3.4a.429.429 0 000 .604l3.4 3.402c.08.08.188.126.302.126h7.22v3.388h-7.22a.428.428 0 00-.302.127l-3.4 3.4a.428.428 0 000 .606l3.4 3.4c.08.08.188.124.302.125H12a.429.429 0 00.428-.43v-4.988h7.22a.429.429 0 00.304-.126l3.396-3.4a.429.429 0 000-.605l-3.394-3.4a.43.43 0 00-.303-.125h-7.223v-5.2a.429.429 0 00-.428-.43H4.35z"
        />
        <Path d="M12 .078a1.286 1.286 0 011.286 1.286v21.274a1.286 1.286 0 01-2.571 0V1.364A1.286 1.286 0 0112 .078z" />
      </G>
      <Defs>
        <ClipPath id="clip0_3339_11224">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
