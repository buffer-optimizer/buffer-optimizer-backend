
import express from 'express';
import {Server} from 'typescript-rest';
import getRootDirectory from '../utils/getRootDirectory';
import EnvironmentVariables from '../utils/EnvironmentVariables';

// If Application is on production set application with the production port else use a specified port

let SERVER_PORT = process.env.PORT || EnvironmentVariables.get('PORT');

/**
 * @author Kingsley Baah Brew <kingsleybrew@gmail.com>
 * @param object | any
 * @todo This decorator invokes the host class constructor and initiates express js server and delivers
 *       the express js object and application object as an argument to the host class constructor
 */
function BootstrapApplication<T extends { new(...args:any[]):{} }>(constructor:T) {
  const original = class extends constructor {

    private app: any;

    constructor(...args: any) {
      super(...args);
      const [exp] = args;
      this.app = exp;
    }

    private startApplication() {
      const ROOT_DIR: string = getRootDirectory();
      Server.buildServices(this.app);
      Server.loadServices(this.app,[`${ROOT_DIR}/controllers/*`,`${ROOT_DIR}/models/*`]);
      this.app.listen(SERVER_PORT, function() {
        console.log(`\nServer listening on PORT: ${SERVER_PORT}`);
      });
    }
    // Automatically initiates constructor
    static main = () =>  {
      const app:express.Application = express();
      return new original(app,express).startApplication();
    }
  }
  try {
    original.main();
  } catch(e) {
    console.error(e);
  }
}

export default BootstrapApplication;
