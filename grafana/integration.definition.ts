import { IntegrationDefinition, z } from '@botpress/sdk'
import { integrationName } from './package.json'

export default new IntegrationDefinition({
  name: integrationName,
  title: "Grafana Cloud Integration",
  description: "Sends metric events to Grafana Cloud via HTTP for visualization",
  version: '1.0.0',
  readme: 'hub.md',
  icon: 'icon.svg',
  configuration: {
    schema: z.object({
      grafanaUrl: z.string().describe("The URL for your Grafana cloud instance. Looks like https://influx-prod-12-us-west-0.grafana.net").title("Grafana URL"),
      grafanaUserId: z.string().describe("The Grafana user ID that can access the HTTP API. Usually 7 digits long.").title("Grafana User ID"),
      apiKey: z.string().describe("Your Grafana Cloud API Key. Get it from <Your_Grafana_Url>/connections/add-new-connection/http-metrics").title("Grafana API Token"),
    })
  },
  actions: {
    sendMetric: {
      title: "Send Metric",
      description: "Sends a single metric along with bot and conversation data to Grafana via HTTP",
      input: {
        schema: z.object({
          name: z.string().describe("The name of the metric").title("Metric Name"),
          channel: z.string().describe("Which channel the conversation happened on; web, emulator, WhatsApp, etc").title("Channel"),
          botId: z.string().describe("For which bot this event happened").title("Bot ID"),
          conversationId: z.string().describe("For which conversation this event happened").title("Converation ID"),
          userId: z.string().describe("For which user this event happened").title("User ID"),
        })
      },
      output: {
        schema: z.object({}) // No returned object
      }
    }
  },

})
