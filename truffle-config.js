require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider')



module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
    },
    ropsten: {
      provider: function(){
        return new HDWalletProvider(process.env.MNEMONIC,'https://ropsten.infura.io/v3/a5c0811537054f2d9396aeb399c2efc7');
      },
      gas: 8000000,
      gasPrice: 25000000000,
      network_id: 3
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://rinkeby.infura.io/v3/" + process.env.INFURA_API_KEY),
      network_id: 4,
      gas: 3000000,
      gasPrice: 10000000000
    },  
  },

  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
