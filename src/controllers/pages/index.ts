import {
  BodyParams,
  Constant, Controller, Get, HeaderParams, Post, QueryParams, Req, Res, View
} from '@tsed/common';
import { Hidden, SwaggerSettings } from '@tsed/swagger';
import { Returns } from '@tsed/schema';
import { markAsUntransferable } from 'worker_threads';

@Hidden()
@Controller('/')
export class IndexCtrl {

  @Constant('swagger')
  swagger: SwaggerSettings[];

  @Get('/')
  @View('index.ejs')
  @(Returns(200, String).ContentType('text/html'))
  get(@HeaderParams('x-forwarded-proto') protocol: string, @HeaderParams('host') host: string) {
    const hostUrl = `${protocol || 'http'}://${host}`;

    return {
      BASE_URL: hostUrl,
      docs: this.swagger.map((conf) => {
        return {
          url: hostUrl + conf.path,
          ...conf,
        };
      }),
    };
  }

  @Post('/saikoro')
  saikoro(@BodyParams() body: any) {
    /**
     * {
     *   allowDuplicates: boolean,
     *   count: number,
     *   persons: [
     *     { name: string, birthday: string (1985/12/11, etc..) },
     *     { name: string, birthday: string (1985/12/11, etc..) },
     *     { name: string, birthday: string (1985/12/11, etc..) }
     *   ]
     * }
     */
    const allowDuplicates: boolean = body.allowDuplicates ? true : false;
    const persons: any[] = body.persons;
    const result: any[] = [];
    [...Array(body.count)].map(() => {
      const random = Math.floor(Math.random() * persons.length);
      result.push(persons[random].name);
      if (!allowDuplicates) {
        persons.splice(random, 1);
      }
    });

    // 選択された name を返す
    return result;
  }

}
