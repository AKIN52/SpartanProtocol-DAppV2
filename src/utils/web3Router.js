import { ethers } from "ethers";
import ROUTER from '../config/ABI/Router.json'

import { useWallet } from '@binance-chain/bsc-use-wallet'

const rpcUrl = process.env.REACT_APP_RPC
const net = process.env.REACT_APP_NET

// TOKEN ADDRESSES
export const BNB_ADDR = '0x0000000000000000000000000000000000000000'
export const WBNB_ADDR = net === 'testnet' ? '0x27c6487C9B115c184Bb04A1Cf549b670a22D2870' : '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
export const SPARTA_ADDR = net === 'testnet' ? '0xb58a43D2D9809ff4393193de536F242fefb03613' : '0xE4Ae305ebE1AbE663f261Bc00534067C80ad677C'

// OLD CONTRACT ADDRESSES
export const UTILS_ADDR = net === 'testnet' ? '0x0a30aF25e652354832Ec5695981F2ce8b594e8B3' :'0xCaF0366aF95E8A03E269E52DdB3DbB8a00295F91'
export const DAO_ADDR = net === 'testnet' ? '0x1b83a813045165c81d84b9f5d6916067b57FF9C0' : '0x04e283c9350Bab8A1243ccfc1dd9BF1Ab72dF4f0'
export const ROUTERv1_ADDR = net === 'testnet' ? '0x94fFAD4568fF00D921C76aA158848b33D7Bd65d3' : '0x4ab5b40746566c09f4B90313D0801D3b93f56EF5'
export const ROUTERv2_ADDR = net === 'testnet' ? '0x111589F4cE6f10E72038F1E4a19F7f19bF31Ee35' : '0x9dB88952380c0E35B95e7047E5114971dFf20D07'
export const INCENTIVE_ADDR = net === 'testnet' ? '0xc241d694d51db9e934b147130cfefe8385813b86' : '0xdbe936901aeed4718608d0574cbaab01828ae016'
export const BONDv1_ADDR = net === 'testnet' ? '0x4551457647f6810a917AF70Ca47252BbECD2A36c' : '0xDa7d913164C5611E5440aE8c1d3e06Df713a13Da'
export const BONDv2_ADDR = net === 'testnet' ? '0x7e44b5461A50adB15329895b80866275192a54f6' : '0xE6844821B03828Fd4067167Bc258FA1EEFD1cCdf'
export const BONDv3_ADDR = net === 'testnet' ? '0xa11D0a9F919EDc6D72aF8F90D56735cAd0EBE836' : '0xf2EbA4b92fAFD47a6403d24a567b38C07D7A5b43'

// CURRENT CONTRACT ADDRESSES
// YET TO DEPLOY GLOBALUPGRADE
export const ROUTER_ADDR = ROUTERv2_ADDR

// ABI
export const ROUTER_ABI = ROUTER.abi

const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

// CONNECT ROUTER CONTRACT WITH PROVIDER (READ-ONLY; NOT SIGNER)
const provROUTER = () => {
    const contract = new ethers.Contract(ROUTER_ADDR, ROUTER_ABI, provider)
    console.log(contract)
    return contract
}

// CONNECT ROUTER CONTRACT WITH SIGNER
const signContract = (contract, account) => {
    const signed = contract.connect(account)
    return signed
}

// LIQUIDITY - Add Symmetrically
export const addLiquidity = (inputBase, inputToken, token, send) => {
    let contract = provROUTER
    if (send === true) {contract = signContract(contract)}
    const units = contract.methods.addLiquidity(inputBase, inputToken, token)
    return units
}

// LIQUIDITY - Add Asymmetrically
export const addLiquidityAsym = (inputToken, fromBase, token, send) => {
    let contract = provROUTER
    if (send === true) {contract = signContract(contract)}
    const units = contract.methods.addLiquidityAsym(inputToken,fromBase, token)
    return units
}

// LIQUIDITY - Remove Symmetrically
export const removeLiquidity = (basisPoints, token, send, account) => {
    let contract = provROUTER()
    console.log(contract)
    if (send === true) {contract = signContract(contract, account)}
    console.log(contract)
    const units = contract.removeLiquidity(basisPoints, token);
    return units;
}

