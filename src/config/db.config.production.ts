// src/database.config.ts
import { User } from 'src/auth/entities/user.entity';
import {PostgresConnectionOptions} from 'typeorm/driver/postgres/PostgresConnectionOptions';
export default(): PostgresConnectionOptions=> ({
 
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true, // Set to false for production
   logging: true,
 
}
   
);
