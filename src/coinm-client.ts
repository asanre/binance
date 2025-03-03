import { AxiosRequestConfig } from 'axios';

import {
  BasicSymbolPaginatedParams,
  BasicSymbolParam,
  BinanceBaseUrlKey,
  CancelOCOParams,
  CancelOrderParams,
  GenericCodeMsgError,
  GetAllOrdersParams,
  GetOrderParams,
  HistoricalTradesParams,
  KlinesParams,
  NewOCOParams,
  OrderBookParams,
  OrderIdProperty,
  RecentTradesParams,
  SymbolFromPaginatedRequestFromId,
} from './types/shared';

import {
  AggregateFuturesTrade,
  CancelAllOpenOrdersResult,
  CancelFuturesOrderResult,
  CancelMultipleOrdersParams,
  CancelOrdersTimeoutParams,
  ContinuousContractKlinesParams,
  ForceOrderResult,
  FundingRateHistory,
  FuturesAccountBalance,
  FuturesAccountInformation,
  FuturesDataPaginatedParams,
  FuturesExchangeInfo,
  FuturesKline,
  FuturesOrderBook,
  FuturesPosition,
  FuturesPositionTrade,
  FuturesSymbolOrderBookTicker,
  GetForceOrdersParams,
  GetIncomeHistoryParams,
  GetPositionMarginChangeHistoryParams,
  IncomeHistory,
  IndexPriceKlinesParams,
  MarkPrice,
  ModeChangeResult,
  MultiAssetModeResponse,
  MultiAssetsMode,
  NewFuturesOrderParams,
  NewOrderError,
  NewOrderResult,
  OpenInterest,
  OrderResult,
  PositionModeParams,
  PositionModeResponse,
  RawFuturesTrade,
  RebateDataOverview,
  SetIsolatedMarginParams,
  SetIsolatedMarginResult,
  SetLeverageParams,
  SetLeverageResult,
  SetMarginTypeParams,
  SymbolKlinePaginatedParams,
  SymbolLeverageBracketsResult,
} from './types/futures';

import {
  generateNewOrderId,
  getOrderIdPrefix,
  getServerTimeEndpoint,
  logInvalidOrderId,
  RestClientOptions,
} from './util/requestUtils';

import BaseRestClient from './util/BaseRestClient';

export class COINMClient extends BaseRestClient {
  private clientId: BinanceBaseUrlKey;

  constructor(
    restClientOptions: RestClientOptions = {},
    requestOptions: AxiosRequestConfig = {},
    useTestnet?: boolean,
  ) {
    const clientId = useTestnet ? 'coinmtest' : 'coinm';
    super(clientId, restClientOptions, requestOptions);

    this.clientId = clientId;
    return this;
  }

  /**
   * Abstraction required by each client to aid with time sync / drift handling
   */
  async getServerTime(): Promise<number> {
    return this.get(getServerTimeEndpoint(this.clientId))
      .then(response => response.serverTime);
  }

  /**
   *
   * Market Data Endpoints
   *
   **/

  testConnectivity(): Promise<{}> {
    return this.get('dapi/v1/ping');
  }

  getExchangeInfo(): Promise<FuturesExchangeInfo> {
    return this.get('dapi/v1/exchangeInfo');
  }

  getOrderBook(params: OrderBookParams): Promise<FuturesOrderBook> {
    return this.get('dapi/v1/depth', params);
  }

  getRecentTrades(params: RecentTradesParams): Promise<RawFuturesTrade[]> {
    return this.get('dapi/v1/trades', params);
  }

  getHistoricalTrades(params: HistoricalTradesParams): Promise<RawFuturesTrade[]> {
    return this.get('dapi/v1/historicalTrades', params);
  }

  getAggregateTrades(params: SymbolFromPaginatedRequestFromId): Promise<AggregateFuturesTrade[]> {
    return this.get('dapi/v1/aggTrades', params);
  }

  getKlines(params: KlinesParams): Promise<FuturesKline[]> {
    return this.get('dapi/v1/klines', params);
  }

