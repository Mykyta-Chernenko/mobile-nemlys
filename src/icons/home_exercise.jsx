import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

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
      <Path
        d="M8.03 3.209a.547.547 0 00-.67-.397L.406 4.717a.562.562 0 00-.388.687l2.668 10.181c.078.3.379.477.671.397l6.953-1.905a.562.562 0 00.387-.687L8.031 3.209z"
        fill="#C9584E"
      />
      <Path
        opacity={0.5}
        d="M7.97.416A.547.547 0 018.64.019l6.953 1.905c.293.08.466.388.388.687l-2.668 10.181a.547.547 0 01-.672.397L5.69 11.284a.562.562 0 01-.388-.687L7.97.416z"
        fill="#C9584E"
      />
    </Svg>
  );
}

export default SvgComponent;
