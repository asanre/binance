// ==========================
// Common primitive aliases
// ==========================
export type Symbol = string;
export type OrderId = number;
export type ClientOrderId = string;

export type AlgoType = 'CONDITIONAL'; // future: | 'OCO' | 'ICEBERG' …
export type Side = 'BUY' | 'SELL';
export type PositionSide = 'BOTH' | 'LONG' | 'SHORT';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';
export type WorkingType = 'MARK_PRICE' | 'CONTRACT_PRICE';
export type SelfTradePreventionMode =
  | 'NONE'
  | 'EXPIRE_TAKER'
  | 'EXPIRE_MAKER'
  | 'EXPIRE_BOTH';

export type ConditionalOrderType =
  | 'STOP_MARKET'
  | 'TAKE_PROFIT_MARKET'
  | 'STOP'
  | 'TAKE_PROFIT'
  | 'TRAILING_STOP_MARKET';

export type AlgoStatus =
  | 'NEW'
  | 'CANCELED'
  | 'TRIGGERING'
  | 'TRIGGERED'
  | 'FINISHED'
  | 'REJECTED'
  | 'EXPIRED';

// ==========================
// Shared base interfaces
// ==========================
export interface BaseAlgoOrder {
  symbol: Symbol;
  side: Side;
  positionSide?: PositionSide;
  timeInForce?: TimeInForce;
  quantity?: string; // omitted when closePosition=true
  price?: string; // LIMIT variants
  triggerPrice?: string;
  workingType?: WorkingType;
  closePosition?: boolean;
  reduceOnly?: boolean;
  activatePrice?: string; // TRAILING_STOP_MARKET
  callbackRate?: string; // TRAILING_STOP_MARKET
  clientAlgoId?: ClientOrderId;
  priceProtect?: boolean;
  selfTradePreventionMode?: SelfTradePreventionMode;
}

export interface BaseAlgoResponse {
  algoId: OrderId;
  clientAlgoId: ClientOrderId;
  symbol: Symbol;
  side: Side;
  positionSide: PositionSide;
  timeInForce: TimeInForce;
  quantity: string;
  triggerPrice: string;
  price?: string;
  algoStatus: AlgoStatus;
  createTime: number;
  updateTime: number;
}

// ==========================
// Request interfaces
// ==========================
export interface NewAlgoOrderParams extends BaseAlgoOrder {
  algoType: AlgoType;
  type: ConditionalOrderType;
}

export interface GetAlgoOrderParams {
  symbol?: Symbol;
  algoId?: OrderId;
  clientAlgoId?: ClientOrderId;
}

export type CancelAlgoOrderParams = GetAlgoOrderParams;
export interface GetAllAlgoOrdersParams {
  symbol: Symbol;
  startTime?: number;
  endTime?: number;
  page?: number;
  limit?: number;
}

// ==========================
// Response interfaces
// ==========================
export interface AlgoOrderResult extends BaseAlgoResponse {
  algoType: string;
  orderType: string;
}

export interface NewAlgoOrderResult extends BaseAlgoResponse {
  algoType: AlgoType;
  orderType: ConditionalOrderType;
  closePosition: boolean;
  reduceOnly: boolean;
  priceProtect: boolean;
  workingType: WorkingType;
  selfTradePreventionMode: SelfTradePreventionMode;
  activatePrice?: string;
  callbackRate?: string;
  triggerTime: number;
  goodTillDate: number;
}

export interface CancelAlgoOrderResult {
  algoId: OrderId;
  clientAlgoId: ClientOrderId;
  code: string;
  msg: string;
}
