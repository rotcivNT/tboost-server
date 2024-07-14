import { encode } from 'blurhash';
import sharp from 'sharp';

export const encodeImageToBlurhash = async (file: Express.Multer.File) => {
  const { data, info } = await sharp(file.buffer).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
};
