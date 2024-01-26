// @ts-ignore
import Big from 'big.js'

export const satoshiToBGL = (unit: number) => {
  const conversion = 100000000;

  const bigSatoshi = new Big(unit);
  return Number(bigSatoshi.div(conversion));
}