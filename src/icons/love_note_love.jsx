import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

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
      <Path
        d="M12 7.722c3.677-8.218 11-4.095 11 2.061C23 17.873 12 22 12 22S1 17.874 1 9.625C1 3.469 8.323-.655 12 7.722z"
        fill="#FA40A5"
      />
    </Svg>
  );
}

export default SvgComponent;
