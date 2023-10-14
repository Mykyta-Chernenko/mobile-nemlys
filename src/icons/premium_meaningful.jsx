import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={21}
      height={21}
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.431 2.996a.556.556 0 00-.639.444L7.985 13.586a.545.545 0 00.448.634l7.135 1.245a.556.556 0 00.64-.446l1.809-10.144a.547.547 0 00-.448-.636l-7.136-1.244h-.002zM6.57 13.338L7.806 6.4 2.574 8.292a.554.554 0 00-.364.492.545.545 0 00.033.212l3.543 9.676a.549.549 0 00.707.328l6.812-2.465a.471.471 0 00.025-.01l-5.149-.898a1.995 1.995 0 01-1.285-.813 1.967 1.967 0 01-.328-1.477h.001z"
        fill="#8C7BF4"
      />
    </Svg>
  );
}

export default SvgComponent;
