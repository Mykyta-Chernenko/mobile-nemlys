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
      <G clipPath="url(#clip0_3094_15844)" fillRule="evenodd" clipRule="evenodd">
        <Path
          d="M12.428.43c-2.292 0-4.777.202-7.027.457a4.166 4.166 0 00-3.668 3.69c-.245 2.233-.448 4.716-.448 6.995 0 1.84.132 3.811.31 5.678L.448 22.534a.857.857 0 001.037 1.015l4.937-1.175c1.965.197 4.056.341 6.007.341 2.292 0 4.778-.198 7.029-.45a4.16 4.16 0 003.668-3.69c.245-2.237.446-4.723.446-7.002 0-2.28-.2-4.761-.446-6.995A4.164 4.164 0 0019.457.886C17.209.632 14.722.43 12.428.43z"
          fill="#8FBFFA"
        />
        <Path
          d="M8.251 8.36a1.071 1.071 0 100 2.142h8.357a1.071 1.071 0 100-2.143h-8.36.003zm0 5.142a1.072 1.072 0 000 2.143h6.32a1.072 1.072 0 000-2.143H8.25h.002z"
          fill="#2859C5"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3094_15844">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
