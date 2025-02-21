import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_4366_30255)" fill="#fff">
        <Path
          opacity={0.3}
          d="M15.857 1.09a2.089 2.089 0 012.005 2.169l-.082 2.086a.597.597 0 01-.62.573l-3.577-.14.106-2.683a2.088 2.088 0 012.168-2.005z"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.357 1.643a2.089 2.089 0 00-.669 1.451l-.456 11.627a2.983 2.983 0 01-3.099 2.864l-8.943-.351a.597.597 0 01.047-1.193l1.192.047a2.979 2.979 0 001.286-2.338l.433-11.03A2.088 2.088 0 016.318.715l9.54.374a2.089 2.089 0 00-1.5.554zM8.034 4.217a.746.746 0 00-.059 1.49l2.311.091a.746.746 0 10.059-1.49l-2.311-.091zm-1.68 3.517a.746.746 0 00-.06 1.49l3.852.152a.746.746 0 00.058-1.491l-3.85-.151zm-.676 3.775a.746.746 0 01.535-.198l3.85.151a.747.747 0 01-.058 1.491l-3.85-.151a.745.745 0 01-.477-1.293z"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_4366_30255">
          <Path fill="#fff" transform="rotate(2.249 -12.51 32.076)" d="M0 0H16.7083V16.7083H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
