import { createLogger } from "@/lib/logger";
import { config } from "@/utils/config";

export const logger = createLogger({ level: config.logLevel });
