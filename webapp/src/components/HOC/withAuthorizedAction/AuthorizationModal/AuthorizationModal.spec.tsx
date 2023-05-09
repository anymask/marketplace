import { BigNumber } from 'ethers'
import { render, RenderResult, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Authorization,
  AuthorizationType
} from 'decentraland-dapps/dist/modules/authorization/types'
import { Network } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { AuthorizationModal } from './AuthorizationModal'
import {
  AuthorizationStepStatus,
  AuthorizedAction,
  Props
} from './AuthorizationModal.types'

jest.mock('decentraland-dapps/dist/containers', () => ({
  TransactionLink: () => 'test'
}))

function getAuthorizationModal(props: Partial<Props>) {
  return (
    <AuthorizationModal
      authorization={{} as Authorization}
      authorizationType={AuthorizationType.APPROVAL}
      grantStatus={AuthorizationStepStatus.PENDING}
      revokeStatus={AuthorizationStepStatus.PENDING}
      confirmationStatus={AuthorizationStepStatus.PENDING}
      confirmationError={null}
      network={Network.ETHEREUM}
      action={AuthorizedAction.BUY}
      onClose={jest.fn()}
      onRevoke={jest.fn()}
      onGrant={jest.fn()}
      onFetchAuthorizations={jest.fn()}
      onAuthorized={jest.fn()}
      contracts={[]}
      getConfirmationStatus={jest
        .fn()
        .mockReturnValue(AuthorizationStepStatus.PENDING)}
      getConfirmationError={jest.fn()}
      error={''}
      {...props}
    />
  )
}
function renderAuthorizationModal(props: Partial<Props>) {
  return render(getAuthorizationModal(props))
}

describe('when clicking close button', () => {
  it('should call onClose action', async () => {
    const onCloseMock = jest.fn()
    const screen = renderAuthorizationModal({ onClose: onCloseMock })
    await userEvent.click(
      screen.getByRole('button', { name: t('global.close') })
    )
    expect(onCloseMock).toHaveBeenCalled()
  })
})

describe('when authorization type is APPROVAL', () => {
  let screen: RenderResult
  describe('basic rendering', () => {
    beforeEach(() => {
      screen = renderAuthorizationModal({
        authorizationType: AuthorizationType.APPROVAL
      })
    })

    it('should render two steps', () => {
      expect(screen.getByTestId('multi-step').children.length).toBe(2)
    })

    it('should render authorization step', () => {
      expect(
        screen.getByRole('button', {
          name: t('mana_authorization_modal.authorize_nft.action')
        })
      ).toBeInTheDocument()
    })

    it('should render confirm action step', () => {
      expect(
        screen.getByRole('button', {
          name: t('mana_authorization_modal.confirm_transaction.action')
        })
      ).toBeInTheDocument()
    })

    it('should show only first step enabled', () => {
      expect(
        screen.getByRole('button', {
          name: t('mana_authorization_modal.authorize_nft.action')
        })
      ).toBeEnabled()

      expect(
        screen.getByRole('button', {
          name: t('mana_authorization_modal.confirm_transaction.action')
        })
      ).toBeDisabled()
    })
  })

  describe('when clicking on authorize button', () => {
    it('should call onGrant callback', async () => {
      const onGrantMock = jest.fn()
      const screen = renderAuthorizationModal({
        authorizationType: AuthorizationType.APPROVAL,
        onGrant: onGrantMock
      })
      await userEvent.click(
        screen.getByRole('button', {
          name: t('mana_authorization_modal.authorize_nft.action')
        })
      )
      expect(onGrantMock).toHaveBeenCalled()
    })
  })
})

