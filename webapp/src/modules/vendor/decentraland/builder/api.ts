import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { config } from '../../../../config'
import { retryParams } from '../utils'
import { AddressesByTagResponse } from './types'

export const BUILDER_SERVER_URL = config.get('BUILDER_SERVER_URL')!

class BuilderAPI extends BaseAPI {
  fetchAddressesByTag = async (tags: string[]): Promise<AddressesByTagResponse> => {
    return this.request('get', `/addresses?${tags.map(tag => `tag=${tag}`).join('&')}`)
  }
}

export const builderAPI = new BuilderAPI(BUILDER_SERVER_URL, retryParams)
