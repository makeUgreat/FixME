module.exports = {
  frameworkDependency:
    'node_modules/.+(?:@nestjs|drizzle-orm|pg|fastify|class-transformer|class-validator|zod)',
  sourceTestFiles:
    '(^src/.*/__tests__/|[.](?:spec|test|integration-spec)[.]ts$)',
};
