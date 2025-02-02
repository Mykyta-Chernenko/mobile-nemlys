import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

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
      <G clipPath="url(#clip0_4104_11904)" fill="#000">
        <Path d="M13.316 4.012a.665.665 0 01.078 1.324l-.078.005h-.053l-.611 7.312a1.994 1.994 0 01-1.877 1.99l-.117.004H5.34c-1.062 0-1.93-.83-1.988-1.828l-.004-.111-.613-7.367h-.053a.665.665 0 01-.078-1.325l.078-.004h10.634zM9.329 1.352a1.33 1.33 0 011.33 1.329.665.665 0 01-1.325.078l-.005-.078H6.67l-.004.078A.665.665 0 015.34 2.68a1.33 1.33 0 011.23-1.326l.1-.003h2.658z" />
      </G>
      <Defs>
        <ClipPath id="clip0_4104_11904">
          <Path fill="#fff" transform="translate(.023 .023)" d="M0 0H15.9524V15.9524H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
