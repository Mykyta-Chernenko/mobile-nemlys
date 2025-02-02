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
        d="M7.463 10.586c.455 2.672-.924 3.676-3.288 3.676-2.365 0-4.05-1.006-3.592-3.676h6.88zM15.406 10.586c.456 2.672-.924 3.676-3.287 3.676-2.366 0-4.048-1.005-3.593-3.676h6.88z"
        fill="#8FBFFA"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M.79 5.427a.857.857 0 01.856-.857h12.709a.857.857 0 110 1.715H1.645a.857.857 0 01-.857-.858H.79z"
        fill="#8FBFFA"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.857 3.31a.857.857 0 00-1.714 0v1.26h1.714V3.31zM2.732 6.284L.675 10.278a.856.856 0 00-.093.308h1.863l1.658-3.22 1.52 3.22h1.84c.018.106.033.209.046.308a5.44 5.44 0 00-.053-.37.858.858 0 00-.068-.218L5.49 6.286H2.733l-.001-.002zm7.945 0h2.758l1.897 4.02c.032.07.055.143.068.219.023.128.04.254.053.378a6.753 6.753 0 00-.046-.316h-1.84l-1.519-3.221-1.66 3.222H8.527l-.01.06.02-.122a.857.857 0 01.083-.246l2.057-3.993v-.001z"
        fill="#2859C5"
      />
    </Svg>
  );
}

export default SvgComponent;
