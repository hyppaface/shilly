const assert = require('assert');
const superagent = require('superagent');

exports.fetchCoinmarketcap = async coin => {
  const { body } = await superagent(
    'https://api.coinmarketcap.com/v1/ticker/?limit=10'
  );
  const [item] = body.filter(_ => _.id === coin);
  assert(item, `${coin} not found`);
  return item;
};

exports.fetchMempool = async coin => {
  const { text } = await superagent(
    `https://api.blockchair.com/${coin}/mempool?u=${+new Date()}`
  ).retry();

  const body = JSON.parse(text);
  const [mempool] = body.data.filter(_ => _.e === 'mempool_transactions');
  return +mempool.c;
};

exports.fetchBchAddressBalance = async address => {
  const { body } = await superagent(
    `https://blockdozer.com/insight-api/addr/${address}/?noTxList=1`
  );
  const { balance } = body;
  return balance;
};

exports.fetchDifficultyAdjustmentEstimate = () =>
  new Promise((resolve, reject) => {
    const x = Xray();

    x(
      'https://bitcoinwisdom.com/bitcoin/difficulty',
      'table:nth-child(2) tr:nth-child(3) td:nth-child(2)'
    )((err, res) => {
      if (err) {
        return reject(err);
      }

      const withoutEscapes = res.replace(/[\n\t]/g, '');
      const withSpace = withoutEscapes.replace(/,/, ', ');
      const lowerCase = withSpace.toLowerCase();

      resolve(lowerCase);
    });
  });

exports.fetchTotalTetherTokens = () =>
  superagent
    .get('http://omniexplorer.info/ask.aspx?api=getpropertytotaltokens&prop=31')
    .retry()
    .then(_ => +_.text);

exports.fetchRecommendedCoreSats = async () => {
  const { body } = await superagent(
    'https://bitcoinfees.earn.com/fees'
  );

  const { bestIndex, fees, medianTxSize } = body;

  return fees[bestIndex].maxFee * medianTxSize;
};