import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={44}
      height={30}
      viewBox="0 0 44 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M20.33 1.532a2 2 0 013.34 0l7.339 11.128a2 2 0 002.927.454l6.773-5.478c1.454-1.175 3.583.11 3.22 1.944L39.889 30H4.11L.071 9.58c-.363-1.835 1.766-3.12 3.22-1.944l6.773 5.478a2 2 0 002.927-.454l7.34-11.128z"
        fill="#FDC180"
      />
    </Svg>
  );
}

export default SvgComponent;
