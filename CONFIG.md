# Good-Base Configuration Guide

Good-Base uses a flexible configuration system that supports multiple
configuration sources with different priorities:

## Configuration Sources (in order of priority)

1. **Environment Variables** (highest priority)
2. **TypeScript Configuration File** (`./good-base.config.ts`)
3. **Default Values** (lowest priority)## Configuration Sections

### Database Configuration

- `dataDirectory`: Directory where database files are stored
- `maxFileSize`: Maximum database file size in MB
- `enableBackups`: Whether to create automatic backups
- `backupDirectory`: Where to store backup files
- `backupInterval`: Backup frequency in hours

### Server Configuration

- `port`: HTTP server port
- `host`: Server hostname/interface
- `enableCors`: Enable CORS support
- `corsOrigins`: Allowed CORS origins (array)
- `requestTimeout`: Request timeout in seconds
- `maxBodySize`: Maximum request body size in MB

### Authentication Configuration

- `required`: Whether authentication is required
- `defaultToken`: Default auth token for development
- `validationMethod`: Token validation method (static|jwt|external)
- `jwtSecret`: JWT secret key (if using JWT)
- `externalEndpoint`: External validation URL (if using external)

### Index Configuration

- `defaultLevel`: Default index level (match|traverse|full)
- `optimizationThreshold`: Items before optimization kicks in
- `autoOptimize`: Enable automatic index optimization
- `enableCache`: Cache frequently used indexes
- `maxCacheSize`: Maximum cache size in MB

**Note**: Index settings are configured when creating individual indexes, not through the main configuration file.

### Logging Configuration

- `level`: Log level (debug|info|warn|error)
- `enableCommandLogging`: Write logs to files
- `logDirectory`: Log file directory
- `maxLogFileSize`: Maximum log file size in MB
- `logRetention`: Number of log files to keep
- `enableRequestLogging`: Log HTTP requests/responses

### CLI Configuration

- `historyFile`: Command history file path
- `historySize`: Maximum commands in history
- `enableColors`: Use colored terminal output
- `prompt`: CLI prompt text

## Configuration Formats

### JSON Format (`good-base.config.json`)

```json
{
  "database": {
    "dataDirectory": "./data",
    "defaultDatabase": "main"
  },
  "server": {
    "port": 5555,
    "host": "localhost"
  }
}
```

## Configuration Format

### TypeScript Configuration (`good-base.config.ts`)

```typescript
import type { GoodBaseConfig } from "./src/config/types.ts";

const config: GoodBaseConfig = {
  // Database settings with helpful comments
  database: {
    dataDirectory: "./data", // Where to store database files
    maxFileSize: 100,        // MB per database file
  },
  
  // Server configuration
  server: {
    port: 7777,
    host: "localhost",
    // Use specific origins in production
    corsOrigins: ["https://myapp.com"],
  },
  
  // CLI settings
  cli: {
    authTimeoutMinutes: 30, // 0 = no timeout
  },
};

export default config;
```

### Environment Variables

```bash
export GOOD_BASE_DATA_DIR="./data"
export GOOD_BASE_PORT=5555
export GOOD_BASE_HOST="localhost"
```

## CLI Commands

### Show Configuration

```bash
# Show all configuration
config

# Show specific section
config --key database

# Show specific value  
config --key database.dataDirectory
```

### Reload Configuration

```bash
config --action reload
```

## Getting Started

1. Copy `good-base.config.example.ts` to `good-base.config.ts`
2. Edit the configuration file to match your needs
3. Run `deno run --allow-read --allow-net --allow-env --allow-import src/main.ts`
4. Use the `config` command in the CLI to verify your settings

### TypeScript Config Benefits

- **Comments**: Document your configuration choices
- **Type Safety**: Get IDE completion and validation
- **Conditional Logic**: Use JavaScript expressions for dynamic config
- **Code Reuse**: Import shared values or functions

## Environment Variable Reference

All configuration options can be overridden with environment variables using the `GOOD_BASE_` prefix. The system automatically converts environment variable names to the corresponding configuration paths:

### Environment Variable Naming Convention

- Use `GOOD_BASE_` as the prefix
- Use underscores (`_`) to separate nested object properties
- Property names are automatically converted from `SNAKE_CASE` to `camelCase`

### Examples