  getContinuousContractKlines(params: ContinuousContractKlinesParams): Promise<FuturesKline[]> {
    return this.get('dapi/v1/continuousKlines', params);
  }

  getIndexPriceKlines(params: IndexPriceKlinesParams): Promise<FuturesKline[]> {
    return this.get('dapi/v1/indexPriceKlines', params);
  }

  getMarkPriceKlines(params: SymbolKlinePaginatedParams): Promise<FuturesKline[]> {
    return this.get('dapi/v1/markPriceKlines', params);
  }

  async getMarkPrice(params?: Partial<BasicSymbolParam>): Promise<MarkPrice[]> {
    return this.get('dapi/v1/premiumIndex', params);
  }

  async getMarkPriceBySymbol(symbol: string): Promise<MarkPrice | undefined> {
    return (await this.getMarkPrice({ symbol })).pop();
  }

  getFundingRateHistory(params?: Partial<BasicSymbolPaginatedParams>): Promise<FundingRateHistory[]> {
    return this.get('dapi/v1/fundingRate', params);
  }

  get24hrChangeStatististics(params?: Partial<BasicSymbolParam>): Promise<any> {
    return this.get('dapi/v1/ticker/24hr', params);
  }

  getSymbolPriceTicker(params?: Partial<BasicSymbolParam>): Promise<any> {
    return this.get('dapi/v1/ticker/price', params);
  }

  getSymbolOrderBookTicker(params?: Partial<BasicSymbolParam>): Promise<FuturesSymbolOrderBookTicker | FuturesSymbolOrderBookTicker[]> {
    return this.get('dapi/v1/ticker/bookTicker', params);
  }

  getOpenInterest(params: BasicSymbolParam): Promise<OpenInterest> {
    return this.get('dapi/v1/openInterest', params);
  }

  getOpenInterestStatistics(params: FuturesDataPaginatedParams): Promise<any> {
    return this.get('futures/data/openInterestHist', params);
  }

  getTopTradersLongShortAccountRatio(params: FuturesDataPaginatedParams): Promise<any> {
    return this.get('futures/data/topLongShortAccountRatio', params);
  }

  getTopTradersLongShortPositionRatio(params: FuturesDataPaginatedParams): Promise<any> {
    return this.get('futures/data/topLongShortPositionRatio', params);
  }

  getGlobalLongShortAccountRatio(params: FuturesDataPaginatedParams): Promise<any> {
    return this.get('futures/data/globalLongShortAccountRatio', params);
  }

  getTakerBuySellVolume(params: FuturesDataPaginatedParams): Promise<any> {
    return this.get('futures/data/takerlongshortRatio', params);
  }

  getHistoricalBlvtNavKlines(params: SymbolKlinePaginatedParams): Promise<any> {
    return this.get('dapi/v1/lvtKlines', params);
  }

  getCompositeSymbolIndex(params?: Partial<BasicSymbolParam>): Promise<any> {
    return this.get('dapi/v1/indexInfo', params);
  }

  /**
   *
   * USD-Futures Account/Trade Endpoints
   *
   **/

  setPositionMode(params: PositionModeParams): Promise<ModeChangeResult> {
    return this.postPrivate('dapi/v1/positionSide/dual', params);
  }

  getCurrentPositionMode(): Promise<PositionModeResponse> {
    return this.getPrivate('dapi/v1/positionSide/dual');
  }

  setMultiAssetsMode(params: {
    multiAssetsMargin: MultiAssetsMode;
  }): Promise<ModeChangeResult> {
    return this.postPrivate('dapi/v1/multiAssetsMargin', params);
  }

  getMultiAssetsMode(): Promise<MultiAssetModeResponse> {
    return this.getPrivate('dapi/v1/multiAssetsMargin');
  }

  submitNewOrder(params: NewFuturesOrderParams): Promise<NewOrderResult | NewOrderError> {
    this.validateOrderId(params, 'newClientOrderId');
    return this.postPrivate('dapi/v1/order', params);
  }

