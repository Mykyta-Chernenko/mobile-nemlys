import React from 'react';

import Markdown from 'react-native-markdown-package';
import { BOLD_FONT_FAMILY, REGULAR_FONT_FAMILY } from './FontText';

interface Props {
  children: React.ReactNode;
}
export default function (props: Props) {
  const markdownStyle = {
    collectiveMd: {
      strong: {
        fontFamily: BOLD_FONT_FAMILY,
      },
      text: {
        color: REGULAR_FONT_FAMILY,
        textAlign: 'justify',
      },
    },
  };
  return <Markdown styles={markdownStyle.collectiveMd}>{props.children}</Markdown>;
}