describe('when authorization type is ALLOWANCE', () => {
  let screen: RenderResult
  describe('and network is ethereum', () => {
    describe('and rendering steps', () => {
      describe('and current allowance is not 0', () => {
        beforeEach(() => {
          screen = renderAuthorizationModal({
            authorizationType: AuthorizationType.ALLOWANCE,
            network: Network.ETHEREUM,
            currentAllowance: BigNumber.from('1'),
            requiredAllowance: BigNumber.from('10')
          })
        })
        it('should render 3 steps', () => {
          expect(screen.getByTestId('multi-step').children.length).toBe(3)
        })

        it('should render revoke step', () => {
          expect(screen.getByTestId('revoke-step')).toBeInTheDocument()
        })

        it('should render grant step', () => {
          expect(screen.getByTestId('grant-step')).toBeInTheDocument()
        })

        it('should only show the first step enabled', () => {
          expect(
            screen.getAllByRole('button', {
              name: t('mana_authorization_modal.authorize_mana.action')
            })[0]
          ).toBeEnabled()

          expect(
            screen.getAllByRole('button', {
              name: t('mana_authorization_modal.authorize_mana.action')
            })[1]
          ).toBeDisabled()

          expect(
            screen.getByRole('button', {
              name: t('mana_authorization_modal.confirm_transaction.action')
            })
          ).toBeDisabled()
        })
      })

      describe('and current allowance is 0', () => {
        beforeEach(() => {
          screen = renderAuthorizationModal({
            authorizationType: AuthorizationType.ALLOWANCE,
            network: Network.ETHEREUM,
            currentAllowance: BigNumber.from('0'),
            requiredAllowance: BigNumber.from('10')
          })
        })
        it('should render 2 steps', () => {
          expect(screen.getByTestId('multi-step').children.length).toBe(2)
        })

        it('should not render revoke step', () => {
          expect(screen.queryByTestId('revoke-step')).not.toBeInTheDocument()
        })

        it('should render grant step', () => {
          expect(screen.getByTestId('grant-step')).toBeInTheDocument()
        })
      })
    })
    describe('when rendering revoke step', () => {
      describe('and revoke status is PENDING', () => {
        beforeEach(() => {
          screen = renderAuthorizationModal({
            authorizationType: AuthorizationType.ALLOWANCE,
            network: Network.ETHEREUM,
            revokeStatus: AuthorizationStepStatus.PENDING
          })
        })

        it('should render revoke action button', () => {
          expect(
            within(screen.getByTestId('revoke-step')).getByRole('button', {
              name: t('mana_authorization_modal.revoke_cap.action')
            })
          ).toBeInTheDocument()
        })
      })

      describe('and revoke status is WAITING', () => {
        beforeEach(() => {
          screen = renderAuthorizationModal({
            authorizationType: AuthorizationType.ALLOWANCE,
            network: Network.ETHEREUM,
            revokeStatus: AuthorizationStepStatus.WAITING
          })
        })

        it('should show waiting wallet for approval message', () => {
          expect(
            screen.getByText(t('mana_authorization_modal.waiting_wallet'))
          ).toBeInTheDocument()
        })

        it('should show loading icon', () => {
          expect(screen.getByTestId('step-loader')).toBeInTheDocument()
        })

        it('should not show action button', () => {
          const revokeStep = screen.getByTestId('revoke-step')
          expect(
            within(revokeStep).queryByText(
              t('mana_authorization_modal.authorize_mana.action')
            )
          ).not.toBeInTheDocument()
        })
      })

      describe('and revoke status is PROCESSING', () => {
        beforeEach(() => {
          screen = renderAuthorizationModal({
            authorizationType: AuthorizationType.ALLOWANCE,
            network: Network.ETHEREUM,
            revokeStatus: AuthorizationStepStatus.PROCESSING
          })
        })

        it('should show waiting wallet for approval message', () => {
          expect(
            screen.getByText(t('mana_authorization_modal.waiting_confirmation'))
          ).toBeInTheDocument()
        })

        it('should show loading icon', () => {
          expect(screen.getByTestId('step-loader')).toBeInTheDocument()
        })

        it('should not show action button', () => {
          const revokeStep = screen.getByTestId('revoke-step')
          expect(
            within(revokeStep).queryByText(
              t('mana_authorization_modal.authorize_mana.action')
            )
          ).not.toBeInTheDocument()
        })
      })

      describe('and revoke status is DONE', () => {
        beforeEach(() => {
          screen = renderAuthorizationModal({
            authorizationType: AuthorizationType.ALLOWANCE,
            network: Network.ETHEREUM,
            revokeStatus: AuthorizationStepStatus.DONE
          })
        })

        it('should show waiting wallet for approval message', () => {
          expect(
            screen.getByText(t('mana_authorization_modal.done'))
          ).toBeInTheDocument()
        })

        it('should not show loading icon', () => {
          expect(screen.queryByTestId('step-loader')).not.toBeInTheDocument()
        })

        it('should not show action button', () => {
          const revokeStep = screen.getByTestId('revoke-step')
          expect(
            within(revokeStep).queryByText(
              t('mana_authorization_modal.authorize_mana.action')
            )
          ).not.toBeInTheDocument()
        })
      })
    })

    describe('when rendering grant action', () => {
      beforeEach(() => {
        screen = renderAuthorizationModal({
          authorizationType: AuthorizationType.ALLOWANCE,
          revokeStatus: AuthorizationStepStatus.PENDING,
          grantStatus: AuthorizationStepStatus.PENDING
        })

        const revokeStep = screen.getByTestId('revoke-step')
        return userEvent.click(
          within(revokeStep).getByRole('button', {
            name: t('mana_authorization_modal.revoke_cap.action')
          })
        )
      })

      describe('and grant status is WAITING', () => {
        let grantStatusStep: HTMLElement

        beforeEach(() => {
          screen.rerender(
            getAuthorizationModal({
              authorizationType: AuthorizationType.ALLOWANCE,
              revokeStatus: AuthorizationStepStatus.DONE,
              grantStatus: AuthorizationStepStatus.WAITING
            })
          )

          grantStatusStep = screen.getByTestId('grant-step')
        })

        it('should show waiting wallet for approval message', () => {
          expect(
            within(grantStatusStep).getByText(
              t('mana_authorization_modal.waiting_wallet')
            )
          ).toBeInTheDocument()
        })

        it('should show loading icon', () => {
          expect(
            within(grantStatusStep).getByTestId('step-loader')
          ).toBeInTheDocument()
        })

        it('should not show action button', () => {
          expect(
            within(grantStatusStep).queryByText(
              t('mana_authorization_modal.authorize_mana.action')
            )
          ).not.toBeInTheDocument()
        })
      })

      describe('and grant status is PROCESSING', () => {
        let grantStatusStep: HTMLElement

        beforeEach(() => {
          screen.rerender(
            getAuthorizationModal({
              authorizationType: AuthorizationType.ALLOWANCE,
              revokeStatus: AuthorizationStepStatus.DONE,
              grantStatus: AuthorizationStepStatus.PROCESSING
            })
          )
          grantStatusStep = screen.getByTestId('grant-step')
        })

        it('should show waiting wallet for approval message', () => {
          expect(
            within(grantStatusStep).getByText(
              t('mana_authorization_modal.waiting_confirmation')
            )
          ).toBeInTheDocument()
        })

        it('should show loading icon', () => {
          expect(
            within(grantStatusStep).getByTestId('step-loader')
          ).toBeInTheDocument()
        })

        it('should not show action button', () => {
          expect(
            within(grantStatusStep).queryByText(
              t('mana_authorization_modal.authorize_mana.action')
            )
          ).not.toBeInTheDocument()
        })
      })

      describe('and grant status is DONE', () => {
        let grantStatusStep: HTMLElement

        beforeEach(() => {
          screen.rerender(getAuthorizationModal({
            authorizationType: AuthorizationType.ALLOWANCE,
            revokeStatus: AuthorizationStepStatus.DONE,
            grantStatus: AuthorizationStepStatus.DONE
          }))

          grantStatusStep = screen.getByTestId('grant-step')
        })

        it('should show done message', () => {
          expect(
            within(grantStatusStep).getByText(
              t('mana_authorization_modal.done')
            )
          ).toBeInTheDocument()
        })

        it('should not show loading icon', () => {
          expect(
            within(grantStatusStep).queryByTestId('step-loader')
          ).not.toBeInTheDocument()
        })

        it('should not show action button', () => {
          expect(
            within(grantStatusStep).queryByText(
              t('mana_authorization_modal.authorize_mana.action')
            )
          ).not.toBeInTheDocument()
        })
      })

      describe('and grant status is ALLOWANCE_AMOUNT_ERROR', () => {
        let reauthorizeStep: HTMLElement

        beforeEach(() => {
          screen.rerender(getAuthorizationModal({
            authorizationType: AuthorizationType.ALLOWANCE,
            revokeStatus: AuthorizationStepStatus.DONE,
            grantStatus: AuthorizationStepStatus.ALLOWANCE_AMOUNT_ERROR,
            network: Network.ETHEREUM
          }))

          reauthorizeStep = screen.getByTestId('reauthorize-step')
        })

        it('should show allowance error message', () => {
          expect(
            within(reauthorizeStep).getByText(
              t('mana_authorization_modal.insufficient_amount_error.message')
            )
          ).toBeInTheDocument()
        })

        it('should not show loading icon', () => {
          expect(
            within(reauthorizeStep).queryByTestId('step-loader')
          ).not.toBeInTheDocument()
        })

        it('should show revoke action button', () => {
          expect(
            within(reauthorizeStep).getByText(
              t('mana_authorization_modal.insufficient_amount_error.action')
            )
          ).toBeInTheDocument()
        })
      })
    })
  })

  describe('and network is polygon', () => {
    describe('and rendering steps', () => {
      beforeEach(() => {
        screen = renderAuthorizationModal({
          authorizationType: AuthorizationType.ALLOWANCE,
          network: Network.MATIC
        })
      })
      it('should render 2 steps', () => {
        expect(screen.getByTestId('multi-step').children.length).toBe(2)
      })

      it('should not render revoke step', () => {
        expect(screen.queryByTestId('revoke-step')).not.toBeInTheDocument()
      })

      it('should render grant step', () => {
        expect(screen.getByTestId('grant-step')).toBeInTheDocument()
      })

      it('should only show the first step enabled', () => {
        expect(
          screen.getAllByRole('button', {
            name: t('mana_authorization_modal.authorize_mana.action')
          })[0]
        ).toBeEnabled()

        expect(
          screen.getByRole('button', {
            name: t('mana_authorization_modal.confirm_transaction.action')
          })
        ).toBeDisabled()
      })
    })
  })
})

