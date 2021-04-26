import { Configuration, Inject } from '@tsed/di';
import { PlatformApplication } from '@tsed/common';
import '@tsed/platform-express'; // /!\ keep this import
import session from 'express-session';
import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import cors from 'cors';

import '@tsed/ajv';
import '@tsed/swagger';

import { IndexCtrl } from './controllers/pages';


export const rootDir = __dirname;


@Configuration({
  rootDir,
  acceptMimes: ['application/json'],
  httpPort: process.env.PORT || 4000,
  httpsPort: false, // CHANGE
  mount: {
    '/': [
      `${rootDir}/controllers/*.ts`,
      `${rootDir}/middlewares/*.ts`,
      IndexCtrl,
    ],
    '/admin': [
      `${rootDir}/controllers/admin/*.ts`,
    ],
  },
  componentsScan: [
    `${rootDir}/protocols/*.ts`,
  ],
  swagger: [
    {
      path: '/docs',
      specVersion: '3.0.1',
    },
  ],
  views: {
    root: `${rootDir}/views`,
    viewEngine: 'ejs',
  },
  exclude: [
    '**/*.spec.ts',
  ],
})
export class Server {

  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  $beforeRoutesInit(): void {
    this.app
      // TODO: 正しく設定
      .use(cors({ origin: '*' }))
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({
        extended: true,
      }))
      .use(session({
        secret: 'mysecretkey',
        resave: true,
        saveUninitialized: true,
        cookie: {
          path: '/',
          httpOnly: true,
          secure: false,
        },
      }));
  }

}
