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
      <G clipPath="url(#clip0_3914_20243)" fillRule="evenodd" clipRule="evenodd">
        <Path d="M8 0a8 8 0 100 16A8 8 0 008 0z" fill="#8FBFFA" />
        <Path
          d="M.96 4.336h14.08c.588 0 1.065.48.94 1.056-.33 1.506-1.376 3.54-3.928 3.54-3.21 0-4.036-3.218-4.052-4.556-.016 1.338-.843 4.557-4.053 4.557C1.394 8.933.35 6.898.02 5.393c-.125-.575.351-1.056.94-1.056v-.001zm9.775 7.167a.572.572 0 00-.868-.744 1.975 1.975 0 01-.788.55 1.598 1.598 0 01-.298.048.573.573 0 00.08 1.14c.2-.014.396-.05.587-.107a3.12 3.12 0 001.287-.887z"
          fill="#2859C5"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20243">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
