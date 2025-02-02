export function showName(name?: string | null) {
  if (!name) return '';
  if (name.length < 15) return name;
  return name.slice(0, 15).trim();
}
export function capitalize(str: string) {
  if (str.length < 1) return str;
  return str[0].toUpperCase() + str.slice(1);
}

export const getFontSize = (text: string) => {
  if (text?.length > 250) {
    return { h4: true };
  } else if (text?.length > 100) {
    return { h3: true };
  }
  return { h2: true };
};

export const getContentTitleSize = (text: string) => {
  if (text?.length > 100) {
    return { small: true };
  }
  return { normal: true };
};

export const hideText = (text: string) => {
  return text.replace(/\S/gu, '*');
};
