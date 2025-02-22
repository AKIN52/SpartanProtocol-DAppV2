/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import { getProviderGasPrice, parseTxn } from '../../utils/web3'
import { getDaoContract, getDaoVaultContract } from '../../utils/getContracts'
import { BN } from '../../utils/bigNumber'
import { getPoolShareWeight } from '../../utils/math/utils'

export const useDao = () => useSelector((state) => state.dao)

export const daoSlice = createSlice({
  name: 'dao',
  initialState: {
    loading: false,
    error: null,
    global: false,
    totalWeight: false,
    member: false,
    daoDetails: false,
    proposal: false,
    lastDeposits: false,
    proposalWeight: false,
    txn: [],
    propTxn: [],
  },
  reducers: {
    updateLoading: (state, action) => {
      state.loading = action.payload
    },
    updateError: (state, action) => {
      state.error = action.payload.toString()
    },
    updateGlobal: (state, action) => {
      state.global = action.payload
    },
    updateTotalWeight: (state, action) => {
      state.totalWeight = action.payload
    },
    updateMember: (state, action) => {
      state.member = action.payload
    },
    updateDaoDetails: (state, action) => {
      state.daoDetails = action.payload
    },
    updateProposal: (state, action) => {
      state.proposal = action.payload
    },
    updateLastDeposits: (state, action) => {
      state.lastDeposits = action.payload
    },
    updateProposalWeight: (state, action) => {
      state.proposalWeight = action.payload
    },
    updateTxn: (state, action) => {
      state.txn = action.payload
    },
    updatePropTxn: (state, action) => {
      state.propTxn = action.payload
    },
  },
})

export const {
  updateLoading,
  updateError,
  updateGlobal,
  updateTotalWeight,
  updateMember,
  updateDaoDetails,
  updateProposal,
  updateLastDeposits,
  updateProposalWeight,
  updateTxn,
  updatePropTxn,
} = daoSlice.actions

/**
 * Get the global daoVault details
 * @returns globalDetails
 */
export const daoGlobalDetails = (rpcUrls) => async (dispatch) => {
  dispatch(updateLoading(true))
  const contract = getDaoContract(null, rpcUrls)

  try {
    let awaitArray = [
      contract.callStatic.running(),
      contract.callStatic.coolOffPeriod(),
      contract.callStatic.erasToEarn(),
      contract.callStatic.daoClaim(),
      contract.callStatic.daoFee(),
      contract.callStatic.currentProposal(),
      contract.callStatic.cancelPeriod(),
    ]
    awaitArray = await Promise.all(awaitArray)
    const global = {
      running: awaitArray[0], // Dao proposals currently running?
      coolOffPeriod: awaitArray[1].toString(), // Dao coolOffPeriod
      erasToEarn: awaitArray[2].toString(), // Dao erasToEarn
      daoClaim: awaitArray[3].toString(), // Dao daoClaim
      daoFee: awaitArray[4].toString(), // Dao proposal fee
      currentProposal: awaitArray[5].toString(), // Dao proposalCount / current PID
      cancelPeriod: awaitArray[6].toString(), // Dao proposal seconds until can be cancelled
    }
    dispatch(updateGlobal(global))
  } catch (error) {
    dispatch(updateError(error))
  }
}

/**
 * Get the current daoVault's total weight
 * @param poolDetails
 */
export const daoVaultWeight = (poolDetails, rpcUrls) => async (dispatch) => {
  dispatch(updateLoading(true))
  const contract = getDaoVaultContract(null, rpcUrls)
  try {
    let totalWeight = BN(0)
    const vaultPools = poolDetails.filter((x) => x.curated && !x.hide)
    if (vaultPools.length > 0) {
      const awaitArray = []
      for (let i = 0; i < vaultPools.length; i++) {
        awaitArray.push(
          contract.callStatic.mapTotalPool_balance(vaultPools[i].address),
        )
      }
      const totalStaked = await Promise.all(awaitArray)
      for (let i = 0; i < totalStaked.length; i++) {
        totalWeight = totalWeight.plus(
          getPoolShareWeight(
            totalStaked[i].toString(),
            vaultPools[i].poolUnits,
            vaultPools[i].baseAmount,
          ),
        )
      }
    }
    dispatch(updateTotalWeight(totalWeight.toString()))
  } catch (error) {
    dispatch(updateError(error))
  }
  dispatch(updateLoading(false))
}

/**
 * Get the daoVault member details
 */
