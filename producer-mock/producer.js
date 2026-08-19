const { Kafka } = require('kafkajs');
const crypto = require('crypto');

const kafka = new Kafka({
  clientId: 'telemetry-mock-producer',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const SERVICES = ['auth-service', 'payment-gateway', 'order-processor', 'inventory-api'];
const LOG_LEVELS = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];

function generateMetric(serviceId) {
  const isSpike = Math.random() < 0.15;
  const isError = Math.random() < 0.08;

  return {
    eventId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    serviceId: serviceId,
    environment: 'production',
    host: `host-${serviceId}-${Math.floor(Math.random() * 3) + 1}`,
    metrics: {
      cpuUsage: parseFloat((isSpike ? 85 + Math.random() * 14 : 20 + Math.random() * 40).toFixed(1)),
      memoryUsage: parseFloat((40 + Math.random() * 35).toFixed(1)),
      latencyMs: parseFloat((isSpike ? 450 + Math.random() * 600 : 25 + Math.random() * 80).toFixed(1)),
      statusCode: isError ? 500 : (Math.random() < 0.05 ? 404 : 200),
      activeConnections: Math.floor(50 + Math.random() * 200)
    },
    log: {
      level: isError ? 'ERROR' : LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)],
      message: isError 
        ? `Database connection timeout in ${serviceId}` 
        : `Processed transaction chunk successfully`,
      traceId: crypto.randomBytes(8).toString('hex')
    }
  };
}

async function run() {
  await producer.connect();
  console.log('✅ Connected to Kafka broker on localhost:9092');

  setInterval(async () => {
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
    const payload = generateMetric(service);

    await producer.send({
      topic: 'telemetry-events',
      messages: [
        {
          key: service,
          value: JSON.stringify(payload),
        },
      ],
    });

    console.log(`[${payload.timestamp}] 🚀 Sent -> ${service} | CPU: ${payload.metrics.cpuUsage}% | Latency: ${payload.metrics.latencyMs}ms | Status: ${payload.metrics.statusCode}`);
  }, 1000);
}

run().catch(console.error);
