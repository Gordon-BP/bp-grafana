import { ActionProps } from '.botpress';
import { RuntimeError } from '@botpress/client';
import { IntegrationLogger } from '@botpress/sdk';
import axios, { AxiosInstance } from 'axios'
import { v4 as uuidv4 } from 'uuid';

export class GrafanaCloudClient {
  private axios: AxiosInstance  // Instance of Axios to make HTTP requests.

  // Constructor to initialize the Grafana Client with URL and API Token.
  constructor(private apiKey: string, private grafanaUrl: string, private grafanaUserId: string) {
    this.axios = axios.create({
      baseURL: this.grafanaUrl,
      headers: {
        Authorization: `Bearer ${this.grafanaUserId}:${this.apiKey}`,
        'Content-Type': 'text/plain'
      },
    })
  }

  // Method to get send a single metric to Grafana Cloud
  // Using Prometheus schema
  async sendMetric(props: ActionProps['sendMetric']) {
    const { input, logger } = props
    Object.entries(input).forEach(([_, value]) => {
      if (/\s/.test(JSON.stringify(value))) {
        throw new RuntimeError(`No spaces allowed in metric value: ${value}`);
      }
    });
    const { name, channel, botId, conversationId, userId, version } = input
    const uuid = uuidv4() // Generate a unique ID for this metric
    const body = `${name},channel=${channel},botId=${botId},version=${version},userId=${userId},conversationId=${conversationId},uuid=${uuid} metric=1`; // Format data

    try {
      // Send to Grafana Cloud
      logger.forBot().info("Pushing to grafana...");
      await this.axios.post('/api/v1/push/influx/write', body);
      logger.forBot().info(`Metric successfully sent to Grafana Cloud: ${body}`);
    } catch (error) {
      throw new RuntimeError(`Error sending metric to Grafana Cloud: ${error}`);
    }
  }
  // Method to send a single raw prometheus string
  async sendRawData(data: string, logger: IntegrationLogger) {
    data.split(" ").forEach((value) => {
      if (/\s/.test(JSON.stringify(value))) {
        throw new RuntimeError(`No spaces allowed in raw data string: ${value}`);
      }
    });
    try {
      // Send to Grafana Cloud
      logger.forBot().info("Pushing to grafana...");
      await this.axios.post('/api/v1/push/influx/write', data);
      logger.forBot().info(`Metric successfully sent to Grafana Cloud: ${data}`);
    } catch (error) {
      throw new RuntimeError(`Error sending metric to Grafana Cloud: ${error}`);
    }
  }
}

