import { type SwaggerOptions } from 'swagger-jsdoc';

const options: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'retrofunding-api',
      version: '1.0.0',
      description: 'API documentation for retrofunding',
    },
    servers: [
      {
        url: '/api',
        description: 'Base URL for all API routes',
      },
    ],
  },
  apis: ['src/routes/*.ts'],
};

export default options;
