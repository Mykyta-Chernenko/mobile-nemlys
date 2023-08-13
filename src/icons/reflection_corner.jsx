import * as React from 'react';
import Svg, { G, Rect, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={101}
      height={92}
      viewBox="0 0 101 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_1382_3931)">
        <Rect
          x={39.5034}
          y={14.3584}
          width={75.0712}
          height={84.2263}
          rx={21.4027}
          transform="rotate(8.89 39.503 14.358)"
          fill="#B680F1"
        />
        <Rect
          x={22}
          y={28.1719}
          width={71.2525}
          height={79.9418}
          rx={20.314}
          transform="rotate(-15.148 22 28.172)"
          fill="#FDC180"
        />
        <Path
          d="M41.102 42.02l32.514-8.802M43.827 52.085l32.823-8.886M46.552 62.15l19.508-5.28"
          stroke="#1A052F"
          strokeWidth={2.91003}
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1382_3931">
          <Path d="M0 0h101v76c0 8.837-7.163 16-16 16H0V0z" fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
