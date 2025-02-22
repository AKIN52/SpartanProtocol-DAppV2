import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Row, Col, Tabs, Tab } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import DaoVault from './DaoVault'
import SynthVault from './SynthVault'
import BondVault from './BondVault'
import { getNetwork, tempChains } from '../../utils/web3'
import WrongNetwork from '../../components/WrongNetwork/index'
import { usePool } from '../../store/pool'
import HelmetLoading from '../../components/Spinner/index'

const Vaults = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const [mode, setMode] = useState('Dao')
  const pool = usePool()
  const [network, setnetwork] = useState(getNetwork())
  const [trigger0, settrigger0] = useState(0)
  const [tabParam1] = useState(new URLSearchParams(location.search).get(`tab`))

  const getNet = () => {
    setnetwork(getNetwork())
  }

  useEffect(() => {
    if (tabParam1) setMode(tabParam1)
  }, [tabParam1])

  useEffect(() => {
    if (trigger0 === 0) {
      getNet()
    }
    const timer = setTimeout(() => {
      getNet()
      settrigger0(trigger0 + 1)
    }, 2000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger0])

  return (
    <>
      <div className="content">
        {tempChains.includes(network.chainId) && (
          <>
            <Row className="row-480">
              <Col>
                <Tabs
                  activeKey={mode}
                  onSelect={(k) => setMode(k)}
                  className="mb-3 card-480"
                >
                  <Tab eventKey="Dao" title={t('daoVault')}>
                    {pool.poolDetails.length > 0 && mode === 'Dao' && (
                      <DaoVault />
                    )}
                  </Tab>
                  <Tab eventKey="Synth" title={t('synthVault')}>
                    {pool.poolDetails.length > 0 && mode === 'Synth' && (
                      <SynthVault />
                    )}
                  </Tab>
                  <Tab eventKey="Bond" title={t('bondVault')}>
                    {pool.poolDetails.length > 0 && mode === 'Bond' && (
                      <BondVault />
                    )}
                  </Tab>
                </Tabs>
              </Col>
            </Row>
            <Row className="row-480">
              <Col className="card-480">
                {pool.poolDetails.length <= 0 && (
                  <HelmetLoading height={150} width={150} />
                )}
              </Col>
            </Row>
          </>
        )}
        {!tempChains.includes(network.chainId) && <WrongNetwork />}
      </div>
    </>
  )
}

export default Vaults
