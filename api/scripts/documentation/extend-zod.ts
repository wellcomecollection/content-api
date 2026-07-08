/**
 * Side-effect module. Import this before any Zod schemas are created to ensure
 * extendZodWithOpenApi runs first. In CommonJS (tsx), imports are evaluated in
 * order, so this must be the first import in any script that uses zod-to-openapi.
 */
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);
