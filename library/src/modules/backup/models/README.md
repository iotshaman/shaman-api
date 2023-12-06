Depending on the database being targeted for dumping, certain properties are required:

| Database Type | Required Properties |
| ------------- | ------------------- |
| `sqlite`      | `type`, `name`, `filepath` |
| `jsonRepo`    | `type`, `name`, `filepath` |
| `mysql`       | `type`, `name`, `username`, `password` |


Example shaman-dump.config file:

```json
{
  "allowUnsecureConnection": false,
  "databases": [
    {
      "type": "sqlite",
      "name": "mySqliteDb",
      "filepath": "./path/to/database.sqlite"
    },
    {
      "type": "jsonRepo",
      "name": "myJsonRepoDb",
      "filepath": "./path/to/database.json"
    },
    {
      "type": "mysql",
      "name": "mySqlDbName",
      "username": "myDbUser",
      "password": "myDbUserPassword"
    }
  ]
}
```
