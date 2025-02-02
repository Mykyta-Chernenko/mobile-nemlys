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
      <G clipPath="url(#clip0_3914_20288)">
        <Path
          d="M4.883 0a.571.571 0 00-.526.348l-2.572 6.07-.002.005A1.143 1.143 0 002.834 8h2.434l-2.077 7.271a.571.571 0 00.942.572L13.95 6.54l.004-.003a1.143 1.143 0 00-.777-1.966H9.808L11.68.827A.571.571 0 0011.169 0H4.883z"
          fill="#8FBFFA"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20288">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
