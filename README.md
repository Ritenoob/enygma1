# ENYGMA Trading System v3.6.0

## KuCoin Perpetual Futures Semi-Automated Trading Dashboard

A production-grade cryptocurrency futures trading system with advanced signal generation, live strategy optimization, precision mathematics, and comprehensive risk management.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Technical Indicators](#technical-indicators)
5. [Signal Generation](#signal-generation)
6. [Live Optimizer](#live-optimizer)
7. [Mathematical Formulas](#mathematical-formulas)
8. [Risk Management](#risk-management)
9. [Trailing Stop Modes](#trailing-stop-modes)
10. [API Reference](#api-reference)
11. [Configuration](#configuration)
12. [Installation](#installation)
13. [Testing](#testing)
14. [Version History](#version-history)

---

## Overview

ENYGMA is a sophisticated trading system designed for KuCoin Perpetual Futures markets. It combines:

- **10+ Technical Indicators** with configurable weights
- **Live Strategy Optimizer** for parallel variant testing
- **Precision-Safe Mathematics** using decimal.js
- **Multiple Trailing Stop Algorithms** (Staircase, ATR, Dynamic)
- **Real-time Dashboard** with WebSocket updates
- **Comprehensive Safety Mechanisms**

### Supported Markets
- KuCoin Perpetual Futures (BTCUSDTM, ETHUSDTM, etc.)
- Leverage: 1x - 100x
- Position sizing: 0.1% - 100% of balance

---

## Key Features

### Core Trading Features

| Feature | Description |
|---------|-------------|
| **Multi-Indicator Signals** | 10+ technical indicators with weighted scoring |
| **ROI-Based SL/TP** | Stop-loss and take-profit based on leveraged ROI targets |
| **Fee-Adjusted Break-Even** | Accounts for trading fees before moving to break-even |
| **Slippage Protection** | Buffer on stop orders to prevent stop-hunting |
| **Volatility-Based Leverage** | Auto-adjusts leverage based on ATR percentage |
| **Partial Take-Profit** | Scale out of positions at multiple targets |
| **Net P&L Display** | Shows gross and net profit after fees |

### v3.6.0 - Live Strategy Optimizer

| Feature | Description |
|---------|-------------|
| **Parallel Variant Testing** | Test up to 10 strategy variants simultaneously |
| **Statistical Validation** | Z-test significance testing (n>=50, p<0.05) |
| **Composite Scoring** | ROI, Sharpe, win rate, consistency, drawdown |
| **Real-time Telemetry** | WebSocket streaming of performance metrics |
| **Safety Mechanisms** | Paper trading, loss limits, rate throttling |
| **Promotion Gates** | Confidence thresholds for strategy promotion |

### v3.5.2 - Precision & Reliability

| Feature | Description |
|---------|-------------|
| **Decimal.js Math** | Eliminates floating-point errors |
| **Order Validation** | Enforces `reduceOnly` on all exit orders |
| **Config Validation** | Startup validation with clear error messages |
| **Property-Based Tests** | Edge case coverage with fast-check |
| **Secure Logging** | API key/secret redaction utilities |
| **Event Bus** | Hot/cold path event architecture |

---

## System Architecture

```
+-------------------------------------------------------------------------+
|                           ENYGMA Trading System                          |
+-------------------------------------------------------------------------+
|                                                                          |
|  +--------------+    +--------------+    +--------------------------+   |
|  |   Frontend   |    |   Backend    |    |      KuCoin API          |   |
|  |  Dashboard   |<-->|   Server     |<-->|  (REST + WebSocket)      |   |
|  | (index.html) |    | (server.js)  |    |                          |   |
|  +--------------+    +------+-------+    +--------------------------+   |
|                              |                                          |
|         +--------------------+--------------------+                     |
|         |                    |                    |                     |
|         v                    v                    v                     |
|  +-------------+     +-------------+     +-----------------+            |
|  |  src/lib/   |     |src/optimizer|     | src/marketdata/ |            |
|  |  Core Libs  |     |  Optimizer  |     |  Market Data    |            |
|  +-------------+     +-------------+     +-----------------+            |
|                                                                          |
+-------------------------------------------------------------------------+
```

### Module Structure

```
enygma/
|-- server.js                    # Main backend server (2,300+ lines)
|-- index.html                   # Web dashboard frontend
|-- signal-weights.js            # Indicator weight configuration
|-- package.json                 # Dependencies & scripts
|
|-- src/
|   |-- lib/                     # Core trading libraries
|   |   |-- DecimalMath.js       # Precision-safe financial math
|   |   |-- SignalGenerator.js   # Signal generation engine
|   |   |-- OrderValidator.js    # Order validation & reduceOnly
|   |   |-- ConfigSchema.js      # Configuration validation
|   |   |-- StopOrderStateMachine.js  # Stop order state protection
|   |   |-- SecureLogger.js      # API key redaction logging
|   |   |-- EventBus.js          # Hot/cold path event bus
|   |   |-- PingBudgetManager.js # Rate limiting & WebSocket management
|   |   +-- index.js             # Module exports
|   |
|   |-- optimizer/               # Live Strategy Optimizer
|   |   |-- LiveOptimizerController.js  # Main orchestrator (683 lines)
|   |   |-- OptimizerConfig.js   # Configuration & variant generation
|   |   |-- ScoringEngine.js     # Composite scoring & statistics
|   |   |-- TelemetryFeed.js     # Real-time metrics pub/sub
|   |   |-- ExecutionSimulator.js # Paper trading simulation
|   |   |-- TrailingStopPolicy.js # Trailing stop algorithms
|   |   +-- index.js             # Module exports
|   |
|   +-- marketdata/              # Market data providers
|       |-- OHLCProvider.js      # OHLC candle abstraction
|       +-- index.js             # Module exports
|
|-- tests/                       # Test suite (241 tests)
|   |-- tradeMath.test.js        # Math precision tests
|   |-- tradeMath.property.test.js # Property-based tests
|   |-- signal-generator.test.js # Signal generation tests
|   |-- live-optimizer.test.js   # Optimizer tests
|   |-- execution-simulator.test.js # Paper trading tests
|   +-- ...                      # Additional test files
|
|-- docs/                        # Documentation
|   |-- OPTIMIZER_GUIDE.md       # Complete optimizer guide
|   +-- README_v3.5.2_archive.md # Archived previous README
|
+-- .env.example                 # Environment template
```

---

## Technical Indicators

ENYGMA uses 10 configurable technical indicators for signal generation:

### Primary Indicators

| Indicator | Max Points | Description |
|-----------|------------|-------------|
| **RSI** | 25 | Relative Strength Index - momentum oscillator |
| **Williams %R** | 20 | Momentum oscillator (-100 to 0 scale) |
| **MACD** | 20 | Moving Average Convergence Divergence - trend |
| **Awesome Oscillator** | 15 | Momentum based on moving average difference |
| **EMA Trend** | 20 | Exponential moving average trend direction |

### Secondary Indicators

| Indicator | Max Points | Description |
|-----------|------------|-------------|
| **Stochastic** | 10 | %K/%D momentum with crossovers |
| **Bollinger Bands** | 10 | Volatility-based price channels |
| **KDJ** | 15 | Stochastic variant with J-line |
| **OBV** | 10 | On-Balance Volume - volume confirmation |
| **DOM** | 15 | Depth of Market - order book analysis (live only) |

### Indicator Configuration

```javascript
// signal-weights.js
weights: {
  rsi: {
    max: 25,           // Maximum points contribution
    oversold: 30,      // Below this = bullish signal
    oversoldMild: 40,  // Approaching oversold
    overbought: 70,    // Above this = bearish signal
    overboughtMild: 60 // Approaching overbought
  },
  macd: { max: 20 },
  emaTrend: { max: 20 },
  // ... additional indicators
}
```

---

## Signal Generation

### Signal Scoring System

Signals are generated by combining weighted indicator scores:

```
Total Score = Sum(Indicator Score x Weight)
Score Range: -120 to +120
```

### Signal Thresholds

| Score | Signal Type |
|-------|-------------|
| >= 70 | STRONG_BUY |
| >= 50 | BUY |
| >= 30 | BUY (weak) |
| -30 to +30 | NEUTRAL |
| <= -30 | SELL (weak) |
| <= -50 | SELL |
| <= -70 | STRONG_SELL |

### Signal Profiles

Six pre-configured weight profiles:

| Profile | Focus | Best For |
|---------|-------|----------|
| **default** | Balanced approach | General trading |
| **conservative** | Trend indicators (EMA, MACD) | Swing trading, lower risk |
| **aggressive** | Momentum indicators (RSI, Stochastic) | Scalping, higher risk |
| **balanced** | Equal distribution | Neutral approach |
| **scalping** | Quick signals, tight thresholds | Short-term trades |
| **swingTrading** | Wider thresholds, trend focus | Longer timeframes |

### Switching Profiles

```javascript
// In signal-weights.js
activeProfile: 'aggressive'  // Options: 'default', 'conservative', 'aggressive', 'balanced', 'scalping', 'swingTrading'
```

---

## Live Optimizer

### Overview

The Live Optimizer tests multiple strategy variants in parallel using live market data to find optimal configurations.

### Key Features

- **Parallel Testing**: Up to 10 strategy variants simultaneously
- **Paper Trading**: Safe testing without real orders
- **Statistical Validation**: Z-test with p < 0.05 requirement
- **Composite Scoring**: Multi-factor performance evaluation
- **Safety Limits**: Auto-stop on max loss or drawdown
- **Real-time Telemetry**: WebSocket streaming to dashboard

### Optimizer Architecture

```
+-------------------------------------------------------------+
|                    LiveOptimizerController                   |
|                   (Main Orchestration Layer)                 |
+---------------+--------------+---------------+---------------+
                |              |               |
       +--------v--------+ +---v-------+ +----v------------+
       | OptimizerConfig | |  Scoring  | |  TelemetryFeed  |
       | (Config/Params) | |  Engine   | | (Real-time Pub) |
       +-----------------+ +-----------+ +-----------------+
                |                               |
       +--------v-------------------------------v----------+
       |              ExecutionSimulator                   |
       |         (Paper Trading with Fees/Slippage)        |
       +---------------------------------------------------+
```

### Composite Scoring Formula

```
Score = (ROI x 30%) + (WinRate x 25%) + (Sharpe x 20%) +
        (Consistency x 15%) + (AvgPnL x 10%)

FinalScore = Score x DrawdownPenalty
DrawdownPenalty = 1 - (min(drawdown, 20%) / 40)
```

### Promotion Gate Requirements

| Gate | Threshold | Description |
|------|-----------|-------------|
| Sample Size | >= 50 trades | Minimum for statistical validity |
| Win Rate | >= 55% | Profitable trade percentage |
| Sharpe Ratio | >= 1.0 | Risk-adjusted return |
| ROI | >= 5% | Total return on investment |
| Max Drawdown | <= 15% | Peak-to-trough decline |
| Confidence | >= 80% | Overall confidence score |
| Statistical | p < 0.05 | Z-test significance |

### Quick Start

```bash
# Enable optimizer
export OPTIMIZER_ENABLED=true

# Start server
npm start

# Start testing 5 variants
curl -X POST http://localhost:3001/api/optimizer/start \
  -H "Content-Type: application/json" \
  -d '{"maxVariants": 5}'

# Check results
curl http://localhost:3001/api/optimizer/results

# Promote winning strategy
curl -X POST http://localhost:3001/api/optimizer/promote \
  -H "Content-Type: application/json" \
  -d '{"variantId": "variant_3"}'
```

---

## Mathematical Formulas

All calculations use `decimal.js` for precision-safe arithmetic.

### Position Sizing

```
marginUsed = accountBalance x (positionPercent / 100)
positionValueUSD = marginUsed x leverage
size = floor(positionValueUSD / (entryPrice x multiplier))
```

**Example:**
- Account: $10,000
- Position: 0.5%
- Leverage: 10x
- Entry: $50,000

```
marginUsed = $10,000 x 0.005 = $50
positionValue = $50 x 10 = $500
size = floor($500 / $50,000) = 0.01 BTC
```

### P&L Calculation

```
priceDiff = currentPrice - entryPrice  (for longs)
unrealizedPnl = priceDiff x size x multiplier
leveragedPnlPercent = (unrealizedPnl / marginUsed) x 100
```

**Key Insight:** A 0.2% price move at 10x leverage = 2% ROI on margin.

### ROI-Based Stop-Loss & Take-Profit

```
SL_price (Long)  = entry x (1 - (ROI_risk / leverage / 100))
SL_price (Short) = entry x (1 + (ROI_risk / leverage / 100))

TP_price (Long)  = entry x (1 + (ROI_reward / leverage / 100))
TP_price (Short) = entry x (1 - (ROI_reward / leverage / 100))
```

**Example at 10x leverage:**
- Target SL ROI: 0.5%
- Required price move: 0.5% / 10 = 0.05%
- Entry $50,000 -> SL at $49,975

### Fee-Adjusted Break-Even

```
breakEvenROI = (entryFee + exitFee) x leverage x 100 + buffer
```

**Example:**
- Taker fee: 0.06%
- Leverage: 10x
- Buffer: 0.1%

```
breakEvenROI = (0.0006 + 0.0006) x 10 x 100 + 0.1 = 1.3% ROI
```

### Liquidation Price

```
liqPrice (Long)  = entry x (1 - (1/leverage) x (1 + maintMargin))
liqPrice (Short) = entry x (1 + (1/leverage) x (1 + maintMargin))
```

**Example:**
- Long entry: $10,000
- Leverage: 10x
- Maintenance margin: 0.5%

```
liqPrice = $10,000 x (1 - 0.1 x 1.005) = $8,995
```

### Slippage Buffer

```
adjustedStopPrice (Long)  = stopPrice x (1 - slippageBuffer / 100)
adjustedStopPrice (Short) = stopPrice x (1 + slippageBuffer / 100)
```

Default buffer: 0.02% of price

---

## Risk Management

### Safety Features

| Feature | Description |
|---------|-------------|
| **Reduce-Only Orders** | All exits use `reduceOnly: true` to prevent reversals |
| **Order Validation** | Validates all parameters before submission |
| **API Retry Queue** | Failed operations retried with exponential backoff |
| **Rate Limit Handling** | 5-second cooldown on rate limit errors |
| **Config Validation** | Validates configuration at startup |
| **Position Persistence** | Positions saved to disk for crash recovery |

### Auto-Leverage Tiers

Based on ATR (Average True Range) percentage:

| ATR % | Recommended Leverage |
|-------|---------------------|
| < 0.5% | 50x |
| 0.5-1.0% | 25x |
| 1.0-2.0% | 15x |
| 2.0-3.0% | 10x |
| 3.0-5.0% | 5x |
| > 5.0% | 3x |

### API Retry Queue

```javascript
// Failed operations are queued and retried
// Exponential backoff: 1s -> 2s -> 4s -> ...
// Queue persisted to retry_queue.json
```

---

## Trailing Stop Modes

### 1. Staircase (Default)

Discrete steps based on ROI increments:

```
steps = floor((currentROI - lastTrailedROI) / stepPercent)
if steps > 0:
    slMovePercent = steps x movePercent
    newSL = currentSL x (1 + slMovePercent / 100)  // for longs
```

**Configuration:**
- `TRAILING_STEP_PERCENT`: 0.15% ROI (trail every 0.15% profit)
- `TRAILING_MOVE_PERCENT`: 0.05% price (move SL per step)

### 2. ATR-Based

Dynamic trailing distance based on volatility:

```
trailingDistance = ATR x multiplier
```

Adapts automatically to market conditions.

### 3. Dynamic

Variable step sizes based on profit level:

| ROI Range | Step Size | Move Size |
|-----------|-----------|-----------|
| < 5% | 0.10% | 0.03% |
| 5-20% | 0.15% | 0.05% |
| > 20% | 0.25% | 0.10% |

---

## API Reference

### Trading Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System status with retry queue length |
| `/api/status` | GET | Current trading status |
| `/api/symbols` | GET | Active and available symbols |
| `/api/market/:symbol` | GET | Market data for symbol |
| `/api/positions` | GET | All active positions |
| `/api/config` | GET/POST | View/update trading config |
| `/api/calculate` | POST | Test math calculations |
| `/api/order` | POST | Place new order |
| `/api/close` | POST | Close position |

### Optimizer Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/optimizer/status` | GET | Optimizer state and metrics |
| `/api/optimizer/results` | GET | Ranked variant results |
| `/api/optimizer/start` | POST | Start optimizer `{maxVariants}` |
| `/api/optimizer/stop` | POST | Stop and export results |
| `/api/optimizer/promote` | POST | Promote variant `{variantId}` |

### WebSocket Messages

```javascript
// Request types
{ type: 'get_optimizer_status' }
{ type: 'get_optimizer_performance' }
{ type: 'reset_optimizer' }

// Response types
{ type: 'metrics:update', data: {...} }
{ type: 'telemetry:init', data: {...} }
{ type: 'variant:stopped', data: {...} }
```

---

## Configuration

### Environment Variables

```bash
# .env file
PORT=3001

# KuCoin API (required for live trading)
KUCOIN_API_KEY=your_api_key
KUCOIN_API_SECRET=your_api_secret
KUCOIN_API_PASSPHRASE=your_passphrase
KUCOIN_FUTURES_URL=https://api-futures.kucoin.com
KUCOIN_USE_SANDBOX=false

# Trading settings
KUCOIN_POSITION_SIZE_PERCENT=1.0
KUCOIN_TIMEFRAME=5min
KUCOIN_MIN_PROFIT_ROI=1.0
KUCOIN_EXECUTE_TRADES=false

# Demo mode (synthetic data, no live orders)
DEMO_MODE=false
RUN_INTERVALS=true

# Optimizer settings
OPTIMIZER_ENABLED=false
OPTIMIZER_MAX_VARIANTS=4
OPTIMIZER_AUTO_PROMOTE=false
```

### Trading Parameters

Edit `CONFIG.TRADING` in `server.js`:

```javascript
TRADING: {
  INITIAL_SL_ROI: 0.5,           // 0.5% ROI stop loss
  INITIAL_TP_ROI: 2.0,           // 2.0% ROI take profit
  BREAK_EVEN_BUFFER: 0.1,        // 0.1% buffer above fees
  TRAILING_STEP_PERCENT: 0.15,   // Trail every 0.15% ROI
  TRAILING_MOVE_PERCENT: 0.05,   // Move SL by 0.05% price
  SLIPPAGE_BUFFER_PERCENT: 0.02, // 0.02% slippage buffer
  POSITION_SIZE_PERCENT: 0.5,    // 0.5% of balance
  DEFAULT_LEVERAGE: 10,
  MAX_POSITIONS: 5,
  MAKER_FEE: 0.0002,             // 0.02%
  TAKER_FEE: 0.0006              // 0.06%
}
```

### Optimizer Configuration

Edit `src/optimizer/OptimizerConfig.js`:

```javascript
{
  enabled: false,
  experiments: {
    maxConcurrent: 10,
    minSampleSize: 50,
    testDurationMinutes: 1440
  },
  safety: {
    maxLossPerVariant: 5.0,
    maxDrawdownPercent: 10.0,
    paperTrading: true
  },
  confidence: {
    minWinRate: 0.55,
    minSharpe: 1.0,
    minROI: 5.0,
    promotionThreshold: 0.8
  }
}
```

---

## Installation

### Prerequisites

- Node.js 16+
- npm or yarn
- KuCoin Futures API credentials (for live trading)

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Ritenoob/enygma1.git
cd enygma1

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API credentials

# 4. Start server
npm start

# 5. Open dashboard
# Navigate to http://localhost:3001
```

### Demo Mode

Run without API credentials:

```bash
# Set demo mode in .env
DEMO_MODE=true

# Start server
npm start
```

Demo mode uses synthetic market data and mock trading.

---

## Testing

### Run All Tests

```bash
npm test
```

### Test Output

```
# tests 241
# suites 34
# pass 241
# fail 0
```

### Test Categories

| Category | Tests | Description |
|----------|-------|-------------|
| Math Precision | 18 | DecimalMath calculations |
| Property-Based | 15 | Edge cases with fast-check |
| Signal Generator | 17 | Signal generation logic |
| Config Validation | 17 | Configuration schema |
| Live Optimizer | 22 | Optimizer controller |
| Execution Simulator | 11 | Paper trading |
| Trailing Stop | 15 | Stop algorithms |
| Ping Budget | 12 | Rate limiting |

### Run Specific Tests

```bash
# Rate limiting tests
npm run test:rate-limit

# Research tests (Jest)
npm run test:research

# Property-based invariant tests
npm run test:invariants
```

---

## Version History

### v3.6.0 (Current)
- Live Strategy Optimizer with parallel variant testing
- Statistical validation with z-test significance
- Real-time telemetry streaming
- Composite scoring engine
- 5 new optimizer API endpoints
- 241 tests passing

### v3.5.2
- Precision-safe math with decimal.js
- Order validation with reduceOnly enforcement
- Configuration validation at startup
- Property-based testing with fast-check
- Secure logging utilities

### v3.5.1
- Demo mode with synthetic data
- Automated tests for trading formulas
- GitHub Actions CI pipeline
- Graceful shutdown handling

### v3.5.0
- Fee-adjusted break-even calculation
- Accurate liquidation price formula
- Slippage buffer on stop orders
- API retry queue with exponential backoff
- ROI-based SL/TP with inverse leverage scaling
- Volatility-based auto-leverage
- Enhanced trailing stops (Staircase, ATR, Dynamic)
- Net P&L after fees display

---

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `server.js` | 2,306 | Main backend server |
| `index.html` | ~800 | Dashboard frontend |
| `signal-weights.js` | 239 | Indicator configuration |
| `src/lib/DecimalMath.js` | 298 | Precision math |
| `src/lib/SignalGenerator.js` | 469 | Signal generation |
| `src/lib/PingBudgetManager.js` | 480 | Rate limiting |
| `src/optimizer/LiveOptimizerController.js` | 683 | Optimizer |
| `src/optimizer/ExecutionSimulator.js` | 313 | Paper trading |
| `src/optimizer/ScoringEngine.js` | 293 | Scoring logic |

**Total Production Code: ~6,000+ lines**
**Total Tests: 241 passing**

---

## Risk Disclaimer

This software is for educational purposes only. Cryptocurrency futures trading involves substantial risk of loss. Only trade with funds you can afford to lose. Past performance does not guarantee future results.

---

## License

MIT License

---

## Support

- GitHub Issues: https://github.com/Ritenoob/enygma1/issues
- Documentation: `docs/OPTIMIZER_GUIDE.md`
- Archived README: `docs/README_v3.5.2_archive.md`
