import {
  GetAllAlgoOrdersParams,
  NewAlgoOrderParams,
} from '../../src/types/algo';
import { USDMClient } from '../../src/usdm-client';
import { getTestProxy } from '../proxy.util';

describe('Algo-Service REST Endpoints', () => {
  const API_KEY = process.env.API_KEY_COM;
  const API_SECRET = process.env.API_SECRET_COM;

  const api = new USDMClient(
    {
      api_key: API_KEY,
      api_secret: API_SECRET,
    },
    getTestProxy(),
  );

  const symbol = 'BTCUSDT';
  let algoId: number;
  let clientAlgoId: string;

  /* ---------------------------------------------------------
   * 1. submitNewAlgoOrder
   * --------------------------------------------------------- */
  it('should create a new conditional algo order', async () => {
    const params: NewAlgoOrderParams = {
      algoType: 'CONDITIONAL',
      symbol,
      side: 'SELL',
      type: 'STOP_MARKET',
      timeInForce: 'GTC',
      positionSide: 'LONG',
      triggerPrice: '80',
      closePosition: true,
      clientAlgoId: `x-usdm-test-${Date.now()}`,
    };

    const res = await api.submitNewAlgoOrder(params);
    expect(res).toMatchObject({
      algoId: expect.any(Number),
      clientAlgoId: expect.any(String),
      algoStatus: 'NEW',
      symbol,
    });

    algoId = res.algoId;
    clientAlgoId = res.clientAlgoId;
  });

  /* ---------------------------------------------------------
   * 2. getAlgoOrder (by algoId)
   * --------------------------------------------------------- */
  it('should fetch the algo order by algoId', async () => {
    const res = await api.getAlgoOrder({ algoId });
    expect(res.algoId).toBe(algoId);
    expect(res.symbol).toBe(symbol);
  });

  /* ---------------------------------------------------------
   * 3. getAlgoOrder (by clientAlgoId)
   * --------------------------------------------------------- */
  it('should fetch the algo order by clientAlgoId', async () => {
    const res = await api.getAlgoOrder({ clientAlgoId });
    expect(res.clientAlgoId).toBe(clientAlgoId);
  });

  /* ---------------------------------------------------------
   * 4. getAllOpenAlgoOrders (symbol-specific)
   * --------------------------------------------------------- */
  it('should list open algo orders for LTCUSDT', async () => {
    const list = await api.getAllOpenAlgoOrders({ symbol });
    expect(Array.isArray(list)).toBe(true);
    expect(list.some((o) => o.algoId === algoId)).toBe(true);
  });

  /* ---------------------------------------------------------
   * 5. getAllOpenAlgoOrders (global list)
   * --------------------------------------------------------- */
  it('should list all open algo orders (global)', async () => {
    const list = await api.getAllOpenAlgoOrders();
    expect(Array.isArray(list)).toBe(true);
  });

  /* ---------------------------------------------------------
   * 6. getAllAlgoOrders (historical, 7-day max)
   * --------------------------------------------------------- */
  it('should return historical algo orders', async () => {
    const params: GetAllAlgoOrdersParams = {
      symbol,
      limit: 10,
    };
    const hist = await api.getAllAlgoOrders(params);
    expect(Array.isArray(hist)).toBe(true);
    expect(hist.every((o) => o.symbol === symbol)).toBe(true);
  });

  /* ---------------------------------------------------------
   * 7. cancelAlgoOrder (by algoId)
   * --------------------------------------------------------- */
  it('should cancel the algo order by algoId', async () => {
    const res = await api.cancelAlgoOrder({ algoId });
    expect(res).toMatchObject({
      code: '200',
      msg: 'success',
      algoId,
      clientAlgoId,
    });
  });

  /* ---------------------------------------------------------
   * 8. cancelAlgoOrder (by clientAlgoId)
   * --------------------------------------------------------- */
  it('should cancel an algo order by clientAlgoId', async () => {
    // create a throw-away order to cancel
    const temp = await api.submitNewAlgoOrder({
      algoType: 'CONDITIONAL',
      symbol,
      side: 'BUY',
      type: 'STOP_MARKET',
      positionSide: 'SHORT',
      triggerPrice: '50',
      quantity: '0.1',
      clientAlgoId: `x-usdm-cancel-${Date.now()}`,
    });

    const res = await api.cancelAlgoOrder({ clientAlgoId: temp.clientAlgoId });
    expect(res.code).toBe('200');
  });
});
