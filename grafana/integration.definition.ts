import { IntegrationDefinition, z } from '@botpress/sdk'
import { integrationName } from './package.json'

export default new IntegrationDefinition({
  name: integrationName,
  version: '0.0.1',
  readme: 'hub.md',
  icon: 'icon.svg',
  configuration: {
    schema: z.object({
      grafana_url: z.string().describe("The URL for your Grafana cloud instance. Typically https://<Your_Company>.grafana.net"),
      apiKey: z.string().describe("Your Grafana Cloud API Key. Get it from <Your_Grafana_Url>/connections/add-new-connection/http-metrics"),
    })
  },
  events: {
    metricSent: {
      schema: z.object({ id: z.string() })
    },
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
        schema: z.object({ id: z.string() }) // Defines the output schema of creating a task.
      }
    }
  },

})
