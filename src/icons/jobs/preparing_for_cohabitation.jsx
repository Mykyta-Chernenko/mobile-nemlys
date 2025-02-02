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
      <G clipPath="url(#clip0_3914_20299)" fillRule="evenodd" clipRule="evenodd">
        <Path
          d="M.335.335a1.143 1.143 0 011.616 0L13.547 11.93l1.477-1.478a.571.571 0 01.976.405v4.571a.571.571 0 01-.572.572h-4.571a.571.571 0 01-.405-.976l1.478-1.477L.335 1.951a1.143 1.143 0 010-1.616z"
          fill="#2859C5"
        />
        <Path
          d="M15.429 0h-4.572a.571.571 0 00-.404.976l1.478 1.477L.335 14.049a1.144 1.144 0 001.245 1.872c.14-.06.266-.147.371-.256L13.548 4.07l1.476 1.477A.571.571 0 0016 5.143V.57A.571.571 0 0015.43 0z"
          fill="#8FBFFA"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20299">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
