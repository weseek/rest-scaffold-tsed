import {
  Constant, Controller, Get, HeaderParams, QueryParams, Req, Res, View,
} from '@tsed/common';
import { Hidden, SwaggerSettings } from '@tsed/swagger';
import { Returns } from '@tsed/schema';

import unirest from 'unirest';

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

  @Get('/review')
  @(Returns(200, String).ContentType('text/json'))
  review(@QueryParams('destinationId') specifiedDestinationId: string, @Res() res: Res): void {
    const destinationId = specifiedDestinationId || '1506246';

    const hotelreq = unirest('GET', 'https://hotels4.p.rapidapi.com/properties/list');
    hotelreq.query({
      pageNumber: '1',
      destinationId,
      pageSize: '25',
      sortOrder: 'PRICE_HIGHEST_FIRST',
      locale: 'en_US',
      currency: 'USD',
    });
    hotelreq.headers({
      'x-rapidapi-key': process.env.X_RAPIDAPI_KEY,
      'x-rapidapi-host': 'hotels4.p.rapidapi.com',
      useQueryString: true,
    });
    hotelreq.end((hotelres) => {
      if (hotelres.error) throw new Error(hotelres.error);
      const thumnails = hotelres.body.data.body.searchResults.results.map((result) => {
        console.log(result);
        return result.optimizedThumbUrls.srpDesktop;
      });
      console.log(thumnails);
    });
  }

}
