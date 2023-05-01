import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export class PythonServerConfig {
  public static HOST: any = process.env.PYTHON_SERVER_HOST;
  public static PORT: any = process.env.PYTHON_SERVER_PORT;
  public static CONNECTION: any = `http://${PythonServerConfig.HOST}:${PythonServerConfig.PORT}`;

  public static updateConfig(host: string, port: string) {
    PythonServerConfig.HOST = host;
    PythonServerConfig.PORT = port;
    PythonServerConfig.CONNECTION = `http://${PythonServerConfig.HOST}:${PythonServerConfig.PORT}`;
  }
}
