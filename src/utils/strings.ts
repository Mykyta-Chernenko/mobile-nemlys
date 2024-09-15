export function randomReadnableString(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
export function capitalize(str: string) {
  if (str.length < 1) return str;
  return str[0].toUpperCase() + str.slice(1);
}

export const getFontSize = (text: string) => {
  if (text?.length > 350) {
    return { h4: true };
  } else if (text?.length > 220) {
    return { h3: true };
  }
  return { h2: true };
};
