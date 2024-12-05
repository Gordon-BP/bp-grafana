import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'
import { GrafanaCloudClient } from './client'

export default new bp.Integration({
  register: async () => {
    /**
     * This is called when an integration configuration is saved.
     * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
     */
    throw new sdk.RuntimeError('Invalid configuration') // replace this with your own validation logic
  },
  unregister: async () => {
    /**
     * This is called when a bot removes the integration.
     * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
     */
    throw new sdk.RuntimeError('Invalid configuration') // replace this with your own validation logic
  },
  actions: {
    sendMetric: async ({ ctx, input, logger }) => {
      // Initializing Grafana Cloud Client with necessary configurations.
      const gc = new GrafanaCloudClient(ctx.configuration.apiKey, ctx.configuration.grafana_url)
      // Send the information as a metric
      gc.sendMetric(input, logger).catch((err) => {
        logger.error("Error sending metric to Grafana Cloud:", err);  // Handle any errors in the background
      });
      // Return immediately without waiting for sendMetric to finish
      return { id: 1 }
    }
  },
  channels: {},
  handler: async () => { },
})
