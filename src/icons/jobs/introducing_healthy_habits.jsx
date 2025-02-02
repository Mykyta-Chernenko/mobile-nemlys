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
        d="M1.964 0A1.714 1.714 0 00.25 1.714v12.572A1.714 1.714 0 001.964 16H12.25a1.714 1.714 0 001.714-1.714v-8.67c0-.454-.181-.89-.503-1.211L9.56.502A1.714 1.714 0 008.348 0H1.964z"
        fill="#8FBFFA"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.177 7.287a.857.857 0 01.857-.857h2.857a.857.857 0 110 1.714H8.034a.857.857 0 01-.857-.857zM7.177 11.822a.857.857 0 01.857-.857h2.857a.857.857 0 010 1.714H8.034a.857.857 0 01-.857-.857zM6.091 9.781a.857.857 0 01.2 1.196L4.695 13.21a.856.856 0 01-1.303.107l-.958-.956a.857.857 0 011.212-1.213l.242.242L4.896 9.98a.857.857 0 011.195-.198zM6.091 5.175a.857.857 0 01.2 1.196L4.695 8.606a.857.857 0 01-1.303.107l-.958-.958a.857.857 0 011.212-1.21l.242.24 1.008-1.41a.857.857 0 011.195-.2z"
        fill="#2859C5"
      />
    </Svg>
  );
}

export default SvgComponent;
