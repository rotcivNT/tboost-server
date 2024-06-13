export const detectTypeOfFile = (mimeType: string) => {
  if (mimeType.includes('image')) {
    return 'image';
  }
  if (mimeType.includes('audio')) {
    return 'audio';
  }
  if (mimeType.includes('video')) {
    return 'video';
  }
  return 'file';
};
