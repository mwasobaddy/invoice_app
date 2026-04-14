# MCP Server Configuration Guide

This document covers the MCP (Model Context Protocol) servers that can enhance your development experience with this Invoice Management System.

## Available MCP Servers for This Stack

### 1. PostgreSQL/Database MCP
**Purpose**: Direct database query assistance and schema exploration

**Installation**:
```bash
npm install -D @modelcontextprotocol/server-postgres
```

**Configuration** (in VS Code settings or MCP config):
```json
{
  "mcpServers": {
    "postgres": {
      "command": "node",
      "args": ["path/to/server-postgres.js"],
      "env": {
        "DATABASE_URL": "your_database_url"
      }
    }
  }
}
```

**Benefits**:
- Execute SQL queries directly
- Explore database schema
- Get query optimization suggestions
- Debug database issues

### 2. Prisma MCP
**Purpose**: Prisma ORM assistance, schema generation, migrations

**Installation**:
```bash
npm install -D @modelcontextprotocol/server-prisma
```

**Configuration**:
```json
{
  "mcpServers": {
    "prisma": {
      "command": "node",
      "args": ["path/to/server-prisma.js"]
    }
  }
}
```

**Features**:
- Schema validation
- Migration recommendations
- Query optimization
- Model relationship analysis

### 3. Next.js MCP
**Purpose**: Next.js framework-specific guidance and optimization

**Installation**:
```bash
npm install -D @modelcontextprotocol/server-nextjs
```

**Configuration**:
```json
{
  "mcpServers": {
    "nextjs": {
      "command": "node",
      "args": ["path/to/server-nextjs.js"]
    }
  }
}
```

**Capabilities**:
- App Router best practices
- API route validation
- Performance optimization
- Build configuration assistance

### 4. TypeScript MCP
**Purpose**: TypeScript type checking and inference

**Installation**:
```bash
npm install -D @modelcontextprotocol/server-typescript
```

**Configuration**:
```json
{
  "mcpServers": {
    "typescript": {
      "command": "node",
      "args": ["path/to/server-typescript.js"],
      "env": {
        "TSCONFIG_PATH": "./tsconfig.json"
      }
    }
  }
}
```

**Benefits**:
- Type inference assistance
- Interface generation
- Generic type recommendations
- Error diagnostics

### 5. Supabase MCP (if using Supabase)
**Purpose**: Supabase-specific features and optimization

**Installation**:
```bash
npm install -D @modelcontextprotocol/server-supabase
```

**Configuration**:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["path/to/server-supabase.js"],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_KEY": "your_supabase_key"
      }
    }
  }
}
```

**Features**:
- Real-time database features
- Row-level security (RLS) policy assistance
- Storage bucket management
- Authentication helpers

## Setting Up MCP Servers

### Option 1: Using VS Code Settings
Edit `.vscode/settings.json`:
```json
{
  "modelContextProtocol": {
    "mcpServers": {
      "postgres": {
        "command": "node",
        "args": ["./mcp-servers/postgres.js"]
      },
      "prisma": {
        "command": "node",
        "args": ["./mcp-servers/prisma.js"]
      },
      "nextjs": {
        "command": "node",
        "args": ["./mcp-servers/nextjs.js"]
      },
      "typescript": {
        "command": "node",
        "args": ["./mcp-servers/typescript.js"]
      }
    }
  }
}
```

### Option 2: Using Claude Configuration
Create `claude.config.json` at project root:
```json
{
  "version": "1.0",
  "mcpServers": [
    {
      "name": "postgres",
      "command": "node",
      "args": ["./mcp-servers/postgres.js"],
      "disabled": false
    },
    {
      "name": "prisma",
      "command": "node",
      "args": ["./mcp-servers/prisma.js"],
      "disabled": false
    },
    {
      "name": "nextjs",
      "command": "node",
      "args": ["./mcp-servers/nextjs.js"],
      "disabled": false
    },
    {
      "name": "typescript",
      "command": "node",
      "args": ["./mcp-servers/typescript.js"],
      "disabled": false
    }
  ]
}
```

### Option 3: Using Environment Variables
Set up MCP servers via environment:
```bash
export MCP_SERVERS='postgres,prisma,nextjs,typescript'
export POSTGRES_DB_URL='your_database_url'
export SUPABASE_URL='your_supabase_url'
export SUPABASE_KEY='your_supabase_key'
```

## MCP Server Usage Examples

### With PostgreSQL MCP
```
Ask: "Write a query to find all invoices marked as overdue from the last 30 days"
MCP Response: Generates SQL query, optimizes it, explains execution plan
```

### With Prisma MCP
```
Ask: "Create a Prisma migration for adding a discount field to invoices"
MCP Response: Generates migration file, schema updates, validation
```

### With Next.js MCP
```
Ask: "Optimize this API route for better performance"
MCP Response: Analyzes route, suggests caching, middleware improvements
```

### With TypeScript MCP
```
Ask: "Generate TypeScript types for this API response"
MCP Response: Creates proper interfaces, handles nested structures
```

## Recommended Setup for Your Project

For optimal development experience with this Invoice Management System, we recommend:

1. **Primary MCP**: Prisma (for ORM operations)
2. **Secondary MCP**: PostgreSQL (for database exploration)
3. **Tertiary MCP**: Next.js (for API route guidance)
4. **Optional**: TypeScript MCP (for type generation)
5. **Conditional**: Supabase MCP (if using Supabase)

## Installation Script

Create `install-mcp-servers.sh`:
```bash
#!/bin/bash

