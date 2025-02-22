/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  FormControl,
  InputGroup,
  Nav,
  Row,
  Popover,
  OverlayTrigger,
} from 'react-bootstrap'
import { useWeb3React } from '@web3-react/core'
import AssetSelect from '../../components/AssetSelect/index'
import { usePool } from '../../store/pool'
import {
  formatShortString,
  getAddresses,
  getItemFromArray,
  oneWeek,
} from '../../utils/web3'
import {
  BN,
  convertFromWei,
  convertToWei,
  formatFromUnits,
  formatFromWei,
} from '../../utils/bigNumber'
import Metrics from './Components/Metrics'
import { useWeb3 } from '../../store/web3'
import { addLiquidity, addLiquiditySingle } from '../../store/router'
import Approval from '../../components/Approval/index'
import HelmetLoading from '../../components/Spinner/index'
import { useSparta } from '../../store/sparta'
import { Icon } from '../../components/Icons/index'
import { balanceWidths } from './Components/Utils'
import NewPool from '../Pools/NewPool'
import Share from '../../components/Share/index'
import {
  calcLiqValue,
  calcSpotValueInBase,
  calcSpotValueInToken,
} from '../../utils/math/utils'
import { getTimeUntil } from '../../utils/math/nonContract'
import { addLiq, addLiqAsym } from '../../utils/math/router'
import { Tooltip } from '../../components/Tooltip/index'
import ShareLink from '../../components/Share/ShareLink'
import { getExplorerContract } from '../../utils/extCalls'

