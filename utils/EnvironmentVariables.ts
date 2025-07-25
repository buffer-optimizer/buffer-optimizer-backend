import env from 'dotenv';

/**
 * @author Kingsley Baah Brew <kingsleybrew@gmail.com>
 * @class EnvironmentVariables
 * @todo It has a static get method that can read .env data
 *       It behaves the same way as the decorator named @Env however, EnvironmentVariables is not a decorator
 */
export default class EnvironmentVariables {
    /**
     * @param key | string
     */
    static get(key: string) {
        try {
            const data: any = env.config().parsed;
            if(key in data) {
                return data[key];
            } 
            throw  `property '${key}' does not exist in .env`;
        } catch (err) {
            console.error(err);
        }
    }

}