// ============================================================================
// LiveOptimizerController Tests
// Tests the live strategy optimizer controller for parallel variant testing
// ============================================================================

const { test, describe, beforeEach, mock } = require('node:test');
const assert = require('node:assert');
const LiveOptimizerController = require('../src/optimizer/LiveOptimizerController');
const OptimizerConfig = require('../src/optimizer/OptimizerConfig');

describe('LiveOptimizerController', () => {

  describe('Initialization', () => {
    test('creates controller with default config', () => {
      const controller = new LiveOptimizerController();
      assert.ok(controller, 'Controller should be created');
      assert.strictEqual(controller.running, false, 'Should not be running initially');
      assert.ok(controller.variants instanceof Map, 'variants should be a Map');
      assert.ok(controller.variantMetrics instanceof Map, 'variantMetrics should be a Map');
    });

    test('creates controller with custom config', () => {
      const customConfig = {
        ...OptimizerConfig,
        experiments: {
          ...OptimizerConfig.experiments,
          maxConcurrent: 5
        }
      };
      const controller = new LiveOptimizerController(customConfig);
      assert.ok(controller, 'Controller should be created with custom config');
      assert.strictEqual(controller.config.experiments.maxConcurrent, 5);
    });
  });

  describe('Start/Stop Lifecycle', () => {
    test('start() initializes variants and sets running state', async () => {
      const controller = new LiveOptimizerController();

      const result = await controller.start({ maxVariants: 3 });

      assert.ok(result.success, 'start should return success');
      assert.strictEqual(controller.running, true, 'Should be running after start');
      assert.ok(result.variantCount > 0, 'Should have variants');
      assert.ok(Array.isArray(result.variants), 'Should return variant list');

      // Cleanup
      await controller.stop();
    });

    test('start() throws if already running', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      await assert.rejects(
        async () => await controller.start(),
        /already running/i,
        'Should throw if already running'
      );

      // Cleanup
      await controller.stop();
    });

    test('stop() returns results and stops running', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      const result = await controller.stop();

      assert.ok(result.success, 'stop should return success');
      assert.strictEqual(controller.running, false, 'Should not be running after stop');
      assert.ok(result.finalResults, 'Should have final results');
    });

    test('stop() returns failure if not running', async () => {
      const controller = new LiveOptimizerController();

      const result = await controller.stop();

      assert.strictEqual(result.success, false, 'Should return failure');
      assert.ok(result.message, 'Should have message');
    });
  });

  describe('Variant Management', () => {
    test('initializeVariant creates variant state and metrics', async () => {
      const controller = new LiveOptimizerController();

      const experiment = {
        id: 'test_variant_1',
        profile: 'default',
        timeframe: '5m'
      };

      controller.initializeVariant(experiment);

      assert.ok(controller.variants.has('test_variant_1'), 'Variant should be added');
      assert.ok(controller.variantMetrics.has('test_variant_1'), 'Metrics should be added');

      const variant = controller.variants.get('test_variant_1');
      assert.strictEqual(variant.status, 'active', 'Variant should be active');
      assert.ok(Array.isArray(variant.trades), 'Should have trades array');
      assert.ok(Array.isArray(variant.positions), 'Should have positions array');
    });

    test('stopVariant marks variant as stopped', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      const variantId = controller.activeExperiments[0].id;
      controller.stopVariant(variantId, 'Test stop');

      const variant = controller.variants.get(variantId);
      assert.strictEqual(variant.status, 'stopped', 'Variant should be stopped');
      assert.ok(controller.stoppedVariants.has(variantId), 'Should be in stopped set');

      await controller.stop();
    });
  });

  describe('Status and Results', () => {
    test('getStatus returns current optimizer state', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 3 });

      const status = controller.getStatus();

      assert.strictEqual(status.running, true, 'Should show running');
      assert.ok(status.activeVariants >= 0, 'Should show active variants count');
      assert.ok(status.stoppedVariants >= 0, 'Should show stopped variants count');
      assert.ok(status.totalTrades >= 0, 'Should show total trades');
      assert.ok(status.summary, 'Should have summary');

      await controller.stop();
    });

    test('getResults returns ranked variants', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 3 });

      const results = controller.getResults();

      assert.ok(Array.isArray(results.variants), 'Should have variants array');
      assert.ok(Array.isArray(results.topPerformers), 'Should have top performers');
      assert.ok(results.summary, 'Should have summary');

      await controller.stop();
    });

    test('exportResults returns complete snapshot', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      const exported = controller.exportResults();

      assert.ok(exported.timestamp, 'Should have timestamp');
      assert.ok(exported.status, 'Should have status');
      assert.ok(exported.results, 'Should have results');
      assert.ok(exported.telemetry, 'Should have telemetry');

      await controller.stop();
    });
  });

  describe('Price Processing', () => {
    test('processPriceTick updates variant positions', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      // Process a price tick
      const tick = { price: 50000, timestamp: Date.now() };
      await controller.processPriceTick(tick);

      assert.strictEqual(controller.lastPrice, 50000, 'Should update last price');

      await controller.stop();
    });

    test('processPriceTick skips when not running', async () => {
      const controller = new LiveOptimizerController();

      const tick = { price: 50000, timestamp: Date.now() };
      await controller.processPriceTick(tick);

      assert.strictEqual(controller.lastPrice, null, 'Should not update price when not running');
    });
  });

  describe('Safety Mechanisms', () => {
    test('checkSafetyLimits stops variant on max loss', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      const variantId = controller.activeExperiments[0].id;
      const metrics = controller.variantMetrics.get(variantId);

      // Simulate exceeding max loss
      metrics.roi = -10; // Exceeds default maxLossPerVariant (5%)

      controller.checkSafetyLimits(variantId);

      const variant = controller.variants.get(variantId);
      assert.strictEqual(variant.status, 'stopped', 'Variant should be stopped');

      await controller.stop();
    });

    test('checkSafetyLimits stops variant on max drawdown', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      const variantId = controller.activeExperiments[0].id;
      const metrics = controller.variantMetrics.get(variantId);

      // Simulate exceeding max drawdown
      metrics.maxDrawdown = 15; // Exceeds default maxDrawdownPercent (10%)

      controller.checkSafetyLimits(variantId);

      const variant = controller.variants.get(variantId);
      assert.strictEqual(variant.status, 'stopped', 'Variant should be stopped');

      await controller.stop();
    });
  });

  describe('Rate Limiting', () => {
    test('throttleApiCall respects rate limits', async () => {
      const controller = new LiveOptimizerController();

      const startTime = Date.now();
      await controller.throttleApiCall();
      await controller.throttleApiCall();
      const endTime = Date.now();

      // Second call should be throttled
      assert.ok(endTime - startTime >= controller.config.rateLimiting.throttleDelay - 10,
        'Should throttle API calls');
    });
  });

  describe('Promotion', () => {
    test('promoteVariant rejects variant not found', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      await assert.rejects(
        async () => await controller.promoteVariant('nonexistent_variant'),
        /not found/i,
        'Should throw for nonexistent variant'
      );

      await controller.stop();
    });

    test('promoteVariant checks promotion gates', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      const variantId = controller.activeExperiments[0].id;
      const result = await controller.promoteVariant(variantId);

      // Should fail gates since no trades have been made
      assert.strictEqual(result.success, false, 'Should not promote without meeting gates');
      assert.ok(result.checks, 'Should have checks details');

      await controller.stop();
    });
  });

  describe('Event Emission', () => {
    test('emits optimizer:started on start', async () => {
      const controller = new LiveOptimizerController();

      let eventEmitted = false;
      controller.on('optimizer:started', () => {
        eventEmitted = true;
      });

      await controller.start({ maxVariants: 2 });

      assert.ok(eventEmitted, 'Should emit optimizer:started event');

      await controller.stop();
    });

    test('emits optimizer:stopped on stop', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      let eventEmitted = false;
      controller.on('optimizer:stopped', () => {
        eventEmitted = true;
      });

      await controller.stop();

      assert.ok(eventEmitted, 'Should emit optimizer:stopped event');
    });

    test('emits variant:stopped when variant is stopped', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      let eventEmitted = false;
      let eventData = null;
      controller.on('variant:stopped', (data) => {
        eventEmitted = true;
        eventData = data;
      });

      const variantId = controller.activeExperiments[0].id;
      controller.stopVariant(variantId, 'Test reason');

      assert.ok(eventEmitted, 'Should emit variant:stopped event');
      assert.strictEqual(eventData.variantId, variantId, 'Event should have variantId');
      assert.strictEqual(eventData.reason, 'Test reason', 'Event should have reason');

      await controller.stop();
    });
  });

  describe('Metrics Calculation', () => {
    test('calculateSharpeRatio returns 0 with insufficient data', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      const variantId = controller.activeExperiments[0].id;
      const sharpe = controller.calculateSharpeRatio(variantId);

      assert.strictEqual(sharpe, 0, 'Sharpe should be 0 with no trades');

      await controller.stop();
    });

    test('updateMetrics correctly updates after trade', async () => {
      const controller = new LiveOptimizerController();
      await controller.start({ maxVariants: 2 });

      const variantId = controller.activeExperiments[0].id;
      const variant = controller.variants.get(variantId);

      // Simulate a closed trade
      const trade = {
        status: 'closed',
        realizedPnL: 100
      };
      variant.trades.push(trade);

      controller.updateMetrics(variantId, trade);

      const metrics = controller.variantMetrics.get(variantId);
      assert.strictEqual(metrics.totalTrades, 1, 'Should have 1 trade');
      assert.strictEqual(metrics.totalPnL, 100, 'Should have correct PnL');
      assert.strictEqual(metrics.winningTrades, 1, 'Should count as win');
      assert.strictEqual(metrics.winRate, 1, 'Should have 100% win rate');

      await controller.stop();
    });
  });
});
