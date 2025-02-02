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
      <G clipPath="url(#clip0_3914_20273)" fillRule="evenodd" clipRule="evenodd">
        <Path
          d="M6.702.643a.857.857 0 00-1.273.75v5.714a.857.857 0 001.273.748l5.143-2.857a.857.857 0 000-1.498L6.702.643z"
          fill="#DEC4FF"
        />
        <Path
          d="M7.143 1.392a.857.857 0 10-1.714 0v9.715a.857.857 0 001.714 0V1.392zm6.72 9.035a.857.857 0 00-1.463.605v.932H7.616a.857.857 0 100 1.714H12.4v.93a.857.857 0 001.463.606l1.783-1.783a.852.852 0 00.005-1.216l-1.788-1.79v.002zM.1 12.82a.857.857 0 01.857-.857h4a.857.857 0 110 1.714h-4a.857.857 0 01-.857-.857z"
          fill="#9D69DF"
        />
        <Path d="M6.286 10.535a2.287 2.287 0 100 4.574 2.287 2.287 0 000-4.574z" fill="#DEC4FF" />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20273">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