  /**
   * Warning: max 5 orders at a time!
   */
  submitMultipleOrders(batchOrders: NewFuturesOrderParams[]): Promise<(NewOrderResult | NewOrderError)[]> {
    batchOrders.forEach(order => this.validateOrderId(order, 'newClientOrderId'));
    return this.postPrivate('dapi/v1/batchOrders', { batchOrders });
  }

  getOrder(params: GetOrderParams): Promise<OrderResult> {
    return this.getPrivate('dapi/v1/order', params);
  }

  cancelOrder(params: CancelOrderParams): Promise<CancelFuturesOrderResult> {
    return this.deletePrivate('dapi/v1/order', params);
  }

  cancelAllOpenOrders(params: BasicSymbolParam): Promise<CancelAllOpenOrdersResult> {
    return this.deletePrivate('dapi/v1/allOpenOrders', params);
  }

  cancelMultipleOrders(params: CancelMultipleOrdersParams): Promise<(CancelFuturesOrderResult | GenericCodeMsgError)[]> {
    return this.deletePrivate('dapi/v1/batchOrders', params);
  }

  // Auto-cancel all open orders
  setCancelOrdersOnTimeout(params: CancelOrdersTimeoutParams): Promise<any> {
    return this.postPrivate('dapi/v1/positionSide', params);
  }

  getCurrentOpenOrder(params: GetOrderParams): Promise<OrderResult> {
    return this.getPrivate('dapi/v1/openOrder', params);
  }

  getAllOpenOrders(params?: Partial<BasicSymbolParam>): Promise<OrderResult[]> {
    return this.getPrivate('dapi/v1/openOrders', params);
  }

  getAllOrders(params: GetAllOrdersParams): Promise<OrderResult[]> {
    return this.getPrivate('dapi/v1/allOrders', params);
  }

  async getBalance(): Promise<FuturesAccountBalance[]> {
    return this.getPrivate('dapi/v1/balance');
  }

  async getBalanceByAsset(asset: string): Promise<FuturesAccountBalance | undefined> {
    let balance: FuturesAccountBalance[] = await this.getBalance();
    return balance.filter(value => value.asset === asset).pop();
  }

  getAccountInformation(): Promise<FuturesAccountInformation> {
    return this.getPrivate('dapi/v1/account');
  }

  setLeverage(params: SetLeverageParams): Promise<SetLeverageResult> {
    return this.postPrivate('dapi/v1/leverage', params);
  }

  setMarginType(params: SetMarginTypeParams): Promise<ModeChangeResult> {
    return this.postPrivate('dapi/v1/marginType', params);
  }

  setIsolatedPositionMargin(params: SetIsolatedMarginParams): Promise<SetIsolatedMarginResult> {
    return this.postPrivate('dapi/v1/positionMargin', params);
  }

  getPositionMarginChangeHistory(params: GetPositionMarginChangeHistoryParams): Promise<any> {
    return this.getPrivate('dapi/v1/positionMargin/history', params);
  }

  async getPositions(): Promise<FuturesPosition[]> {
    return this.getPrivate('dapi/v1/positionRisk');
  }

  async getPositionsWithAmt(): Promise<FuturesPosition[]> {
    const positions: FuturesPosition[] = await this.getPositions();
    return positions.filter(value => +value.positionAmt !== 0);
  }

  async getPositionsBySymbol(symbol: string): Promise<FuturesPosition[]> {
    const positions: FuturesPosition[] = await this.getPositions();
    return positions.filter(value => value.symbol === symbol)
  }

  getAccountTrades(params: SymbolFromPaginatedRequestFromId): Promise<FuturesPositionTrade[]> {
    return this.getPrivate('dapi/v1/userTrades', params);
  }

  getIncomeHistory(params?: GetIncomeHistoryParams): Promise<IncomeHistory[]> {
    return this.getPrivate('dapi/v1/income', params);
  }

  getNotionalAndLeverageBrackets(params?: Partial<BasicSymbolParam>): Promise<SymbolLeverageBracketsResult[] | SymbolLeverageBracketsResult> {
    return this.getPrivate('dapi/v1/leverageBracket', params);
  }

