export default () => {
  const {
    PORT,
    DATABASE_TYPE,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_NAME,
    DATABASE_CONNECTION_URL,
    JWT_SECRET,
    JWT_EXPIRE_IN,
    TERMII_SMS_FROM,
    TERMII_API_kEY,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_USERNAME,
    REDIS_PASSWORD,
    PAYSTACK_SECRET_KEY,
    AZURE_STORAGE_CONNECTION_STRING,
    THROTTLE_TTL,
    THROTTLE_LIMIT,
  } = process.env;
  return {
    port: parseInt(PORT, 10) || 3000,
    database: {
      type: DATABASE_TYPE,
      host: DATABASE_HOST,
      port: parseInt(DATABASE_PORT, 10) || 5432,
      username: DATABASE_USERNAME,
      password: DATABASE_PASSWORD,
      name: DATABASE_NAME,
      connectionUrl: DATABASE_CONNECTION_URL,
    },
    jwt: {
      secret: JWT_SECRET,
      expireIn: JWT_EXPIRE_IN,
    },
    sms: {
      from: TERMII_SMS_FROM,
      apiKey: TERMII_API_kEY,
    },
    redis: {
      host: REDIS_HOST,
      port: REDIS_PORT,
      username: REDIS_USERNAME,
      password: REDIS_PASSWORD,
    },
    paymentProcessor: {
      secretKey: PAYSTACK_SECRET_KEY,
    },
    azure: {
      storage: {
        connectionString: AZURE_STORAGE_CONNECTION_STRING,
      },
    },
    throttle: {
      ttl: THROTTLE_TTL,
      limit: THROTTLE_LIMIT,
    },
  };
};
