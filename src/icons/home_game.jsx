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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.669.381L8.646 6.429a.69.69 0 00.617.999h6.046a.69.69 0 00.617-.999L12.903.381a.69.69 0 00-1.234 0zM0 1.142A.571.571 0 01.571.571h5.715a.571.571 0 01.571.571v5.714a.572.572 0 01-.571.572H.57A.571.571 0 010 6.856V1.142zM3.429 16a3.429 3.429 0 100-6.857 3.429 3.429 0 000 6.857z"
        fill="#696DDF"
      />
      <Path
        opacity={0.4}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.714 9.145a.857.857 0 000 1.714h5.142a.857.857 0 100-1.714H9.714zm-.858 3.428a.857.857 0 01.858-.857h5.142a.857.857 0 110 1.714H9.714a.857.857 0 01-.858-.857zm0 2.572a.857.857 0 01.858-.858h5.142a.857.857 0 110 1.715H9.714a.857.857 0 01-.858-.857z"
        fill="#696DDF"
      />
    </Svg>
  );
}

export default SvgComponent;
