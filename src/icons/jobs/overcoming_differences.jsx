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
      <G clipPath="url(#clip0_3914_20284)" fillRule="evenodd" clipRule="evenodd">
        <Path d="M8 0a8 8 0 100 16A8 8 0 008 0z" fill="#FDC180" />
        <Path
          d="M11.131 5.591a.571.571 0 00-.722-.722L4.087 6.976a.571.571 0 00-.115 1.032l2.513 1.507 1.507 2.512a.572.572 0 001.032-.113L11.13 5.59z"
          fill="#A95B4B"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20284">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
