import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

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
      <G clipPath="url(#clip0_3339_2985)" fillRule="evenodd" clipRule="evenodd" fill="#A39BAC">
        <Path d="M24.23 10.5a2.573 2.573 0 00-1.834.769L11.703 21.893a.857.857 0 00-.25.534l-.446 5.143a.858.858 0 00.928.928l5.143-.446a.857.857 0 00.534-.25L28.236 17.11l.003-.002a2.572 2.572 0 000-3.647l-2.17-2.187-.003-.003a2.571 2.571 0 00-1.836-.771zM12.682 5.61c-.339-1.487-2.459-1.477-2.785.012l-.013.062-.027.122a4.588 4.588 0 01-3.692 3.52c-1.548.27-1.548 2.493 0 2.762a4.588 4.588 0 013.696 3.54l.036.165c.326 1.49 2.446 1.498 2.785.012l.044-.193a4.616 4.616 0 013.71-3.52c1.551-.27 1.551-2.498 0-2.768a4.616 4.616 0 01-3.703-3.492l-.034-.148-.017-.074z" />
      </G>
      <Defs>
        <ClipPath id="clip0_3339_2985">
          <Path fill="#fff" transform="translate(5 4.5)" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
