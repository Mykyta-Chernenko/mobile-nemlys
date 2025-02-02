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
      <G clipPath="url(#clip0_3914_20260)">
        <Path
          d="M8 .29c-2.391 0-4.34.673-5.69 2.023C.96 3.663.284 5.613.284 8.003c0 2.391.674 4.34 2.024 5.69 1.351 1.35 3.3 2.025 5.69 2.025 2.391 0 4.34-.675 5.69-2.024 1.35-1.351 2.025-3.3 2.025-5.69 0-2.392-.675-4.34-2.024-5.69C12.339.963 10.39.288 8 .288z"
          fill="#DEC4FF"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.885 4.306c.293.02.544.217.632.497l1.385 4.375.951-1.73a.715.715 0 01.627-.37h1.468a.714.714 0 110 1.428h-1.046L9.35 11.328a.714.714 0 01-1.307-.126l-1.34-4.236-.537 1.131a.714.714 0 01-.645.41H4.052a.714.714 0 110-1.43H5.07l1.123-2.365a.714.714 0 01.693-.406z"
          fill="#8551C6"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20260">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
