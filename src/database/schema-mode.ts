export function shouldPushDatabaseSchema(
  nodeEnvironment = process.env.NODE_ENV,
  schemaPushDisabled = process.env.PAYLOAD_DISABLE_DATABASE_SCHEMA_PUSH,
): boolean {
  return nodeEnvironment === 'development' && schemaPushDisabled !== 'true'
}
