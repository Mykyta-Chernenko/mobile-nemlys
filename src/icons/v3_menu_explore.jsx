import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={33}
      height={33}
      viewBox="0 0 33 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_3355_2965)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.082 9.584a8.572 8.572 0 1112.122 12.122A8.572 8.572 0 0110.082 9.584zm-3.865 1a11.143 11.143 0 0016.5 14.059L26.074 28a1.714 1.714 0 102.424-2.424l-3.357-3.357A11.142 11.142 0 106.217 10.583zm9.786 2.075c-.699-.735-1.428-1.098-2.129-1.152-.79-.06-1.49.277-1.996.811-.996 1.052-1.306 2.958-.068 4.275a.52.52 0 00.013.013l3.94 3.796a.341.341 0 00.48 0l3.94-3.796a.39.39 0 00.013-.013c1.232-1.31.92-3.216-.073-4.268-.505-.536-1.203-.875-1.993-.816-.7.053-1.429.415-2.127 1.15z"
          fill="#A39BAC"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3355_2965">
          <Path fill="#fff" transform="translate(5 4.5)" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
