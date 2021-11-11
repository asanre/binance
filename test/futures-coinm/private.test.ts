import { COINMClient } from "../../src/coinm-client";
import { FuturesPosition } from "../../src";

describe('Private Futures USDM REST API Endpoints', () => {
  const API_KEY = process.env.API_KEY_COM;
  const API_SECRET = process.env.API_SECRET_COM;

  const api = new COINMClient({
      disableTimeSync: true,
      api_key: API_KEY,
      api_secret: API_SECRET,
    },
    undefined,
    true);

  const symbol = 'BTCUSD_PERP';

  beforeEach(() => {
    // console.log(`IP request weight: `, api.getRateLimitStates());
  });

  describe('Account/Trade Endpoints', () => {
    it('getCurrentPositionMode()', async () => {
      expect(await api.getCurrentPositionMode()).toStrictEqual({ 'dualSidePosition': expect.any(Boolean) });
    });

    it('getMultiAssetsMode()', async () => {
      expect(await api.getMultiAssetsMode()).toStrictEqual({ 'multiAssetsMargin': expect.any(Boolean) });
    });

    it('getAllOpenOrders()', async () => {
      let actual = await api.getAllOpenOrders({ symbol: symbol });
      expect(actual).toMatchObject(expect.any(Array));
    });

    it('openBuyOrder()', async () => {
      let actual = await api.submitNewOrder({
        symbol: "BTCUSD_PERP",
        type: "MARKET",
        side: "BUY",
        quantity: 340
      });
      expect(actual).toMatchObject(expect.any(Array));
    });

    it('marketBuy()', async () => {
      let actual = await api.submitNewOrder({
        symbol: "BTCUSD_PERP",
        type: "MARKET",
        side: "BUY",
        quantity: 340
      });
      expect(actual).toMatchObject(expect.any(Array));
    });

    it('marketSell()', async () => {
      let actual = await api.submitNewOrder({
        symbol: "BTCUSD_PERP",
        type: "MARKET",
        side: "SELL",
        quantity: 0.5
      });
      expect(actual).toMatchObject(expect.any(Object));
    });

    it('closeBuyPosition()', async () => {
      let actual = await api.submitNewOrder({
        symbol: "BTCUSD_PERP",
        type: "MARKET",
        side: "SELL",
        quantity: 340,
        reduceOnly: "true"
      });
      expect(actual).toMatchObject(expect.any(Array));
    });

    it('closeSellPosition()', async () => {
      let actual = await api.submitNewOrder({
        symbol: "BTCUSD_PERP",
        type: "MARKET",
        side: "BUY",
        quantity: 350,
        reduceOnly: "true"
      });
      expect(actual).toMatchObject(expect.any(Array));
    });


    it('getBalance()', async () => {
      let actual = await api.getBalance();
      expect(actual).toMatchObject(expect.any(Array));
    });

    it('getBalanceByAsset()', async () => {
      let actual = await api.getBalanceByAsset("BTC");
      expect(actual).not.toBeNull();
    });

    it('getPositions()', async () => {
      let actual = await api.getPositions();
      expect(actual).toMatchObject(expect.any(Array));
    });

    it('getPositionsWithAmt()', async () => {
      let actual = await api.getPositionsWithAmt();
      expect(actual).toMatchObject(expect.any(Array));
    });

    it('cancelAllOpenOrders()', async () => {
      let acual = await api.cancelAllOpenOrders({ symbol });
      expect(acual).resolves.toMatchObject({
        "code": 200,
      });
    });

    it('cancelOrder()', async () => {
      expect(api.cancelOrder({ symbol, orderId: 123456 })).rejects.toMatchObject({
        code: -2011,
        message: 'Unknown order sent.',
        body: { code: -2011, msg: 'Unknown order sent.' },
      });
    });

    it('getAccountInformation()', async () => {
      let accountInformation = await api.getAccountInformation();
      expect(accountInformation).toMatchObject({
        'assets': expect.any(Array),
        'availableBalance': expect.any(String),
        'canDeposit': expect.any(Boolean),
        'canTrade': expect.any(Boolean),
        'canWithdraw': expect.any(Boolean),
        'feeTier': expect.any(Number),
        'maxWithdrawAmount': expect.any(String),
        'positions': expect.any(Array),
        'totalCrossUnPnl': expect.any(String),
        'totalCrossWalletBalance': expect.any(String),
        'totalInitialMargin': expect.any(String),
        'totalMaintMargin': expect.any(String),
        'totalMarginBalance': expect.any(String),
        'totalOpenOrderInitialMargin': expect.any(String),
        'totalPositionInitialMargin': expect.any(String),
        'totalUnrealizedProfit': expect.any(String),
        'totalWalletBalance': expect.any(String),
        'updateTime': expect.any(Number),
      });
    });

    it('getIncomeHistory()', async () => {
      expect(await api.getIncomeHistory()).toMatchObject(expect.any(Array));
    });

    it('getNotionalAndLeverageBrackets()', async () => {
      expect(await api.getNotionalAndLeverageBrackets()).toMatchObject(expect.any(Array));
    });

    it('getADLQuantileEstimation()', async () => {
      expect(await api.getADLQuantileEstimation()).toMatchObject(expect.any(Array));
    });

    it('getForceOrders()', async () => {
      expect(await api.getForceOrders()).toMatchObject(expect.any(Array));
    });

    it('getApiQuantitativeRulesIndicators()', async () => {
      expect(await api.getApiQuantitativeRulesIndicators()).toMatchObject({
        'indicators': expect.any(Object),
        'updateTime': expect.any(Number),
      });
    });

    it('getAccountComissionRate()', async () => {
      expect(await api.getAccountComissionRate({ symbol })).toMatchObject({
        'makerCommissionRate': expect.any(String),
        'symbol': expect.any(String),
        'takerCommissionRate': expect.any(String),
      });
    });
  });

  describe('User Data Stream', () => {
    it('should create a user data key', async () => {
      const { listenKey } = await api.getFuturesUserDataListenKey();
      expect(listenKey).toStrictEqual(expect.any(String));
    });

    it('should keep alive user data key', async () => {
      await api.getFuturesUserDataListenKey();
      expect(await api.keepAliveFuturesUserDataListenKey()).toStrictEqual({});
    });

    it('should close user data key', async () => {
      await api.getFuturesUserDataListenKey();
      expect(await api.closeFuturesUserDataListenKey()).toStrictEqual({});
      expect(api.keepAliveFuturesUserDataListenKey()).rejects.toMatchObject({
        code: -1125,
        message: 'This listenKey does not exist.',
      });
    });
  });

});