export const daoMemberDetails = (wallet, rpcUrls) => async (dispatch) => {
  dispatch(updateLoading(true))
  const contract = getDaoContract(null, rpcUrls)
  try {
    let awaitArray = [contract.callStatic.mapMember_lastTime(wallet.account)]
    awaitArray = await Promise.all(awaitArray)
    const member = {
      lastHarvest: awaitArray[0].toString(),
    }
    dispatch(updateMember(member))
  } catch (error) {
    dispatch(updateError(error))
  }
  dispatch(updateLoading(false))
}

/**
 * Get the member daoVault details *VIEW*
 * @param listedPools @param wallet
 * @returns daoDetails
 */
export const getDaoDetails =
  (listedPools, wallet, rpcUrls) => async (dispatch) => {
    dispatch(updateLoading(true))
    const contract = getDaoVaultContract(null, rpcUrls)
    try {
      let awaitArray = []
      for (let i = 0; i < listedPools.length; i++) {
        if (!wallet.account || listedPools[i].baseAmount <= 0) {
          awaitArray.push('0')
        } else {
          awaitArray.push(
            contract.callStatic.getMemberPoolBalance(
              listedPools[i].address,
              wallet.account,
            ),
          )
        }
      }
      awaitArray = await Promise.all(awaitArray)
      const daoDetails = []
      for (let i = 0; i < awaitArray.length; i++) {
        daoDetails.push({
          tokenAddress: listedPools[i].tokenAddress,
          address: listedPools[i].address,
          staked: awaitArray[i].toString(),
        })
      }
      dispatch(updateDaoDetails(daoDetails))
    } catch (error) {
      dispatch(updateError(error))
    }
    dispatch(updateLoading(false))
  }

/**
 * Get all the dao proposal details
 * @param count @param wallet
 */
export const daoProposalDetails =
  (proposalCount, wallet, rpcUrls) => async (dispatch) => {
    dispatch(updateLoading(true))
    const contract = getDaoContract(null, rpcUrls)
    try {
      if (proposalCount > 0) {
        const awaitArray = []
        for (let i = 1; i <= proposalCount; i++) {
          awaitArray.push(contract.callStatic.getProposalDetails(i))
          awaitArray.push(
            wallet.account
              ? contract.callStatic.memberVoted(i, wallet.account)
              : '0',
          )
        }
        const proposalArray = await Promise.all(awaitArray)
        const proposal = []
        const varCount = 2
        for (
          let i = 0;
          i < proposalArray.length - (varCount - 1);
          i += varCount
        ) {
          proposal.push({
            id: proposalArray[i].id.toString(),
            proposalType: proposalArray[i].proposalType,
            coolOffTime: proposalArray[i].coolOffTime.toString(), // timestamp of coolOff
            finalising: proposalArray[i].finalising,
            finalised: proposalArray[i].finalised,
            param: proposalArray[i].param.toString(),
            proposedAddress: proposalArray[i].proposedAddress.toString(),
            open: proposalArray[i].open,
            startTime: proposalArray[i].startTime.toString(), // timestamp of proposal genesis
            memberVoted: proposalArray[i + 1],
          })
        }
        dispatch(updateProposal(proposal))
      }
    } catch (error) {
      dispatch(updateError(error))
    }
    dispatch(updateLoading(false))
  }

/**
 * Get the daoVault member deposit times
 * @param daoDetails @param wallet
 */
export const daoDepositTimes =
  (daoDetails, wallet, rpcUrls) => async (dispatch) => {
    dispatch(updateLoading(true))
    const contract = getDaoVaultContract(null, rpcUrls)
    try {
      const loopPools = daoDetails.filter((x) => x.staked > 0)
      let awaitArray = []
      for (let i = 0; i < loopPools.length; i++) {
        awaitArray.push(
          contract.callStatic.getMemberPoolDepositTime(
            loopPools[i].address,
            wallet.account,
          ),
        )
      }
      awaitArray = await Promise.all(awaitArray)
      const lastDeposits = []
      for (let i = 0; i < awaitArray.length; i++) {
        lastDeposits.push({
          address: loopPools[i].address,
          lastDeposit: awaitArray[i].toString(),
        })
      }
      dispatch(updateLastDeposits(lastDeposits))
    } catch (error) {
      dispatch(updateError(error))
    }
    dispatch(updateLoading(false))
  }

/**
 * Get the current dao proposal's total weight
 * @param proposalID @param poolDetails
 */
