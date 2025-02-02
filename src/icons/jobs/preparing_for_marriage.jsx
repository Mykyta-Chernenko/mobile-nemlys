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
      <G clipPath="url(#clip0_3914_20350)">
        <Path
          d="M2.285 14.86V8.003L8 2.29l5.715 5.714v6.857a1.143 1.143 0 01-1.143 1.143H3.428a1.143 1.143 0 01-1.143-1.143z"
          fill="#ABCED9"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.192 1.48a1.143 1.143 0 011.616 0l6.857 6.856a1.143 1.143 0 01-1.616 1.616l-6.05-6.049-6.049 6.05A1.143 1.143 0 01.334 8.335L7.192 1.48z"
          fill="#579CB3"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20350">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
