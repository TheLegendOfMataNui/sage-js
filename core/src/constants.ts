// tslint:disable: no-bitwise

export const MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
export const MIN_SAFE_INTEGER = -MAX_SAFE_INTEGER;

export const INT8U_MAX = 0xFF;
export const INT8U_MIN = 0x0;
export const INT8S_MAX = INT8U_MAX >>> 1;
export const INT8S_MIN = ~INT8S_MAX;

export const INT16U_MAX = 0xFFFF;
export const INT16U_MIN = 0x0;
export const INT16S_MAX = INT16U_MAX >>> 1;
export const INT16S_MIN = ~INT16S_MAX;

export const INT32U_MAX = 0xFFFFFFFF;
export const INT32U_MIN = 0x0;
export const INT32S_MAX = INT32U_MAX >>> 1;
export const INT32S_MIN = ~INT32S_MAX;
