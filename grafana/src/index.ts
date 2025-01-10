import { RuntimeError } from '@botpress/sdk'
import * as bp from '.botpress'
import { GrafanaCloudClient } from './client'

export default new bp.Integration({
  register: async ({ ctx }) => {
    const { apiKey, grafanaUrl, grafanaUserId } = ctx.configuration;
    if (!apiKey) {
      throw new RuntimeError("Missing Grafana API Key! Please set it in your bot integration configuration.")
    } else if (!grafanaUrl) {
      throw new RuntimeError("Missing Grafana URL! Please set it in your bot integration configuration.")
    } else if (!grafanaUserId) {
      throw new RuntimeError("Missing Grafana user id! Please set it in your bot integration configuration.")
    }
  },
  unregister: async () => {
    /**
     * This is called when a bot removes the integration.
     * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
     */
  },
  actions: {
    sendMetric: async (props) => {
      // Initializing Grafana Cloud Client with necessary configurations.
      const gc = new GrafanaCloudClient(props.ctx.configuration.apiKey, props.ctx.configuration.grafanaUrl, props.ctx.configuration.grafanaUserId)
      try {
        await gc.sendMetric(props);
        return {}
      } catch (error) {
        throw new RuntimeError(JSON.stringify(error))
      }
    },

    sendRawData: async (props) => {
      // Initializing Grafana Cloud Client with necessary configurations.
      const gc = new GrafanaCloudClient(props.ctx.configuration.apiKey, props.ctx.configuration.grafanaUrl, props.ctx.configuration.grafanaUserId)
      try {
        await gc.sendRawData(props.input.data, props.logger);
        return {}
      } catch (error) {
        throw new RuntimeError(JSON.stringify(error))
      }
    }
  },
  channels: {},
  handler: async () => { },
})
