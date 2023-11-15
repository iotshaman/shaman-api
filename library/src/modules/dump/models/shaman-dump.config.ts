export type ShamanDumpConfig = {
  allowInsecureConnection?: boolean;
  databases: DatabaseConfig[];
}

export type DatabaseConfig = {
  type: string;
  name: string;
  filepath?: string;
  username?: string;
  password?: string;
  tables?: string[];
}