echo "Installing MCP Servers..."

# Create MCP servers directory
mkdir -p mcp-servers

# Install each server
npm install -D @modelcontextprotocol/server-postgres
npm install -D @modelcontextprotocol/server-prisma
npm install -D @modelcontextprotocol/server-nextjs
npm install -D @modelcontextprotocol/server-typescript

echo "MCP Servers installed successfully!"
echo "Configure them in .vscode/settings.json or claude.config.json"
```

Run with:
```bash
bash install-mcp-servers.sh
```

## Troubleshooting MCP Servers

### Server not connecting
1. Check configuration file syntax (JSON formatting)
2. Verify command and args paths exist
3. Check environment variables are set
4. Review logs for error messages

### Database connection issues
1. Verify DATABASE_URL is correct
2. Test connection: `psql $DATABASE_URL`
3. Check firewall/network settings
4. Verify database credentials

### Permission errors
1. Ensure files are readable/executable
2. Check database user has proper permissions
3. Verify Supabase/Neon API keys are valid
4. Check Row-Level Security (RLS) policies if using Supabase

## Best Practices

1. **Start with Prisma MCP**: Handle all database operations through Prisma
2. **Use TypeScript MCP**: Generate types automatically
3. **Test queries**: Always test database operations in Prisma Studio first
4. **Documentation**: Document MCP setup in project README
5. **Version control**: Don't commit sensitive environment variables
6. **Performance**: Profile queries using database MCP before deployment

## Advanced Configuration

### Creating Custom MCP Servers
If you need custom MCP functionality:

```typescript
// mcp-servers/custom-invoice.ts
import { MCPServer } from '@modelcontextprotocol/sdk';

const server = new MCPServer();

// Add custom tools
server.tool('generate-invoice', async (invoiceId: string) => {
  // Custom invoice generation logic
  return { success: true, pdfUrl: '...' };
});

export default server;
```

## Security Considerations

1. **Never commit secrets**: Use environment variables or .env.local
2. **Limit MCP access**: Restrict what each MCP can do
3. **Monitor permissions**: Check database user privileges
4. **Use encrypted connections**: Always use SSL/TLS for database
5. **Rotate credentials**: Regularly update API keys and passwords

## Resources

- [MCP Official Documentation](https://modelcontextprotocol.io/)
- [Prisma MCP Server](https://github.com/modelcontextprotocol/servers)
- [Next.js MCP Server](https://github.com/modelcontextprotocol/servers)
- [PostgreSQL Connection Best Practices](https://www.postgresql.org/docs/current/)
- [Supabase documentation](https://supabase.com/docs)

---

**Note**: MCP servers are optional but highly recommended for development efficiency and code quality.