const LiqAdd = () => {
  const isLightMode = window.localStorage.getItem('theme')
  const { t } = useTranslation()
  const wallet = useWeb3React()
  const dispatch = useDispatch()
  const web3 = useWeb3()
  const pool = usePool()
  const addr = getAddresses()
  const sparta = useSparta()
  const location = useLocation()

  const [showWalletWarning1, setShowWalletWarning1] = useState(false)
  const [showWalletWarning2, setShowWalletWarning2] = useState(false)
  const [showWalletWarning3, setShowWalletWarning3] = useState(false)
  const [hasFocus, setHasFocus] = useState(true)
  const [txnLoading, setTxnLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('addTab1')
  const [confirm, setConfirm] = useState(false)
  const [confirmFreeze, setConfirmFreeze] = useState(false)
  const [assetAdd1, setAssetAdd1] = useState('...')
  const [assetAdd2, setAssetAdd2] = useState('...')
  const [poolAdd1, setPoolAdd1] = useState('...')
  const [outputLp, setOutputLp] = useState('0.00')
  const [assetParam1, setAssetParam1] = useState(
    new URLSearchParams(location.search).get(`asset1`),
  )

  window.addEventListener('focus', () => {
    setHasFocus(true)
  })

  window.addEventListener('blur', () => {
    setHasFocus(false)
  })

  const tryParse = (data) => {
    try {
      return JSON.parse(data)
    } catch (e) {
      return pool.poolDetails[0]
    }
  }

  useEffect(() => {
    const { poolDetails } = pool
    const getAssetDetails = () => {
      if (hasFocus) {
        if (poolDetails.length > 0 && activeTab === 'addTab1') {
          window.localStorage.setItem('assetType1', 'token')
          window.localStorage.setItem('assetType2', 'token')
          window.localStorage.setItem('assetType3', 'pool')

          let asset1 = tryParse(window.localStorage.getItem('assetSelected1'))
          let asset2 = tryParse(window.localStorage.getItem('assetSelected2'))
          let asset3 = tryParse(window.localStorage.getItem('assetSelected3'))

          if (poolDetails.find((asset) => asset.tokenAddress === assetParam1)) {
            ;[asset1] = poolDetails.filter(
              (asset) => asset.tokenAddress === assetParam1,
            )
            setAssetParam1('')
          }
          asset1 =
            asset1 &&
            asset1.address !== '' &&
            pool.poolDetails.find((x) => x.tokenAddress === asset1.tokenAddress)
              ? asset1
              : { tokenAddress: addr.bnb }
          asset2 = { tokenAddress: addr.spartav2 }
          asset3 = asset1.address !== '' ? asset1 : { tokenAddress: addr.bnb }

          asset1 = getItemFromArray(asset1, pool.poolDetails)
          asset2 = getItemFromArray(asset2, pool.poolDetails)
          asset3 = getItemFromArray(asset3, pool.poolDetails)

          setAssetAdd1(asset1)
          setAssetAdd2(asset2)
          setPoolAdd1(asset3)

          window.localStorage.setItem('assetSelected1', JSON.stringify(asset1))
          window.localStorage.setItem('assetSelected2', JSON.stringify(asset2))
          window.localStorage.setItem('assetSelected3', JSON.stringify(asset3))
        } else if (poolDetails && activeTab === 'addTab2') {
          window.localStorage.setItem('assetType1', 'token')
          window.localStorage.setItem('assetType3', 'pool')

          let asset1 = tryParse(window.localStorage.getItem('assetSelected1'))
          let asset3 = tryParse(window.localStorage.getItem('assetSelected3'))

          asset1 =
            asset1 &&
            pool.poolDetails.find((x) => x.tokenAddress === asset1.tokenAddress)
              ? asset1
              : { tokenAddress: addr.bnb }
          asset3 = asset1.address !== '' ? asset1 : asset3

          asset1 = getItemFromArray(asset1, pool.poolDetails)
          asset3 = getItemFromArray(asset3, pool.poolDetails)
          asset1 = asset1.hide
            ? getItemFromArray(addr.bnb, poolDetails)
            : asset1
          asset3 = asset3.hide
            ? getItemFromArray(addr.bnb, poolDetails)
            : asset3

          setAssetAdd1(asset1)
          setPoolAdd1(asset3)

          window.localStorage.setItem('assetSelected1', JSON.stringify(asset1))
          window.localStorage.setItem('assetSelected3', JSON.stringify(asset3))
        }
      }
    }

    getAssetDetails()
    balanceWidths()
  }, [
    pool.poolDetails,
    window.localStorage.getItem('assetSelected1'),
    window.localStorage.getItem('assetSelected2'),
    window.localStorage.getItem('assetSelected3'),
    activeTab,
    hasFocus,
  ])

  const getToken = (tokenAddress) =>
    pool.tokenDetails.filter((i) => i.address === tokenAddress)[0]

  const addInput1 = document.getElementById('addInput1')
  const addInput2 = document.getElementById('addInput2')
  const addInput3 = document.getElementById('addInput3')

  const handleConfClear = () => {
    setConfirm(false)
    setConfirmFreeze(false)
  }

  const clearInputs = (focusAfter) => {
    handleConfClear()
    setOutputLp('0.00')
    if (addInput1) {
      addInput1.value = ''
    }
    if (addInput2) {
      addInput2.value = ''
    }
    if (addInput3) {
      addInput3.value = ''
    }
    if (focusAfter === 1) {
      addInput1.focus()
    }
    if (focusAfter === 2) {
      addInput2.focus()
    }
  }

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab)
    clearInputs(1)
  }

  const getBalance = (asset) => {
    if (asset === 1) {
      return getToken(assetAdd1?.tokenAddress)?.balance
    }
    if (asset === 2) {
      return getToken(assetAdd2?.tokenAddress)?.balance
    }
    return poolAdd1?.balance
  }

  const getTimeNew = () => {
    const timeStamp = BN(poolAdd1?.genesis).plus(oneWeek)
    return getTimeUntil(timeStamp, t)
  }

  //= =================================================================================//
  // Get txn info

  /**
   * Get liqAdd txn details
   * @returns [outputLP, slipRevert, capRevert]
   */
  const getAddLiq = () => {
    if (addInput1 && activeTab === 'addTab1') {
      const [outputLP, slipRevert, capRevert] = addLiq(
        convertToWei(addInput1.value),
        assetAdd1,
        sparta.globalDetails.feeOnTransfer,
        convertToWei(addInput2.value),
      )
      return [outputLP, slipRevert, capRevert]
    }
    return ['0.00', '0.00', false, false]
  }

  /**
   * Get liqAddAsym txn details
   * @returns [unitsLP, swapFee, slipRevert, capRevert]
   */
  const getAddLiqAsym = () => {
    if (addInput1 && assetAdd1 && activeTab === 'addTab2') {
      const fromBase = assetAdd1.tokenAddress === addr.spartav2
      const [unitsLP, swapFee, slipRevert, capRevert] = addLiqAsym(
        convertToWei(addInput1.value),
        poolAdd1,
        fromBase,
        sparta.globalDetails.feeOnTransfer,
      )
      return [unitsLP, swapFee, slipRevert, capRevert]
    }
    return ['0.00', '0.00', false, false]
  }

  const getInput1ValueUSD = () => {
    if (assetAdd1?.tokenAddress !== addr.spartav2 && addInput1?.value) {
      return calcSpotValueInBase(convertToWei(addInput1.value), poolAdd1).times(
        web3.spartaPrice,
      )
    }
    if (assetAdd1?.tokenAddress === addr.spartav2 && addInput1?.value) {
      return BN(convertToWei(addInput1.value)).times(web3.spartaPrice)
    }
    return '0.00'
  }

  const getInput2ValueUSD = () => {
    if (assetAdd2 && addInput2?.value) {
      return BN(convertToWei(addInput2.value)).times(web3.spartaPrice)
    }
    return '0.00'
  }

  const getLpValueBase = () => {
    if (assetAdd1 && addInput1?.value) {
      return calcLiqValue(outputLp, poolAdd1)[0]
    }
    return '0.00'
  }

  const getLpValueToken = () => {
    if (assetAdd1 && addInput1?.value) {
      return calcLiqValue(outputLp, poolAdd1)[1]
    }
    return '0.00'
  }

  const getLpValueUSD = () => {
    if (assetAdd1 && addInput1?.value) {
      return BN(calcSpotValueInBase(getLpValueToken(), poolAdd1))
        .plus(getLpValueBase())
        .times(web3.spartaPrice)
    }
    return '0.00'
  }

  const getRevenue = () => {
    let result = '0.00'
    if (activeTab === 'addTab2') {
      result = BN(getAddLiqAsym()[1])
    }
    result = result > 0 ? result : '0.00'
    return result
  }

  // ~0.00288 BNB gas (addLiqSingle) on TN || ~0.0015 BNB on MN
  const estMaxGas = '1500000000000000'
  const enoughGas = () => {
    const bal = getToken(addr.bnb).balance
    if (BN(bal).isLessThan(estMaxGas)) {
      return false
    }
    return true
  }

  const checkValid = () => {
    if (!wallet.account) {
      return [false, t('checkWallet')]
    }
    if (addInput1?.value <= 0) {
      return [false, t('checkInput')]
    }
    if (!enoughGas()) {
      return [false, t('checkBnbGas')]
    }
    if (
      BN(convertToWei(addInput1?.value)).isGreaterThan(getBalance(1)) ||
      BN(convertToWei(addInput2?.value)).isGreaterThan(getBalance(2))
    ) {
      return [false, t('checkBalance')]
    }
    if (getAddLiqAsym()[2]) {
      return [false, t('slipTooHigh')]
    }
    if (getAddLiqAsym()[3] || getAddLiq()[2]) {
      return [false, t('poolAtCapacity')]
    }
    if (poolAdd1.newPool && !confirm) {
      return [false, t('confirmLockup')]
    }
    if (poolAdd1.curated && poolAdd1.frozen && !confirmFreeze) {
      return [false, t('confirmFreeze')]
    }
    if (activeTab === 'addTab1') {
      return [true, t('addBoth')]
    }
    return [true, t('addSingle')]
  }

  //= =================================================================================//
  // General Functions

  const handleInputChange = () => {
    if (activeTab === 'addTab1' && addInput1 && addInput2) {
      if (addInput2 !== document.activeElement && addInput1.value) {
        addInput2.value = calcSpotValueInBase(addInput1.value, poolAdd1)
        setOutputLp(getAddLiq()[0])
      } else if (addInput1 !== document.activeElement && addInput2.value) {
        addInput1.value = calcSpotValueInToken(
          addInput2.value > 0 ? addInput2.value : '0.00',
          poolAdd1,
        )
        setOutputLp(getAddLiq()[0])
      }
    } else if (activeTab === 'addTab2' && addInput1 && addInput3) {
      if (addInput1.value) {
        setOutputLp(getAddLiqAsym()[0])
        addInput3.value = convertFromWei(getAddLiqAsym()[0])
      }
    }
  }

  const getRateSlip = () => {
    if (assetAdd1 && addInput1?.value > 0) {
      return BN(getLpValueUSD())
        .div(getInput1ValueUSD())
        .minus('1')
        .times('100')
    }
    return '0.00'
  }

  useEffect(() => {
    handleInputChange()
  }, [
    addInput1?.value,
    addInput2?.value,
    assetAdd1,
    assetAdd2,
    poolAdd1,
    activeTab,
  ])

  const handleAddLiq = async () => {
    if (
      assetAdd1?.tokenAddress === addr.bnb ||
      assetAdd1?.tokenAddress === addr.wbnb
    ) {
      const balance = getToken(addr.bnb)?.balance
      if (
        BN(balance)
          .minus(convertToWei(addInput1?.value))
          .isLessThan('5000000000000000')
      ) {
        addInput1.value = convertFromWei(BN(balance).minus('5000000000000000'))
      }
    }
    setTxnLoading(true)
    if (activeTab === 'addTab1') {
      await dispatch(
        addLiquidity(
          convertToWei(addInput1.value),
          convertToWei(addInput2.value),
          assetAdd1.tokenAddress,
          wallet,
          web3.rpcs,
        ),
      )
    } else {
      await dispatch(
        addLiquiditySingle(
          convertToWei(addInput1.value),
          assetAdd1.tokenAddress === addr.spartav2,
          poolAdd1.tokenAddress,
          wallet,
          web3.rpcs,
        ),
      )
    }
    setTxnLoading(false)
    clearInputs()
  }

  const checkWallet = (id) => {
    if (!wallet.account) {
      if (id === 1) {
        setShowWalletWarning1(!showWalletWarning1)
      }
      if (id === 2) {
        setShowWalletWarning2(!showWalletWarning2)
      }
      if (id === 3) {
        setShowWalletWarning3(!showWalletWarning3)
      }
    }
  }

  return (
    <Row>
      <Col xs="auto">
        <Card xs="auto" className="card-480" style={{ minHeight: '560px' }}>
          <Card.Header className="p-0 border-0 mb-3">
            <Row className="px-4 pt-3 pb-1">
              <Col xs="auto">
                {t('liquidity')}
                {pool.poolDetails.length > 0 && <Share />}
              </Col>
              <Col className="text-end">
                <NewPool />
              </Col>
            </Row>
            <Nav activeKey={activeTab} fill>
              <Nav.Item key="addTab1">
                <Nav.Link
                  eventKey="addTab1"
                  onClick={() => {
                    toggle('addTab1')
                  }}
                >
                  {t('addBoth')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item key="addTab2">
                <Nav.Link
                  eventKey="addTab2"
                  onClick={() => {
                    toggle('addTab2')
                  }}
                >
                  {t('addSingle')}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          {pool.poolDetails.filter((x) => !x.hide).length > 1 ? (
            <>
              <Card.Body>
                <Row>
                  <Col xs="12" className="px-1 px-sm-3">
                    <Card className="card-alt">
                      <Card.Body>
                        <Row className="">
                          <Col xs="auto" className="text-sm-label">
                            {t('add')}
                          </Col>
                          <Col
                            className="text-sm-label float-end text-end"
                            role="button"
                            aria-hidden="true"
                            onClick={() => {
                              addInput1.value = convertFromWei(getBalance(1))
                            }}
                          >
                            <Badge bg="primary" className="me-1">
                              MAX
                            </Badge>
                            {t('balance')}:{' '}
                            {pool.poolDetails && (
                              <OverlayTrigger
                                placement="auto"
                                overlay={Tooltip(
                                  t,
                                  formatFromWei(getBalance(1), 18),
                                )}
                              >
                                <span role="button">
                                  {formatFromWei(getBalance(1))}
                                </span>
                              </OverlayTrigger>
                            )}{' '}
                          </Col>
                        </Row>

                        <Row className="my-1">
                          <Col>
                            <InputGroup className="">
                              <InputGroup.Text id="assetSelect1">
                                <AssetSelect
                                  priority="1"
                                  filter={['token']}
                                  blackList={
                                    activeTab === 'addTab1'
                                      ? [addr.spartav1, addr.spartav2]
                                      : []
                                  }
                                  onClick={handleConfClear}
                                />
                              </InputGroup.Text>
                              <OverlayTrigger
                                placement="auto"
                                onToggle={() => checkWallet(1)}
                                show={showWalletWarning1}
                                trigger={['focus']}
                                overlay={
                                  <Popover>
                                    <Popover.Header />
                                    <Popover.Body>
                                      {t('connectWalletFirst')}
                                    </Popover.Body>
                                  </Popover>
                                }
                              >
                                <FormControl
                                  className="text-end ms-0"
                                  type="number"
                                  min="0"
                                  placeholder={`${t('add')}...`}
                                  id="addInput1"
                                  autoComplete="off"
                                  autoCorrect="off"
                                />
                              </OverlayTrigger>

                              <InputGroup.Text
                                role="button"
                                tabIndex={-1}
                                onKeyPress={() => clearInputs(1)}
                                onClick={() => clearInputs(1)}
                              >
                                <Icon icon="close" size="10" fill="grey" />
                              </InputGroup.Text>
                            </InputGroup>
                            <Row className="text-sm-label pt-1">
                              <Col>
                                {formatShortString(assetAdd1?.tokenAddress)}
                                <ShareLink url={assetAdd1?.tokenAddress}>
                                  <Icon
                                    icon="copy"
                                    size="16"
                                    className="ms-1 mb-1"
                                  />
                                </ShareLink>
                                <a
                                  href={getExplorerContract(
                                    assetAdd1?.tokenAddress,
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Icon
                                    icon="scan"
                                    size="12"
                                    className="ms-1 mb-1"
                                    fill="rgb(170, 205, 255)"
                                  />
                                </a>
                              </Col>
                              <Col className="text-end">
                                ~$
                                {addInput1?.value
                                  ? formatFromWei(getInput1ValueUSD(), 2)
                                  : '0.00'}
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    <Row style={{ height: '2px' }}>
                      <Col xs="auto" className="mx-auto">
                        {activeTab === 'addTab1' && (
                          <Icon
                            icon="plus"
                            size="35"
                            stroke="white"
                            className="position-relative bg-primary rounded-circle px-1"
                            style={{
                              top: '-20px',
                              zIndex: '1000',
                            }}
                          />
                        )}
                        {activeTab === 'addTab2' && (
                          <Icon
                            icon="swapAdd"
                            size="35"
                            fill="#fb2715"
                            className="mx-auto position-relative"
                            style={{
                              height: '35px',
                              top: '-20px',
                              zIndex: '1000',
                            }}
                          />
                        )}
                      </Col>
                    </Row>

                    {activeTab === 'addTab1' && (
                      <Card className="card-alt">
                        <Card.Body>
                          <Row className="">
                            <Col xs="auto" className="text-sm-label">
                              {t('add')} (~)
                            </Col>
                            <Col
                              className="text-sm-label float-end text-end"
                              role="button"
                              aria-hidden="true"
                              onClick={() => {
                                addInput2.focus()
                                addInput2.value = convertFromWei(getBalance(2))
                              }}
                            >
                              <Badge bg="primary" className="me-1">
                                MAX
                              </Badge>
                              {t('balance')}:{' '}
                              {pool.poolDetails && (
                                <OverlayTrigger
                                  placement="auto"
                                  overlay={Tooltip(
                                    t,
                                    formatFromWei(getBalance(2), 18),
                                  )}
                                >
                                  <span role="button">
                                    {formatFromWei(getBalance(2))}
                                  </span>
                                </OverlayTrigger>
                              )}
                            </Col>
                          </Row>

                          <Row className="my-1">
                            <Col>
                              <InputGroup className="">
                                <InputGroup.Text id="assetSelect2">
                                  <AssetSelect
                                    priority="2"
                                    filter={['token']}
                                    whiteList={[addr.spartav2]}
                                    disabled={activeTab === 'addTab1'}
                                    onClick={handleConfClear}
                                  />
                                </InputGroup.Text>
                                <OverlayTrigger
                                  placement="auto"
                                  onToggle={() => checkWallet(2)}
                                  show={showWalletWarning2}
                                  trigger={['focus']}
                                  overlay={
                                    <Popover>
                                      <Popover.Header />
                                      <Popover.Body>
                                        {t('connectWalletFirst')}
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <FormControl
                                    className="text-end ms-0"
                                    type="number"
                                    min="0"
                                    placeholder={`${t('add')}...`}
                                    id="addInput2"
                                    autoComplete="off"
                                    autoCorrect="off"
                                  />
                                </OverlayTrigger>

                                <InputGroup.Text
                                  role="button"
                                  tabIndex={-1}
                                  onKeyPress={() => clearInputs(2)}
                                  onClick={() => clearInputs(2)}
                                >
                                  <Icon icon="close" size="10" fill="grey" />
                                </InputGroup.Text>
                              </InputGroup>

                              <Row className="text-sm-label pt-1">
                                <Col>
                                  {formatShortString(assetAdd2?.tokenAddress)}
                                  <ShareLink url={assetAdd2?.tokenAddress}>
                                    <Icon
                                      icon="copy"
                                      size="16"
                                      className="ms-1 mb-1"
                                    />
                                  </ShareLink>
                                  <a
                                    href={getExplorerContract(
                                      assetAdd2?.tokenAddress,
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Icon
                                      icon="scan"
                                      size="12"
                                      className="ms-1 mb-1"
                                      fill="rgb(170, 205, 255)"
                                    />
                                  </a>
                                </Col>
                                <Col className="text-end">
                                  ~$
                                  {addInput2?.value
                                    ? formatFromWei(getInput2ValueUSD(), 2)
                                    : '0.00'}
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}

                    {activeTab === 'addTab2' && (
                      <Card className="card-alt">
                        <Card.Body>
                          <Row className="">
                            <Col xs="auto" className="text-sm-label">
                              {t('receive')}
                            </Col>
                            <Col className="text-sm-label float-end text-end">
                              {t('balance')}:{' '}
                              {pool.poolDetails && formatFromWei(getBalance(3))}
                            </Col>
                          </Row>

                          <Row className="my-1">
                            <Col>
                              <InputGroup className="">
                                <InputGroup.Text id="assetSelect3">
                                  <AssetSelect
                                    priority="3"
                                    filter={['pool']}
                                    disabled={
                                      activeTab === 'addTab1' ||
                                      assetAdd1.tokenAddress !== addr.spartav2
                                    }
                                    onClick={handleConfClear}
                                  />
                                </InputGroup.Text>
                                <FormControl
                                  className="text-end ms-0"
                                  type="number"
                                  min="0"
                                  placeholder="0.00"
                                  id="addInput3"
                                  disabled
                                />
                              </InputGroup>

                              <Row className="text-sm-label pt-1">
                                <Col>
                                  {formatShortString(poolAdd1?.address)}
                                  <ShareLink url={poolAdd1?.address}>
                                    <Icon
                                      icon="copy"
                                      size="16"
                                      className="ms-1 mb-1"
                                    />
                                  </ShareLink>
                                  <a
                                    href={getExplorerContract(
                                      poolAdd1?.address,
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Icon
                                      icon="scan"
                                      size="12"
                                      className="ms-1 mb-1"
                                      fill="rgb(170, 205, 255)"
                                    />
                                  </a>
                                </Col>
                                <Col className="text-end">
                                  ~$
                                  {addInput1?.value
                                    ? formatFromWei(getLpValueUSD(), 2)
                                    : '0.00'}
                                  {' ('}
                                  {addInput1?.value
                                    ? formatFromUnits(getRateSlip(), 2)
                                    : '0.00'}
                                  {'%)'}
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}

                    {pool.poolDetails && (
                      <>
                        <Row className="mb-2 mt-3">
                          <Col xs="auto">
                            <span className="text-card">{t('add')}</span>
                          </Col>
                          <Col className="text-end">
                            <span className="text-card">
                              {addInput1?.value > 0
                                ? formatFromUnits(addInput1?.value, 6)
                                : '0.00'}{' '}
                              {getToken(assetAdd1.tokenAddress)?.symbol}
                            </span>
                          </Col>
                        </Row>
                        {activeTab === 'addTab1' && (
                          <Row className="mb-2">
                            <Col xs="auto">
                              <span className="text-card">{t('add')}</span>
                            </Col>
                            <Col className="text-end">
                              <span className="text-card">
                                ~
                                {addInput2?.value > 0
                                  ? formatFromUnits(addInput2?.value, 6)
                                  : '0.00'}{' '}
                                <span className="">SPARTA</span>
                              </span>
                            </Col>
                          </Row>
                        )}
                        {activeTab === 'addTab2' && (
                          <>
                            <Row className="mb-2">
                              <Col xs="auto" className="title-card">
                                <span className="text-card">{t('fee')}</span>
                              </Col>
                              <Col className="text-end">
                                <span className="text-card">
                                  {getAddLiqAsym()[1] > 0
                                    ? formatFromWei(getAddLiqAsym()[1], 4)
                                    : '0.00'}{' '}
                                  <span className="">SPARTA</span>
                                </span>
                              </Col>
                            </Row>
                            <Row className="mb-2">
                              <Col xs="auto">
                                <div className="text-card">{t('revenue')}</div>
                              </Col>
                              <Col className="text-end">
                                <div className="text-card">
                                  {formatFromWei(getRevenue(), 6)} SPARTA
                                  <OverlayTrigger
                                    placement="auto"
                                    overlay={Tooltip(t, 'swapRevInfo')}
                                  >
                                    <span role="button">
                                      <Icon
                                        icon="info"
                                        className="ms-1 mb-1"
                                        size="17"
                                        fill={isLightMode ? 'black' : 'white'}
                                      />
                                    </span>
                                  </OverlayTrigger>
                                </div>
                              </Col>
                            </Row>
                          </>
                        )}
                        <Row className="">
                          <Col xs="auto" className="title-card">
                            <span className="subtitle-card">
                              {t('receive')}
                            </span>
                          </Col>
                          <Col className="text-end">
                            <span className="subtitle-card">
                              ~
                              {outputLp > 0
                                ? formatFromWei(outputLp, 6)
                                : '0.00'}{' '}
                              <span className="output-card">
                                {getToken(poolAdd1.tokenAddress)?.symbol}p
                              </span>
                            </span>
                          </Col>
                        </Row>
                      </>
                    )}
                    {!pool.poolDetails && (
                      <HelmetLoading height={150} width={150} />
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </>
          ) : (
            <Card.Body className="output-card">
              No pools are currently listed
            </Card.Body>
          )}

          <Card.Footer>
            {poolAdd1.newPool && (
              <Row>
                <Col>
                  <div className="output-card text-center">
                    {t('newPoolConfirmInfo')}
                  </div>
                  <Form className="my-2 text-center">
                    <span className="output-card">
                      {`Confirm; your liquidity will be locked for ${
                        getTimeNew()[0]
                      }${getTimeNew()[1]}`}
                      <Form.Check
                        type="switch"
                        id="confirmLockout"
                        className="ms-2 d-inline-flex"
                        checked={confirm}
                        onChange={() => setConfirm(!confirm)}
                      />
                    </span>
                  </Form>
                </Col>
              </Row>
            )}
            {poolAdd1.frozen && (
              <Row>
                <Col>
                  <div className="output-card text-center">
                    {t('poolFrozenConfirm')}
                  </div>
                  <Form className="my-2 text-center">
                    <span className="output-card">
                      {t('poolFrozenConfirmShort')}
                      <Form.Check
                        type="switch"
                        id="confirmFrozen"
                        className="ms-2 d-inline-flex"
                        checked={confirmFreeze}
                        onChange={() => setConfirmFreeze(!confirmFreeze)}
                      />
                    </span>
                  </Form>
                </Col>
              </Row>
            )}
            <Row className="text-center">
              {assetAdd1?.tokenAddress &&
                assetAdd1?.tokenAddress !== addr.bnb &&
                wallet?.account &&
                addInput1?.value && (
                  <Approval
                    tokenAddress={assetAdd1?.tokenAddress}
                    symbol={getToken(assetAdd1.tokenAddress)?.symbol}
                    walletAddress={wallet?.account}
                    contractAddress={addr.router}
                    txnAmount={convertToWei(addInput1?.value)}
                    assetNumber="1"
                  />
                )}
              <Col xs="12" className="hide-if-siblings">
                <Button
                  className="w-100"
                  onClick={() => handleAddLiq()}
                  disabled={!checkValid()[0]}
                >
                  {checkValid()[1]}
                  {txnLoading && (
                    <Icon icon="cycle" size="20" className="anim-spin ms-1" />
                  )}
                </Button>
              </Col>
              {assetAdd2?.tokenAddress &&
                assetAdd2?.tokenAddress !== addr.bnb &&
                wallet?.account &&
                addInput2?.value && (
                  <Approval
                    tokenAddress={assetAdd2?.tokenAddress}
                    symbol={getToken(assetAdd2.tokenAddress)?.symbol}
                    walletAddress={wallet?.account}
                    contractAddress={addr.router}
                    txnAmount={convertToWei(addInput2?.value)}
                    assetNumber="2"
                  />
                )}
            </Row>
          </Card.Footer>
        </Card>
      </Col>
      {pool.poolDetails && (
        <Col xs="auto">
          <Metrics assetSwap={poolAdd1} />
        </Col>
      )}
    </Row>
  )
}

export default LiqAdd