```bash
# Server configuration
export GOOD_BASE_SERVER_PORT=8080
export GOOD_BASE_SERVER_HOST="0.0.0.0"
export GOOD_BASE_SERVER_ENABLE_CORS=true
export GOOD_BASE_SERVER_CORS_ORIGINS='["https://example.com", "https://api.example.com"]'

# Database configuration
export GOOD_BASE_DATABASES_MAIN_MAX_FILE_SIZE=200
export GOOD_BASE_DATABASES_MAIN_ENABLED_BACKUPS=true
export GOOD_BASE_DATABASES_MAIN_BACKUP_INTERVAL=12

# Authentication
export GOOD_BASE_AUTH_REQUIRED=true
export GOOD_BASE_AUTH_DEFAULT_TOKEN="your-secret-token"
export GOOD_BASE_AUTH_VALIDATION_METHOD="jwt"

# Logging
export GOOD_BASE_LOGGING_LEVEL="debug"
export GOOD_BASE_LOGGING_ENABLE_COMMAND_LOGGING=true
export GOOD_BASE_LOGGING_MAX_LOG_FILE_SIZE=25

# CLI
export GOOD_BASE_CLI_HISTORY_SIZE=500
export GOOD_BASE_CLI_ENABLE_COLORS=false
export GOOD_BASE_CLI_AUTH_TIMEOUT_MINUTES=60
```

### Type Conversion

Environment variables are automatically converted to the appropriate types:

- **Booleans**: `true`, `false`, `1`, `0`, `yes`, `no`, `on`, `off` (case-insensitive)
- **Numbers**: Integers and floating-point numbers are automatically detected
- **Arrays**: JSON arrays (`["item1", "item2"]`) or comma-separated values (`item1,item2`)
- **Objects**: JSON objects for complex nested structures
- **Strings**: Default fallback for all other values

### Advanced Usage

For complex configurations, you can use JSON format in environment variables:

```bash
export GOOD_BASE_SERVER_CORS_ORIGINS='["https://app.example.com", "https://admin.example.com"]'
export GOOD_BASE_DATABASES='{"main": {"maxFileSize": 100}, "analytics": {"maxFileSize": 500}}'
```

### Complete Mapping Reference

Here's how environment variables map to configuration properties:

| Environment Variable | Configuration Path |
|---------------------|-------------------|
| `GOOD_BASE_DATABASES_MAIN_MAX_FILE_SIZE` | `databases.main.maxFileSize` |
| `GOOD_BASE_DATABASES_MAIN_ENABLED_BACKUPS` | `databases.main.enabledBackups` |
| `GOOD_BASE_DATABASES_MAIN_BACKUP_INTERVAL` | `databases.main.backupInterval` |
| `GOOD_BASE_SERVER_PORT` | `server.port` |
| `GOOD_BASE_SERVER_HOST` | `server.host` |
| `GOOD_BASE_SERVER_ENABLE_CORS` | `server.enableCors` |
| `GOOD_BASE_SERVER_CORS_ORIGINS` | `server.corsOrigins` |
| `GOOD_BASE_SERVER_REQUEST_TIMEOUT` | `server.requestTimeout` |
| `GOOD_BASE_SERVER_MAX_BODY_SIZE` | `server.maxBodySize` |
| `GOOD_BASE_AUTH_REQUIRED` | `auth.required` |
| `GOOD_BASE_AUTH_DEFAULT_TOKEN` | `auth.defaultToken` |
| `GOOD_BASE_AUTH_VALIDATION_METHOD` | `auth.validationMethod` |
| `GOOD_BASE_LOGGING_LEVEL` | `logging.level` |
| `GOOD_BASE_LOGGING_ENABLE_COMMAND_LOGGING` | `logging.enableCommandLogging` |
| `GOOD_BASE_LOGGING_ENABLE_REQUEST_LOGGING` | `logging.enableRequestLogging` |
| `GOOD_BASE_LOGGING_MAX_LOG_FILE_SIZE` | `logging.maxLogFileSize` |
| `GOOD_BASE_LOGGING_MAX_LOG_FILES` | `logging.maxLogFiles` |
| `GOOD_BASE_CLI_HISTORY_SIZE` | `cli.historySize` |
| `GOOD_BASE_CLI_PERSISTENT_HISTORY` | `cli.persistentHistory` |
| `GOOD_BASE_CLI_ENABLE_COLORS` | `cli.enableColors` |
| `GOOD_BASE_CLI_PROMPT` | `cli.prompt` |
| `GOOD_BASE_CLI_AUTH_TIMEOUT_MINUTES` | `cli.authTimeoutMinutes` |

**Note**: This mapping is automatically generated based on your configuration structure. As you add or modify configuration options in `good-base.config.example.js`, the environment variable support will automatically adapt without requiring code changes.

## Validation

The configuration system automatically validates settings and will show warnings
for:

- Missing required values
- Invalid port numbers
- Missing authentication tokens when required
- Invalid file paths
- Other common configuration issues

Use the `config` command to check if your configuration is valid.