export const proposalWeight =
  (proposalID, poolDetails, rpcUrls) => async (dispatch) => {
    dispatch(updateLoading(true))
    const contract = getDaoContract(null, rpcUrls)
    try {
      let _proposalWeight = BN(0)
      const vaultPools = poolDetails.filter((x) => x.curated && !x.hide)
      if (vaultPools.length > 0) {
        const awaitArray = []
        for (let i = 0; i < vaultPools.length; i++) {
          awaitArray.push(
            contract.callStatic.getProposalAssetVotes(
              proposalID,
              vaultPools[i].address,
            ),
          )
        }
        const votedArray = await Promise.all(awaitArray)
        for (let i = 0; i < votedArray.length; i++) {
          _proposalWeight = _proposalWeight.plus(
            getPoolShareWeight(
              votedArray[i].toString(),
              vaultPools[i].poolUnits,
              vaultPools[i].baseAmount,
            ),
          )
        }
      }
      dispatch(updateProposalWeight(_proposalWeight.toString()))
    } catch (error) {
      dispatch(updateError(error))
    }
    dispatch(updateLoading(false))
  }

/**
 * Deposit / Stake LP Tokens (Lock them in the DAOVault)
 * @param pool @param amount @param wallet
 */
export const daoDeposit =
  (pool, amount, wallet, rpcUrls) => async (dispatch) => {
    dispatch(updateLoading(true))
    const contract = getDaoContract(wallet, rpcUrls)
    try {
      const gPrice = await getProviderGasPrice(rpcUrls)
      let txn = await contract.deposit(pool, amount, { gasPrice: gPrice })
      txn = await parseTxn(txn, 'daoDeposit', rpcUrls)
      dispatch(updateTxn(txn))
    } catch (error) {
      dispatch(updateError(error))
    }
    dispatch(updateLoading(false))
  }

/**
 * Withdraw / Unstake LP Tokens (Unlock them from the DAO)
 * @param pool @param wallet
 */
export const daoWithdraw = (pool, wallet, rpcUrls) => async (dispatch) => {
  dispatch(updateLoading(true))
  const contract = getDaoContract(wallet, rpcUrls)
  try {
    const gPrice = await getProviderGasPrice(rpcUrls)
    let txn = await contract.withdraw(pool, { gasPrice: gPrice })
    txn = await parseTxn(txn, 'daoWithdraw', rpcUrls)
    dispatch(updateTxn(txn))
  } catch (error) {
    dispatch(updateError(error))
  }
}

/**
 * Harvest SPARTA DAOVault rewards
 * @param wallet
 */
export const daoHarvest = (wallet, rpcUrls) => async (dispatch) => {
  dispatch(updateLoading(true))
  const contract = getDaoContract(wallet, rpcUrls)
  try {
    const gPrice = await getProviderGasPrice(rpcUrls)
    let txn = await contract.harvest({ gasPrice: gPrice })
    txn = await parseTxn(txn, 'daoHarvest', rpcUrls)
    dispatch(updateTxn(txn))
  } catch (error) {
    dispatch(updateError(error))
  }
  dispatch(updateLoading(false))
}

/**
 * New action proposal
 * @param typeStr @param wallet
 */
export const newActionProposal =
  (typeStr, wallet, rpcUrls) => async (dispatch) => {
    dispatch(updateLoading(true))
    const contract = getDaoContract(wallet, rpcUrls)
    try {
      const gPrice = await getProviderGasPrice(rpcUrls)
      let txn = await contract.newActionProposal(typeStr, { gasPrice: gPrice })
      txn = await parseTxn(txn, 'newProposal', rpcUrls)
      dispatch(updatePropTxn(txn))
    } catch (error) {
      dispatch(updateError(error))
    }
    dispatch(updateLoading(false))
  }

/**
 * New parameter proposal
 * @param param @param typeStr @param wallet
 */
export const newParamProposal =
  (param, typeStr, wallet, rpcUrls) => async (dispatch) => {
    dispatch(updateLoading(true))
    const contract = getDaoContract(wallet, rpcUrls)
    try {
      const gPrice = await getProviderGasPrice(rpcUrls)
      const ORs = { gasPrice: gPrice }
      let txn = await contract.newParamProposal(param, typeStr, ORs)
      txn = await parseTxn(txn, 'newProposal', rpcUrls)
      dispatch(updatePropTxn(txn))
    } catch (error) {
      dispatch(updateError(error))
    }
    dispatch(updateLoading(false))
  }

/**
 * New address proposal
 * @param proposedAddress @param typeStr @param wallet
 */
