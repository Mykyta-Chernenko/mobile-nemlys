export const combineDateWithTime = (date: Date, time: Date): Date => {
  const dateCopy = new Date(date);
  dateCopy.setUTCHours(0, 0, 0, 0);
  const dateWithoutTime = dateCopy.getTime();

  const timeCopy = new Date(time);
  timeCopy.setUTCHours(0, 0, 0, 0);
  const timeWithoutDate = time.getTime() - timeCopy.getTime();
  return new Date(dateWithoutTime + timeWithoutDate);
};
