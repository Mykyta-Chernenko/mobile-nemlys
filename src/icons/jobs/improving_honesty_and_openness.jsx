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
      <G clipPath="url(#clip0_3914_20312)" fillRule="evenodd" clipRule="evenodd">
        <Path
          d="M11.444.853A7.931 7.931 0 001.237 12.14L.104 15.157a.571.571 0 00.637.764l3.952-.716A7.932 7.932 0 0011.445.853z"
          fill="#DEC4FF"
        />
        <Path
          d="M6.215 5.679a.857.857 0 11-1.714 0 .857.857 0 011.714 0zM4.038 8.455a.714.714 0 01.88.497c.46 1.658 2.328 2.703 4.007 2.252 1.054-.392 1.886-1.25 2.158-2.249a.714.714 0 011.378.375c-.412 1.509-1.625 2.7-3.074 3.226a.742.742 0 01-.053.018c-2.427.674-5.114-.794-5.794-3.24a.714.714 0 01.498-.88zm6.606-1.92a.857.857 0 100-1.715.857.857 0 000 1.715z"
          fill="#6830AF"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20312">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
