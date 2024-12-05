import * as sdk from '@botpress/sdk'
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
      const gc = new GrafanaCloudClient(ctx.configuration.apiKey, ctx.configuration.grafana_url, ctx.configuration.grafana_user_id)
      // Send the information as a metric
      // gc.sendMetric(input, logger).catch((err) => {
      //   logger.forBot().error("Error sending metric to Grafana Cloud:", err);  // Handle any errors in the background
      // }).then(() => {
      //   logger.forBot().info("successfully pushed data to grafana")
      // });
      await gc.sendMetric(input, logger);
      logger.forBot().info("Data sent!")
      return {}
    }
  },
  channels: {},
  handler: async () => { },
})
