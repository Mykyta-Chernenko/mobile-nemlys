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
      <G clipPath="url(#clip0_3792_19144)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.806 0h10.64c.98 0 1.775.794 1.775 1.774v6.015a3.03 3.03 0 00-1.903.362c-.169.093-.33.2-.48.321a3.466 3.466 0 00-.495-.345 3.017 3.017 0 00-2.466-.262c-1.227.4-2.103 1.498-2.387 2.777H1.805A1.774 1.774 0 01.033 8.866V1.774A1.771 1.771 0 011.806 0z"
          fill="#FA40A5"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.22 1.864L7.127 5.41.032 1.863v1.598l6.775 3.386a.714.714 0 00.639 0L14.22 3.46V1.863v.001z"
          fill="#8A226A"
        />
        <Path
          d="M11.822 10.849c1.337-2.966 4-1.478 4 .744 0 2.92-4 4.409-4 4.409s-4-1.49-4-4.467c0-2.221 2.663-3.71 4-.686z"
          fill="#FA40A5"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3792_19144">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
