import EnvironmentVariables from "./EnvironmentVariables";

/**
 * @author Kingsley Baah Brew <kingsleybrew@gmail.com>
 * @params key | string
 * @todo This decorator accepts an object key to read data from the .env
 */
export default function Env(key: string) {
    return function(target: any, propertyKey: any) {
        target[propertyKey] = EnvironmentVariables.get(key);
    };
}

