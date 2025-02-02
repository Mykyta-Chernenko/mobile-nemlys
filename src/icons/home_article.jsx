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
      <G clipPath="url(#clip0_3429_3216)">
        <Path
          d="M12 2.004a2 2 0 012-2H4.856a2 2 0 00-2 2v10.57c0 .936-.45 1.765-1.143 2.286H.571a.571.571 0 100 1.143h8.571A2.857 2.857 0 0012 13.146V2.004z"
          fill="#5E57B3"
        />
        <Path
          opacity={0.3}
          d="M14 .004a2 2 0 012 2v2a.572.572 0 01-.572.571H12V2.004a2 2 0 012-2z"
          fill="#9883B7"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.917 4.003c0-.394.32-.714.714-.714h2.215a.714.714 0 010 1.429H6.63a.714.714 0 01-.714-.715zM4.44 7.432c0-.395.32-.715.715-.715h3.69a.714.714 0 010 1.429H5.155a.714.714 0 01-.714-.714zm.715 2.714a.714.714 0 000 1.428h3.69a.714.714 0 100-1.428H5.155z"
          fill="#fff"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3429_3216">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
