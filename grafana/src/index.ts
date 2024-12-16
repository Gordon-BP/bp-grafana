import { RuntimeError } from '@botpress/sdk'
import * as bp from '.botpress'
import { GrafanaCloudClient } from './client'

export default new bp.Integration({
  register: async () => {
    /**
     * This is called when an integration configuration is saved.
     * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
     */
  },
  unregister: async () => {
    /**
     * This is called when a bot removes the integration.
     * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
     */
  },
  actions: {
    sendMetric: async ({ ctx, input, logger }) => {
      // Initializing Grafana Cloud Client with necessary configurations.
      const gc = new GrafanaCloudClient(ctx.configuration.apiKey, ctx.configuration.grafanaUrl, ctx.configuration.grafanaUserId)
      try {
        await gc.sendMetric(input, logger);
        return {}
      } catch (error) {
        throw new RuntimeError(JSON.stringify(error))
      }
    },

    sendRawData: async ({ ctx, input, logger }) => {
      // Initializing Grafana Cloud Client with necessary configurations.
      const gc = new GrafanaCloudClient(ctx.configuration.apiKey, ctx.configuration.grafanaUrl, ctx.configuration.grafanaUserId)
      try {
        await gc.sendRawData(input, logger);
        return {}
      } catch (error) {
        throw new RuntimeError(JSON.stringify(error))
      }
    }
  },
  channels: {},
  handler: async () => { },
})
