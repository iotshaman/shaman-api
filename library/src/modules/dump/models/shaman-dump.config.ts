export type ShamanDumpConfig = {
  allowUnsecureConnection?: boolean;
  databases: DatabaseConfig[];
}

export type DatabaseConfig = {
  type: string;
  name: string;
  filepath?: string;
  username?: string;
  password?: string;
}