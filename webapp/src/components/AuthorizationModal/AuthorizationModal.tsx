import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ethers } from 'ethers'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { ModalNavigation } from 'decentraland-ui/dist/components/ModalNavigation/ModalNavigation'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'

import { locations } from '../../modules/routing/locations'
import { isStubMaticCollectionContract } from '../../modules/contract/utils'
import ERC721ABI from '../../contracts/ERC721.json'
import { isAuthorized } from '../SettingsPage/Authorization/utils'
import { Authorization } from '../SettingsPage/Authorization'
import { Props } from './AuthorizationModal.types'

import './AuthorizationModal.css'

const AuthorizationModal = (props: Props) => {
  const {
    open,
    authorization,
    authorizations,
    isLoading,
    isAuthorizing,
    getContract,
    onCancel,
    onProceed,
    onFetchAuthorizations,
    onUpsertContracts
  } = props

  const isMobile = useMobileMediaQuery()

  const contract = getContract({
    address: authorization.authorizedAddress
  })

  const token = getContract({
    address: authorization.contractAddress
  })

  const hasFetchedAuthorizations = useRef(false)
  const hasFetchedContractName = useRef(false)

  // Fetch authorizations only once when this component is rendered.
  useEffect(() => {
    if (
      !isAuthorized(authorization, authorizations) &&
      !hasFetchedAuthorizations.current
    ) {
      hasFetchedAuthorizations.current = true
      onFetchAuthorizations([authorization])
    }
  }, [authorization, authorizations, onFetchAuthorizations])

  // Fetch the name of the collection by querying the contract directly.
  // Required to display the real name of the collection instead of the stub one.
  useEffect(() => {
    if (
      token &&
      isStubMaticCollectionContract(token) &&
      !hasFetchedContractName.current
    ) {
      hasFetchedContractName.current = true

      const fetchContractName = async () => {
        try {
          const provider = await getNetworkProvider(token.chainId)

          const erc721 = new ethers.Contract(
            token.address,
            ERC721ABI,
            new ethers.providers.Web3Provider(provider)
          )

          const name = await erc721.name()

          onUpsertContracts([{ ...token, name }])
        } catch (e) {
          console.warn('Could not fetch contract name')
        }
      }

      fetchContractName()
    }
  }, [token, onUpsertContracts])

  if (!contract || !token) {
    return null
  }

  return (
    <Modal open={open} size="small" className="AuthorizationModal">
      {!isMobile ? (
        <Modal.Header>
          {t('authorization_modal.title', {
            token: token.name
          })}
        </Modal.Header>
      ) : (
        <ModalNavigation
          title={t('authorization_modal.title', {
            token: token.name
          })}
          onClose={onCancel}
        />
      )}
      <Modal.Description>
        <T
          id="authorization_modal.description"
          values={{
            contract: contract.name,
            token: token.name,
            settings_link: (
              <Link to={locations.settings()}>{t('global.settings')}</Link>
            ),
            br: (
              <>
                <br />
                <br />
              </>
            )
          }}
        />
      </Modal.Description>
      <Modal.Content>
        <Authorization
          key={authorization.authorizedAddress}
          authorization={authorization}
        />
      </Modal.Content>
      <Modal.Actions className="AuthorizationModalActions">
        <Button onClick={onCancel} className="AuthorizationModalButtons">
          {t('global.cancel')}
        </Button>
        <Button
          className="AuthorizationModalButtons"
          primary
          loading={isLoading}
          disabled={
            isLoading ||
            isAuthorizing ||
            !isAuthorized(authorization, authorizations)
          }
          onClick={onProceed}
        >
          {t('global.proceed')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(AuthorizationModal)