describe('when clicking revoke authorization button', () => {
  it('should call onRevoke callback', async () => {
    const onRevokeMock = jest.fn()
    const screen = renderAuthorizationModal({
      authorizationType: AuthorizationType.ALLOWANCE,
      revokeStatus: AuthorizationStepStatus.PENDING,
      network: Network.ETHEREUM,
      onRevoke: onRevokeMock
    })
    const revokeStatusStep = screen.getByTestId('revoke-step')
    await userEvent.click(
      within(revokeStatusStep).getByRole('button', {
        name: t('mana_authorization_modal.revoke_cap.action')
      })
    )
    expect(onRevokeMock).toHaveBeenCalled()
  })
})

describe('when clicking grant authorization button', () => {
  it('should call onRevoke callback', async () => {
    const onGrantMock = jest.fn()
    const screen = renderAuthorizationModal({
      authorizationType: AuthorizationType.ALLOWANCE,
      revokeStatus: AuthorizationStepStatus.PENDING,
      grantStatus: AuthorizationStepStatus.PENDING,
      onGrant: onGrantMock
    })
    const revokeStatusStep = screen.getByTestId('revoke-step')
    await userEvent.click(
      within(revokeStatusStep).getByRole('button', {
        name: t('mana_authorization_modal.revoke_cap.action')
      })
    )
    screen.rerender(getAuthorizationModal({
      authorizationType: AuthorizationType.ALLOWANCE,
      revokeStatus: AuthorizationStepStatus.DONE,
      grantStatus: AuthorizationStepStatus.PENDING,
      onGrant: onGrantMock
    }))
    const grantStatusStep = screen.getByTestId('grant-step')
    await userEvent.click(
      within(grantStatusStep).getByRole('button', {
        name: t('mana_authorization_modal.set_cap.action')
      })
    )
    expect(onGrantMock).toHaveBeenCalled()
  })
})