// LIQUIDITY - Remove Asymmetrically


    // // Remove % for self
    // function removeLiquidity(uint basisPoints, address token) public returns (uint outputBase, uint outputToken) {
    //     require((basisPoints > 0 && basisPoints <= 10000));
    //     uint _units = iUTILS(_DAO().UTILS()).calcPart(basisPoints, iBEP20(iPOOLCURATION(_DAO().POOLCURATION()).getPool(token)).balanceOf(msg.sender));
    //     return removeLiquidityExact(_units, token);
    // }
    // // Remove an exact qty of units
    // function removeLiquidityExact(uint units, address token) public returns (uint outputBase, uint outputToken) {
    //     address _pool = iPOOLCURATION(_DAO().POOLCURATION()).getPool(token);
    //     require(iPOOLCURATION(_DAO().POOLCURATION()).isPool(_pool) == true);
    //     address _member = msg.sender;
    //     _handleTransferIn(_pool, units, _pool);
    //     (outputBase, outputToken) = Pool(_pool).removeLiquidityForMember(_member);
    //     totalPooled = totalPooled.sub(outputBase);
    //     emit RemoveLiquidity(_member,outputBase, outputToken,units);
    //     return (outputBase, outputToken);
    // }

    // function removeLiquidityAsym(uint units, bool toBase, address token) public returns (uint outputAmount){
    //     outputAmount = removeLiquidityAsymForMember(units, toBase, token, msg.sender);
    //     return outputAmount;
    // }
    // // Remove Asymmetrically
    // function removeLiquidityAsymForMember(uint units, bool toBase, address token, address member) public returns (uint outputAmount){
    //     address pool = iPOOLCURATION(_DAO().POOLCURATION()).getPool(token);
    //     require(iPOOLCURATION(_DAO().POOLCURATION()).isPool(pool) == true);
    //     require(units < iBEP20(pool).totalSupply());
    //     _handleTransferIn(pool, units, pool);
    //     (uint _outputBase, uint _outputToken) = Pool(pool).removeLiquidityForMember(member);
    //     if(toBase){
    //         (uint _baseBought, uint _fee) = swapTo(_outputToken,token, BASE, member);
    //         outputAmount = _baseBought.add(_outputBase);
    //     } else {
    //         (uint _tokenBought, uint _fee) = swapTo(_outputBase, BASE,token, member);
    //         outputAmount = _tokenBought.add(_outputToken);
    //     }
    //     return outputAmount;
    // }

    // //==================================================================================//
    // // Swapping Functions
    // function buy(uint256 amount, address token) public returns (uint256 outputAmount, uint256 fee){
    //     return buyTo(amount, token, msg.sender);
    // }
    // function buyTo(uint amount, address token, address member) public returns (uint outputAmount, uint fee) {
    //     require(token != BASE);
    //     address _token = token;
    //     if(token == address(0)){_token = WBNB;} // Handle BNB
    //     address _pool = iPOOLCURATION(_DAO().POOLCURATION()).getPool(token);
    //     uint _actualAmount = _handleTransferIn(BASE, amount, _pool);
    //     (outputAmount, fee) = Pool(_pool).swap(_token);
    //     _handleTransferOut(token, outputAmount, member);
    //     totalPooled += _actualAmount;
    //     totalVolume += _actualAmount;
    //     totalFees += iUTILS(_DAO().UTILS()).calcSpotValueInBase(token, fee);
    //     return (outputAmount, fee);
    // }
    // function sell(uint amount, address token) public payable returns (uint outputAmount, uint fee){
    //     return sellTo(amount, token, msg.sender);
    // }
    // function sellTo(uint amount, address token, address member) public payable returns (uint outputAmount, uint fee) {
    //     require(token != BASE);
    //     address _pool = iPOOLCURATION(_DAO().POOLCURATION()).getPool(token);
    //     _handleTransferIn(token, amount, _pool);
    //     (outputAmount, fee) = Pool(_pool).swapTo(BASE, member);
    //     totalPooled = totalPooled.sub(outputAmount);
    //     totalVolume += outputAmount;
    //     totalFees += fee;
    //     return (outputAmount, fee);
    // }
    // function swap(uint256 inputAmount, address fromToken, address toToken) public payable returns (uint256 outputAmount, uint256 fee) {
    //     return swapTo(inputAmount, fromToken, toToken, msg.sender);
    // }
    // function swapTo(uint256 inputAmount, address fromToken, address toToken, address member) public payable returns (uint256 outputAmount, uint256 fee) {
    //     require(fromToken != toToken); address _pool;
    //     uint256 _transferAmount = 0;
    //     if(fromToken == BASE){
    //         (outputAmount, fee) = buyTo(inputAmount, toToken, member);
    //         _pool = iPOOLCURATION(_DAO().POOLCURATION()).getPool(toToken);
    //         getsDividend(_pool,toToken, fee);
    //     } else if(toToken == BASE) {
    //         (outputAmount, fee) = sellTo(inputAmount, fromToken, member);
    //         _pool = iPOOLCURATION(_DAO().POOLCURATION()).getPool(fromToken);
    //         getsDividend(_pool,fromToken, fee);
    //     } else {
    //         address _poolTo = iPOOLCURATION(_DAO().POOLCURATION()).getPool(toToken);
    //         (uint256 _yy, uint256 _feey) = sellTo(inputAmount, fromToken, _poolTo);
    //         totalVolume += _yy; totalFees += _feey;
    //         address _toToken = toToken;
    //          _pool = iPOOLCURATION(_DAO().POOLCURATION()).getPool(fromToken);
    //          getsDividend(_pool,fromToken, _feey);
    //         if(toToken == address(0)){_toToken = WBNB;} 
    //         (uint _zz, uint _feez) = Pool(_poolTo).swap(_toToken);
    //         getsDividend(_poolTo,_toToken, _feez);
    //         _handleTransferOut(toToken, _zz, member);
    //         totalFees += iUTILS(_DAO().UTILS()).calcSpotValueInBase(toToken, _feez);
    //         _transferAmount = _yy; outputAmount = _zz; 
    //         fee = _feez + iUTILS(_DAO().UTILS()).calcSpotValueInToken(toToken, _feey);
    //     }
    //     emit Swapped(fromToken, toToken, inputAmount, _transferAmount, outputAmount, fee, member);
    //     return (outputAmount, fee);
    // }
    // function getsDividend(address _pool, address _token, uint fee) internal {
    //     if(iPOOLCURATION(_DAO().POOLCURATION()).isCuratedPool(_pool) == true){
    //         addTradeFee(fee);
    //         addDividend(_token, fee); 
    //        }
    // }
    // //==================================================================================//
    // // Token Transfer Functions
    // function _handleTransferIn(address _token, uint256 _amount, address _pool) internal returns(uint256 actual){
    //     if(_amount > 0) {
    //         if(_token == address(0)){
    //             require((_amount == msg.value));
    //             payable(WBNB).call{value:_amount}(""); 
    //             iBEP20(WBNB).transfer(_pool, _amount); 
    //             actual = _amount;
    //         } else {
    //             uint startBal = iBEP20(_token).balanceOf(_pool);
    //             iBEP20(_token).transferFrom(msg.sender, _pool, _amount); 
    //             actual = iBEP20(_token).balanceOf(_pool).sub(startBal);
    //         }
    //     }
    // }
    // function _handleTransferOut(address _token, uint256 _amount, address _recipient) internal {
    //     if(_amount > 0) {
    //         if (_token == address(0)) {
    //             iWBNB(WBNB).withdraw(_amount);
    //             payable(_recipient).call{value:_amount}(""); 
    //         } else {
    //             iBEP20(_token).transfer(_recipient, _amount);
    //         }
    //     }
    // }


    // //=================================================================================//
    // //Swap Synths

    // function swapSynthToBase(uint inputAmount, address synthIN) public returns (uint outPut){
    //     require(iSYNTHROUTER(_DAO().SYNTHROUTER()).isSynth(synthIN) == true);
    //     address synthINLayer1 = iSYNTH(synthIN).LayerONE();
    //     address _poolIN = iPOOLCURATION(_DAO().POOLCURATION()).getPool(synthINLayer1);
       
    //     _handleTransferIn(synthIN, inputAmount, _poolIN);
    //     (uint outputBase, uint fee) = Pool(_poolIN).swapSynthIN(synthIN);
    //     totalPooled = totalPooled.sub(outputBase); 
    //     totalVolume += outputBase;
    //     totalFees += fee;
    //     getsDividend( _poolIN,  synthINLayer1,  fee);
    //     _handleTransferOut(BASE, outputBase, msg.sender);
    //     emit SwappedSynth(synthIN, BASE, inputAmount, outputBase, fee, msg.sender);
    //     return outputBase;
    // }
    // function swapBaseToSynth(uint inputAmount, address synthOUT) public returns (uint outPut){
    //     require(iSYNTHROUTER(_DAO().SYNTHROUTER()).isSynth(synthOUT) == true);
    //     address synthOUTLayer1 = iSYNTH(synthOUT).LayerONE();
    //     address _poolOUT = iPOOLCURATION(_DAO().POOLCURATION()).getPool(synthOUTLayer1);
    //     require(iPOOLCURATION(_DAO().POOLCURATION()).isPool(_poolOUT) == true);
    //     _handleTransferIn(BASE, inputAmount, _poolOUT);
    //     (uint outputSynth, uint fee) = Pool(_poolOUT).swapSynthOUT(synthOUT);
    //     totalPooled = totalPooled.add(inputAmount);
    //     totalVolume += inputAmount;
    //     totalFees += fee;
    //     getsDividend( _poolOUT,  synthOUTLayer1,  fee);
    //     _handleTransferOut(synthOUT,outputSynth,msg.sender);
    //     emit SwappedSynth(BASE, synthOUT, inputAmount, outputSynth, fee, msg.sender);
    //     return outputSynth;
    // }