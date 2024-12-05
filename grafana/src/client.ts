import axios, { AxiosInstance } from 'axios'
import { v4 as uuidv4 } from 'uuid';

export class GrafanaCloudClient {
  private axios: AxiosInstance  // Instance of Axios to make HTTP requests.

  // Constructor to initialize the Grafana Client with URL and API Token.
  constructor(private apikey: string, private grafana_url: string) {
    this.axios = axios.create({
      baseURL: this.grafana_url,
      headers: { Authorization: this.apikey },
    })
  }

  // Method to get send a single metric to Grafana Cloud
  // Using Prometheus schema
  async sendMetric(input, logger) {
    const { eventType, channel, botId, conversationId, userId } = input
    const uuid = uuidv4() // Generate a unique ID for this metric
    const timestamp = Date.now().toString() // Get the current time
    const body = `${eventType},channel=${channel},botId=${botId},userId=${userId},conversationId=${conversationId},uuid=${id} value=1 ${timestamp}`; // Format data
    logger.forBot().info(`Logging data: ${body}`);
    try {
      // Send to Grafana Cloud
      const response = await this.axios.post('/api/v1/push/influx/write', body, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      logger.forBot().info('Metric successfully sent to Grafana Cloud:', response.data);
    } catch (error) {
      logger.forBot().error('Error sending metric to Grafana Cloud:', error.response ? error.response.data : error.message);
    }
    return uuid
  }
}

