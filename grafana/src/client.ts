import { RuntimeError } from '@botpress/client';
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
  async sendMetric(input, logger) {
    input.forEach((value: string, _: string) => {
      if (/"\s"/.test(value)) {
        throw new RuntimeError("No spaces allowed in metric values!");
      }
    });
    const { name, channel, botId, conversationId, userId } = input
    const uuid = uuidv4() // Generate a unique ID for this metric
    const timestamp = Date.now().toString() // Get the current time
    const body = `name=${name},channel=${channel},botId=${botId},userId=${userId},conversationId=${conversationId},uuid=${uuid} metric=1`; // Format data
    const headers = {
      Authorization: `${this.grafanaUserId}:${this.apiKey}`,
      'Content-Type': 'text/plain'  // Correct the typo here
    }
    try {
      // Send to Grafana Cloud
      logger.forBot().info("Pushing to grafana...");
      const response = await this.axios.post('/api/v1/push/influx/write', body);
      logger.forBot().info('Metric successfully sent to Grafana Cloud:', response.data);
    } catch (error) {
      logger.forBot().error('Error sending metric to Grafana Cloud:', error.response ? error.response.data : error.message);
    }
  }
}