  getADLQuantileEstimation(params?: Partial<BasicSymbolParam>): Promise<any> {
    return this.getPrivate('dapi/v1/adlQuantile', params);
  }

  getForceOrders(params?: GetForceOrdersParams): Promise<ForceOrderResult[]> {
    return this.getPrivate('dapi/v1/forceOrders', params);
  }

  getApiQuantitativeRulesIndicators(params?: Partial<BasicSymbolParam>): Promise<any> {
    return this.getPrivate('dapi/v1/apiTradingStatus', params);
  }

  getAccountComissionRate(params: BasicSymbolParam): Promise<RebateDataOverview> {
    return this.getPrivate('dapi/v1/commissionRate', params);
  }

  /**
   *
   * Broker Futures Endpoints
   *
   **/

  // 1 == USDT-Margined, 2 == Coin-margined
  getBrokerIfNewFuturesUser(brokerId: string, type: 1 | 2 = 1): Promise<{ brokerId: string; rebateWorking: boolean; ifNewUser: boolean; }> {
    return this.getPrivate('dapi/v1/apiReferral/ifNewUser', {
      brokerId,
      type,
    });
  }

  setBrokerCustomIdForClient(customerId: string, email: string): Promise<{ customerId: string; email: string; }> {
    return this.postPrivate('dapi/v1/apiReferral/customization', {
      customerId,
      email,
    });
  }

  getBrokerClientCustomIds(customerId: string, email: string, page?: number, limit?: number): Promise<any> {
    return this.getPrivate('dapi/v1/apiReferral/customization', {
      customerId,
      email,
      page,
      limit,
    });
  }

  getBrokerUserCustomId(brokerId: string): Promise<any> {
    return this.getPrivate('dapi/v1/apiReferral/userCustomization', {
      brokerId,
    })
  }

  getBrokerRebateDataOverview(type: 1 | 2 = 1): Promise<RebateDataOverview> {
    return this.getPrivate('dapi/v1/apiReferral/overview', {
      type,
    });
  }

  getBrokerUserTradeVolume(type: 1 | 2 = 1, startTime?: number, endTime?: number, limit?: number): Promise<any> {
    return this.getPrivate('dapi/v1/apiReferral/tradeVol', {
      type,
      startTime,
      endTime,
      limit,
    });
  }

  getBrokerRebateVolume(type: 1 | 2 = 1, startTime?: number, endTime?: number, limit?: number): Promise<any> {
    return this.getPrivate('dapi/v1/apiReferral/rebateVol', {
      type,
      startTime,
      endTime,
      limit,
    });
  }

  getBrokerTradeDetail(type: 1 | 2 = 1, startTime?: number, endTime?: number, limit?: number): Promise<any> {
    return this.getPrivate('dapi/v1/apiReferral/traderSummary', {
      type,
      startTime,
      endTime,
      limit,
    });
  }

  /**
   *
   * User Data Stream Endpoints
   *
   **/

  // USD-M Futures

  getFuturesUserDataListenKey(): Promise<{ listenKey: string; }> {
    return this.post('dapi/v1/listenKey');
  }

  keepAliveFuturesUserDataListenKey(): Promise<{}> {
    return this.put('dapi/v1/listenKey');
  }

  closeFuturesUserDataListenKey(): Promise<{}> {
    return this.delete('dapi/v1/listenKey');
  }


  /**
   * Validate syntax meets requirements set by binance. Log warning if not.
   */
  private validateOrderId(params: NewFuturesOrderParams | CancelOrderParams | NewOCOParams | CancelOCOParams, orderIdProperty: OrderIdProperty): void {
    const apiCategory = this.clientId;
    if (!params[orderIdProperty]) {
      params[orderIdProperty] = generateNewOrderId(apiCategory);
      return;
    }

    const expectedOrderIdPrefix = `x-${getOrderIdPrefix(apiCategory)}`;
    if (!params[orderIdProperty].startsWith(expectedOrderIdPrefix)) {
      logInvalidOrderId(orderIdProperty, expectedOrderIdPrefix, params);
    }
  }
};
