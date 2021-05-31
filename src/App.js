import React, { Component } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { 
    web3: null, 
    accounts: null, 
    contract: null,
    bid: 0,
    contractBalance: 0,
    highestBid: 0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      const highestBid = await instance.methods.highestBid().call();
      const highestBidder = await instance.methods.highestBidder().call();
      const contractBalance = await instance.methods.getContractBalance().call();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, highestBid: highestBid, highestBidder: highestBidder, contractBalance: contractBalance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };



  bid = async () => {
    const { accounts, contract} = this.state;
    await contract.methods.bid().send({ from: accounts[0], value: this.state.input});
  };

  withdraw = async () => {
    const { accounts, contract} = this.state;
    await contract.methods.withdraw().send({from: accounts[0]});

    const response = await contract.methods.highestBidder().call();
    this.setState({highestBidder: response }, () => { console.log(this.state.highestBidder) });
  };

  highestBid = async () => {
    const {contract} = this.state;
    const response = await contract.methods.highestBid().call();
    this.setState({highestBid: response }, () => { console.log(this.state.highestBid) });
  }
  
  contractBalance = async () => {
    const {contract} = this.state;
    const response = await contract.methods.getContractBalance().call();
    this.setState({contractBalance: response }, () => { console.log(this.state.contractBalance) });
  }

  highestBidder = async () => {
    const {contract} = this.state;
    const response = await contract.methods.highestBidder().call();
    this.setState({highestBidder: response }, () => { console.log(this.state.highestBidder) });
  }
  
  myChangeHandler = (event) => {
    this.setState({ input: event.target.value }, () => {
      console.log(this.state.input)
    });
  }



  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    let contractBalanceInfo
    if (this.state.contractBalance == 0) {
      contractBalanceInfo = "";
    }
    else {
      contractBalanceInfo = <div>{this.state.contractBalance}</div>
    }

    let highestBid
    if (this.state.highestBid == 0) {
      highestBid = "";
    }
    else {
      highestBid = <div>{this.state.highestBid}</div>    
    }

    let highestBidder
    if (this.state.highestBidder == this.state.accounts[0]) {
      highestBidder = <div>You
      </div>
    }
    else {
      highestBidder = <div>{this.state.highestBidder}
      </div>
    }

    let bid
    if (this.state.input <= this.state.highestBid) {
      bid = <div>You have to bid higher!</div>
    }
 
    let withdraw
    if (this.state.highestBidder != this.state.accounts[0] && this.state.userBalances != 0) {
      withdraw =<p><h3>Withdraw</h3>
      <button onClick={this.withdraw}>Withdraw</button></p>
    }
 



    return (
      <div className="App">
        <h1>Auction</h1>
       
        <h3>Contract Balance: {contractBalanceInfo}</h3>
        <button onClick={this.contractBalance}>Refresh</button>
              

        <h3>Highest Bid: {highestBid}</h3> 
        <button onClick={this.highestBid}>Refresh</button>

        <h3>Highest Bidder: {highestBidder}</h3>
        <button onClick={this.highestBidder}>Refresh</button>

        <h3>Bid</h3>
        <input type="text" onChange={this.myChangeHandler} />
        <button onClick={this.bid}>Bid</button>
        {bid}  
        

        {withdraw}
      

      </div>      
    );
  }
}

export default App;
