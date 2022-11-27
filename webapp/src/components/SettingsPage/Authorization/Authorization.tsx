import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { ChainCheck, TransactionLink } from 'decentraland-dapps/dist/containers'
import { getChainConfiguration } from 'decentraland-dapps/dist/lib/chainConfiguration'
import { Radio, RadioProps } from 'decentraland-ui/dist/components/Radio/Radio'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import Form from 'semantic-ui-react/dist/commonjs/collections/Form'
import { locations } from '../../../modules/routing/locations'
import { isAuthorized } from './utils'
import { Props } from './Authorization.types'
import './Authorization.css'

const Authorization = (props: Props) => {
  const {
    authorization,
    authorizations,
    isLoading,
    onGrant,
    onRevoke,
    getContract
  } = props

  const handleOnChange = useCallback(
    (isChecked: boolean) =>
      isChecked ? onGrant(authorization) : onRevoke(authorization),
    [authorization, onGrant, onRevoke]
  )

  const { contractAddress, authorizedAddress } = authorization

  const contract = getContract({ address: authorizedAddress })
  const token = getContract({ address: contractAddress })

  if (!contract || !token) {
    return null
  }

  const { network } = getChainConfiguration(token.chainId)

  return (
    <div className="Authorization">
      <Form.Field
        key={contractAddress}
        className={isLoading ? 'is-pending' : ''}
      >
        <Popup
          content={t('settings_page.pending_tx')}
          position="top left"
          trigger={
            <Link to={locations.activity()} className="loader-tooltip">
              <Loader active size="mini" />
            </Link>
          }
        />
        <ChainCheck chainId={authorization.chainId}>
          {isEnabled => (
            <Radio
              checked={isAuthorized(authorization, authorizations)}
              label={token.name}
              disabled={!isEnabled}
              onClick={(_, props: RadioProps) =>
                handleOnChange(!!props.checked)
              }
            />
          )}
        </ChainCheck>
        <div className="radio-description secondary-text">
          <T
            id="authorization.authorize"
            values={{
              contract_link: (
                <TransactionLink
                  address={authorizedAddress}
                  txHash=""
                  chainId={authorization.chainId}
                >
                  {contract.label || contract.name}
                </TransactionLink>
              ),
              symbol: token.name,
              network: t(`networks.${network.toLowerCase()}`)
            }}
          />
        </div>
      </Form.Field>
    </div>
  )
}

export default React.memo(Authorization)