export const newAddressProposal =
  (proposedAddress, typeStr, wallet, rpcUrls) => async (dispatch) => {
    dispatch(updateLoading(true))
    const contract = getDaoContract(wallet, rpcUrls)
    try {
      const gPrice = await getProviderGasPrice(rpcUrls)
      const ORs = { gasPrice: gPrice }
      let txn = await contract.newAddressProposal(proposedAddress, typeStr, ORs)
      txn = await parseTxn(txn, 'newProposal', rpcUrls)
      dispatch(updatePropTxn(txn))
    } catch (error) {
      dispatch(updateError(error))
    }
    dispatch(updateLoading(false))
  }

/**
 * New grant proposal
 * @param recipient @param amount @param wallet
 */
export const newGrantProposal =
  (recipient, amount, wallet, rpcUrls) => async (dispatch) => {
    dispatch(updateLoading(true))
    const contract = getDaoContract(wallet, rpcUrls)
    try {
      const gPrice = await getProviderGasPrice(rpcUrls)
      const ORs = { gasPrice: gPrice }
      let txn = await contract.newGrantProposal(recipient, amount, ORs)
      txn = await parseTxn(txn, 'newProposal', rpcUrls)
      dispatch(updatePropTxn(txn))
    } catch (error) {
      dispatch(updateError(error))
    }
    dispatch(updateLoading(false))
  }

/**
 * Vote for the current open proposal
 * @param wallet
 */
export const voteProposal = (wallet, rpcUrls) => async (dispatch) => {
  dispatch(updateLoading(true))
  const contract = getDaoContract(wallet, rpcUrls)
  try {
    const gPrice = await getProviderGasPrice(rpcUrls)
    let txn = await contract.voteProposal({ gasPrice: gPrice })
    txn = await parseTxn(txn, 'voteProposal', rpcUrls)
    dispatch(updatePropTxn(txn))
  } catch (error) {
    dispatch(updateError(error))
  }
  dispatch(updateLoading(false))
}

/**
 * Remove your vote from the current open proposal
 * @param wallet
 */
export const removeVote = (wallet, rpcUrls) => async (dispatch) => {
  dispatch(updateLoading(true))
  const contract = getDaoContract(wallet, rpcUrls)
  try {
    const gPrice = await getProviderGasPrice(rpcUrls)
    let txn = await contract.unvoteProposal({ gasPrice: gPrice })
    txn = await parseTxn(txn, 'removeVoteProposal', rpcUrls)
    dispatch(updatePropTxn(txn))
  } catch (error) {
    dispatch(updateError(error))
  }
  dispatch(updateLoading(false))
}

/**
 * Poll vote weights and check if proposal is ready to go into finalisation stage
 * @param wallet
 */
export const pollVotes = (wallet, rpcUrls) => async (dispatch) => {
  dispatch(updateLoading(true))
  const contract = getDaoContract(wallet, rpcUrls)
  try {
    const gPrice = await getProviderGasPrice(rpcUrls)
    let txn = await contract.pollVotes({ gasPrice: gPrice })
    txn = await parseTxn(txn, 'pollVotes', rpcUrls)
    dispatch(updatePropTxn(txn))
  } catch (error) {
    dispatch(updateError(error))
  }
  dispatch(updateLoading(false))
}

/**
 * Cancel the current open proposal
 * @param wallet
 */
export const cancelProposal = (wallet, rpcUrls) => async (dispatch) => {
  dispatch(updateLoading(true))
  const contract = getDaoContract(wallet, rpcUrls)
  try {
    const gPrice = await getProviderGasPrice(rpcUrls)
    let txn = await contract.cancelProposal({ gasPrice: gPrice })
    txn = await parseTxn(txn, 'cancelProposal', rpcUrls)
    dispatch(updatePropTxn(txn))
  } catch (error) {
    dispatch(updateError(error))
  }
  dispatch(updateLoading(false))
}

/**
 * Finalise a proposal
 * @param wallet
 */
export const finaliseProposal = (wallet, rpcUrls) => async (dispatch) => {
  dispatch(updateLoading(true))
  const contract = getDaoContract(wallet, rpcUrls)
  try {
    const gPrice = await getProviderGasPrice(rpcUrls)
    let txn = await contract.finaliseProposal({ gasPrice: gPrice })
    txn = await parseTxn(txn, 'finaliseProposal', rpcUrls)
    dispatch(updatePropTxn(txn))
  } catch (error) {
    dispatch(updateError(error))
  }
  dispatch(updateLoading(false))
}

export default daoSlice.reducer
