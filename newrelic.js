'use strict';

/**
 * New Relic agent configuration.
 * This configuration reads sensitive information from environment variables.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'default-app-name'],

  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY || 'your-default-license-key',

  /**
   * Logging configuration.
   */
  logging: {
    /**
     * Level at which to log. 'trace' is most useful for diagnosing issues with
     * the agent, 'info' and higher will impose the least overhead on production
     * applications.
     */
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
  },

  /**
   * Distributed Tracing.
   * Enables distributed tracing, which lets you see the path requests take
   * through your distributed system.
   */
  distributed_tracing: {
    enabled: true,
  },

  /**
   * Error Collector configuration.
   * Controls how the agent collects information about errors.
   */
  error_collector: {
    enabled: true,
  },

  /**
   * Custom Insights configuration.
   * Controls how custom events are sent to New Relic Insights.
   */
  insights: {
    enabled: true,
  },

  /**
   * Allow using environment variables for sensitive data.
   */
  allow_all_headers: true,
};
