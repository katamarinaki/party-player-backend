import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import fs from 'fs'

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./secrets/private-key.pem'),
    cert: fs.readFileSync('./secrets/public-certificate.pem'),
  }
  const app = await NestFactory.create(AppModule, { httpsOptions })
  app.use(helmet())
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT)
}
bootstrap()
