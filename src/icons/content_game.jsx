import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_3339_6370)" fillRule="evenodd" clipRule="evenodd" fill="#fff">
        <Path d="M17.503.572l-4.534 9.072a1.034 1.034 0 00.925 1.498h9.069c.771 0 1.27-.81.926-1.498L19.354.572a1.036 1.036 0 00-1.851 0zM0 1.713A.857.857 0 01.857.856H9.43a.857.857 0 01.857.857v8.572a.858.858 0 01-.857.857H.857A.857.857 0 010 10.285V1.713zM5.143 24a5.143 5.143 0 100-10.286 5.143 5.143 0 000 10.286z" />
        <Path
          opacity={0.5}
          d="M14.57 13.715a1.286 1.286 0 000 2.571h7.715a1.286 1.286 0 000-2.571h-7.714zm-1.285 5.143a1.286 1.286 0 011.286-1.286h7.714a1.285 1.285 0 110 2.571h-7.714a1.286 1.286 0 01-1.286-1.285zm0 3.857a1.286 1.286 0 011.286-1.286h7.714a1.286 1.286 0 010 2.572h-7.714a1.286 1.286 0 01-1.286-1.286z"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3339_6370">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
