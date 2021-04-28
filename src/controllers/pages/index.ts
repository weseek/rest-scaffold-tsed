import {
  Constant, Controller, Get, HeaderParams, QueryParams, Req, Res, View,
} from '@tsed/common';
import { Hidden, SwaggerSettings } from '@tsed/swagger';
import { Returns } from '@tsed/schema';

import unirest from 'unirest';
import { resourceLimits } from 'worker_threads';
import axios from 'axios';
import { SearchResult } from '~/interfaces/searchresult';

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
  @View('review.ejs')
  @(Returns(200, String).ContentType('text/html'))
  async review(@QueryParams('destinationId') specifiedDestinationId: string, @Res() res: Res): Promise<any> {
    const destinationId = specifiedDestinationId || '1506246';

    const hotelres = await axios.get('https://hotels4.p.rapidapi.com/properties/list', {
      headers: {
        'x-rapidapi-key': process.env.X_RAPIDAPI_KEY,
        'x-rapidapi-host': 'hotels4.p.rapidapi.com',
        useQueryString: true,
      },
      params: {
        adalts: '2',
        pageNumber: '1',
        destinationId,
        pageSize: '10',
        // sortOrder: 'PRICE_HIGHEST_FIRST',
        sortOrder: 'PRICE',
        locale: 'en_US',
        currency: 'USD',
      },
    });

    const results: SearchResult[] = hotelres.data.data.body.searchResults.results.map((result) => {
      console.log(result);
      return {
        price: result.ratePlan.price.exactCurrent,
        thumbnailUrl: result.optimizedThumbUrls.srpDesktop,
      };
    });

    console.log({ results });

    return { results };
  }

}
