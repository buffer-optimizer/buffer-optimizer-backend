import {
    Plugin,
    PluginExecutionContext,
    PluginExecutionResult,
    PluginExecutionError,
} from '../utils/buffer-sdk';

export class PluginRegistry {
    private plugins = new Map<string, Plugin>();

    register(plugin: Plugin): void {
        console.log(`Registering plugin: ${plugin.name} (${plugin.id})`);
        this.plugins.set(plugin.id, plugin);
    }

    getPlugin(pluginId: string): Plugin | undefined {
        return this.plugins.get(pluginId);
    }

    getAvailablePlugins(): Plugin[] {
        return Array.from(this.plugins.values()).filter(plugin => plugin.enabled);
    }

    async execute(
        pluginId: string,
        context: PluginExecutionContext
    ): Promise<PluginExecutionResult> {
        const startTime = Date.now();
        const plugin = this.plugins.get(pluginId);

        if (!plugin) {
            throw new PluginExecutionError(
                'PLUGIN_NOT_FOUND',
                `Plugin ${pluginId} not found`,
                pluginId,
                undefined,
                false
            );
        }

        if (!plugin.enabled) {
            throw new PluginExecutionError(
                'PLUGIN_DISABLED',
                `Plugin ${pluginId} is disabled`,
                pluginId,
                undefined,
                true // This is recoverable - can enable the plugin
            );
        }

        try {
            // Initialize plugin
            await plugin.initialize(context);

            // Validate context if plugin has validation
            if (plugin.validate) {
                const isValid = await plugin.validate(context);
                if (!isValid) {
                    throw new PluginExecutionError(
                        'VALIDATION_FAILED',
                        `Plugin ${pluginId} validation failed`,
                        pluginId,
                        { context },
                        true
                    );
                }
            }

            // Execute plugin
            const data = await plugin.execute(context);

            return {
                success: true,
                data,
                executionTime: Date.now() - startTime,
                pluginId,
                metadata: {
                    timestamp: new Date().toISOString(),
                    pluginName: plugin.name,
                    pluginVersion: plugin.version,
                }
            };
        } catch (error) {
            console.error(`Plugin execution failed for ${pluginId}:`, error);

            // If it's already a PluginExecutionError, wrap it in the result
            if (error instanceof PluginExecutionError) {
                return {
                    success: false,
                    error,
                    executionTime: Date.now() - startTime,
                    pluginId,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        pluginName: plugin.name,
                        pluginVersion: plugin.version,
                    }
                };
            }

            // Create a new PluginExecutionError for unexpected errors
            const pluginError = new PluginExecutionError(
                'EXECUTION_FAILED',
                error instanceof Error ? error.message : 'Unknown error',
                pluginId,
                { originalError: error },
                false
            );

            return {
                success: false,
                error: pluginError,
                executionTime: Date.now() - startTime,
                pluginId,
                metadata: {
                    timestamp: new Date().toISOString(),
                    pluginName: plugin.name,
                    pluginVersion: plugin.version,
                },
                warnings: ['Unexpected error occurred during plugin execution']
            };
        } finally {
            // Cleanup if plugin has cleanup method
            if (plugin.cleanup) {
                try {
                    await plugin.cleanup();
                } catch (cleanupError) {
                    console.warn(`Plugin cleanup failed for ${pluginId}:`, cleanupError);
                }
            }
        }
    }

    async executeAll(
        context: PluginExecutionContext,
        options: {
            failFast?: boolean;
            parallel?: boolean;
            filterByCategory?: Plugin['category'];
        } = {}
    ): Promise<Map<string, PluginExecutionResult>> {
        const results = new Map<string, PluginExecutionResult>();

        let availablePlugins = this.getAvailablePlugins();

        // Filter by category if specified
        if (options.filterByCategory) {
            availablePlugins = availablePlugins.filter(
                plugin => plugin.category === options.filterByCategory
            );
        }

        if (options.parallel !== false) {
            // Execute in parallel (default)
            const promises = availablePlugins.map(async (plugin) => {
                try {
                    const result = await this.execute(plugin.id, context);
                    return { pluginId: plugin.id, result };
                } catch (error) {
                    const pluginError = new PluginExecutionError(
                        'EXECUTION_FAILED',
                        error instanceof Error ? error.message : 'Unknown error',
                        plugin.id,
                        { originalError: error },
                        false
                    );

                    return {
                        pluginId: plugin.id,
                        result: {
                            success: false,
                            error: pluginError,
                            executionTime: 0,
                            pluginId: plugin.id,
                            metadata: {
                                timestamp: new Date().toISOString(),
                                pluginName: plugin.name,
                                pluginVersion: plugin.version,
                            }
                        } as PluginExecutionResult
                    };
                }
            });

            const settledResults = await Promise.allSettled(promises);

            settledResults.forEach((settledResult) => {
                if (settledResult.status === 'fulfilled') {
                    const { pluginId, result } = settledResult.value;
                    results.set(pluginId, result);

                    // Check for failFast
                    if (options.failFast && !result.success) {
                        throw result.error || new Error(`Plugin ${pluginId} failed`);
                    }
                } else {
                    console.error('Plugin execution promise rejected:', settledResult.reason);
                }
            });
        } else {
            // Execute sequentially
            for (const plugin of availablePlugins) {
                try {
                    const result = await this.execute(plugin.id, context);
                    results.set(plugin.id, result);

                    // Check for failFast
                    if (options.failFast && !result.success) {
                        throw result.error || new Error(`Plugin ${plugin.id} failed`);
                    }
                } catch (error) {
                    if (options.failFast) {
                        throw error;
                    }

                    const pluginError = new PluginExecutionError(
                        'EXECUTION_FAILED',
                        error instanceof Error ? error.message : 'Unknown error',
                        plugin.id,
                        { originalError: error },
                        false
                    );

                    results.set(plugin.id, {
                        success: false,
                        error: pluginError,
                        executionTime: 0,
                        pluginId: plugin.id,
                        metadata: {
                            timestamp: new Date().toISOString(),
                            pluginName: plugin.name,
                            pluginVersion: plugin.version,
                        }
                    });
                }
            }
        }

        return results;
    }
}