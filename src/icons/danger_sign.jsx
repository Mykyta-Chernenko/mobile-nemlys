import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M16 2.227c1.273 0 2.46.622 3.186 1.662l.14.214 10.819 18.064a3.885 3.885 0 01-3.076 5.817l-.26.01H5.176a3.885 3.885 0 01-3.443-5.6l.132-.246 10.813-18.05A3.885 3.885 0 0116 2.226zM16.013 20l-.17.01a1.334 1.334 0 000 2.647l.157.01.169-.01a1.333 1.333 0 000-2.648l-.156-.01zM16 10.667a1.333 1.333 0 00-1.324 1.177l-.01.156v5.333l.01.156a1.333 1.333 0 002.648 0l.009-.156V12l-.01-.156A1.333 1.333 0 0016 10.667z"
        fill="#EB5353"
      />
    </Svg>
  );
}

export default SvgComponent;
