// src/database.config.ts
import { User } from 'src/auth/entities/user.entity';
import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
    'refresh-jwt',
    (): JwtModuleOptions => ({
        secret: process.env.REFRESH_JWT_SECRET,
        signOptions: {
            expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
        }
    })

)
